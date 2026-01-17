const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');
const UAParser = require('ua-parser-js');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// --- HELPER WRAPPERS ---
const getPagination = (page, size) => {
    const limit = size ? +size : 6;
    const from = page ? (page - 1) * limit : 0;
    const to = page ? from + limit - 1 : limit - 1;
    return { from, to };
};

// --- AUTH ROUTES ---

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const name = `${firstName} ${lastName}`;

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name, username: name.replace(/\s+/g, '').toLowerCase() }
            }
        });

        if (error) throw error;

        // Create profile entry
        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        username: name,
                        // Default avatar or empty
                    }
                ]);
            if (profileError) console.error("Profile creation error:", profileError);
        }

        res.status(201).json({ status: 'success', token: data.session?.access_token, data: { user: data.user } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Signin
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        // Admin Check
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

        if (profileError || profileData?.role !== 'admin') {
            console.log("Admin Check Failed:", { profileError, role: profileData?.role, id: data.user.id });
            return res.status(403).json({ status: 'fail', message: 'Access denied. Admins only.' });
        }

        res.status(200).json({ status: 'success', token: data.session.access_token, data: { user: data.user } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// --- BLOG ROUTES ---

// Get All Blogs
app.get('/api/blogs', async (req, res) => {
    try {
        const { page = 1, limit = 6, tags, status, query: searchQuery } = req.query;
        const { from, to } = getPagination(page, limit);

        let query = supabase
            .from('blogs')
            .select('id, title, image_url, tags, status, views, created_at, author_id, profiles(username, avatar_url), comments(count)', { count: 'exact' })
            .eq('comments.status', 'approved')
            .order('created_at', { ascending: false })
            .range(from, to);

        if (status && status.toLowerCase() !== 'all') {
            query = query.eq('status', status);
        } else if (!status) {
            query = query.eq('status', 'published');
        }

        if (tags && tags !== 'All') {
            query = query.contains('tags', [tags]);
        }

        if (searchQuery) {
            query = query.ilike('title', `%${searchQuery}%`);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        // Simplify comment count structure
        const blogsWithCounts = data.map(blog => ({
            ...blog,
            comment_count: blog.comments?.[0]?.count || 0
        }));

        res.status(200).json({ status: 'success', results: count, data: { blogs: blogsWithCounts } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get Single Blog
app.get('/api/blogs/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Increment views - improved error handling
        try {
            const { error: rpcError } = await supabase.rpc('increment_views', { blog_id: parseInt(id) });
            if (rpcError) console.error("RPC Error (increment_views):", rpcError);
        } catch (err) {
            console.error("RPC catch block:", err);
        }

        const { data, error } = await supabase
            .from('blogs')
            .select('*, profiles(username, avatar_url), comments(count)')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Add comment count
        const blog = {
            ...data,
            comment_count: data.comments?.[0]?.count || 0
        };

        res.status(200).json({ status: 'success', data: { blog } });
    } catch (err) {
        res.status(404).json({ status: 'fail', message: err.message });
    }
});

// Get Comments for a Blog
app.get('/api/blogs/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url)')
            .eq('blog_id', id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ status: 'success', data: { comments: data } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Post a Comment (Authenticated or Guest)
app.post('/api/blogs/:id/comments', async (req, res) => {
    try {
        const { id } = req.params;
        const { content, author_name, author_email } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        let userId = null;
        let username = 'Guest';

        // Try to authenticate if token is provided
        if (token) {
            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser(token);
                if (!authError && user) {
                    userId = user.id;
                    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
                    username = profile?.username || 'Authenticated User';
                }
            } catch (err) {
                // Token invalid but allow as guest
                console.log('Token validation failed, posting as guest');
            }
        }

        // If not authenticated, use provided name or default to Guest
        if (!userId && author_name) {
            username = author_name;
        }

        const { data, error } = await supabase
            .from('comments')
            .insert([{
                blog_id: id,
                author_id: userId, // Will be null for guests
                content,
                author_name: username // Store name for display
            }])
            .select()
            .single();

        if (error) throw error;

        // Create Notification for Admin
        await supabase.from('notifications').insert([{
            type: 'comment',
            message: `New comment from ${username}: "${content.substring(0, 30)}..."`,
            is_read: false
        }]);

        res.status(201).json({ status: 'success', data: { comment: data } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get All Comments (Admin)
app.get('/api/admin/comments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url), blogs(title)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ status: 'success', data: { comments: data } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Moderate Comment (Approve/Reject)
app.patch('/api/admin/comments/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const { data, error } = await supabase
            .from('comments')
            .update({ status })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.status(200).json({ status: 'success', data: data[0] });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Delete Comment
app.delete('/api/admin/comments/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('comments')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.status(204).send();
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get Stats (Admin only)
app.get('/api/admin/stats', async (req, res) => {
    try {
        const { count: totalArticles } = await supabase.from('blogs').select('*', { count: 'exact', head: true });
        const { count: publishedArticles } = await supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'published');
        const { count: draftArticles } = await supabase.from('blogs').select('*', { count: 'exact', head: true }).eq('status', 'draft');

        // Fetch all tags to calculate unique categories
        const { data: blogsData } = await supabase.from('blogs').select('tags');
        const allTags = blogsData?.reduce((acc, blog) => [...acc, ...(blog.tags || [])], []) || [];
        const totalCategories = new Set(allTags).size;

        // Media count (posts with images)
        const { count: totalMedia } = await supabase.from('blogs').select('*', { count: 'exact', head: true }).not('image_url', 'is', null);

        // Pending comments (assuming a status or just total for now)
        const { count: pendingComments } = await supabase.from('comments').select('*', { count: 'exact', head: true });

        // Total Views
        const { data: viewsData } = await supabase.from('blogs').select('views');
        const totalViewsCount = viewsData?.reduce((acc, b) => acc + (parseInt(b.views) || 0), 0) || 0;

        res.status(200).json({
            status: 'success',
            data: {
                totalArticles: totalArticles || 0,
                publishedArticles: publishedArticles || 0,
                draftArticles: draftArticles || 0,
                totalCategories: totalCategories || 0,
                totalMedia: totalMedia || 0,
                pendingComments: pendingComments || 0,
                totalViews: totalViewsCount > 1000 ? `${(totalViewsCount / 1000).toFixed(1)}k` : totalViewsCount
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Recent Comments (Admin only)
app.get('/api/admin/recent-comments', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('comments')
            .select('*, profiles(username, avatar_url), blogs(title)')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;
        res.status(200).json({ status: 'success', data: data || [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Create Blog (Protected)
app.post('/api/blogs', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

        const { title, content, body, tags, image_url, status, reading_time } = req.body;

        const { data, error } = await supabase
            .from('blogs')
            .insert([
                {
                    title,
                    content: content || body,
                    tags,
                    image_url,
                    status: status || 'published',
                    author_id: user.id,
                    reading_time
                }
            ])
            .select();

        if (error) throw error;
        res.status(201).json({ status: 'success', data: { blog: data[0] } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Combined Dashboard Summary (Admin)
app.get('/api/admin/dashboard-summary', async (req, res) => {
    try {
        // [1] Stats
        const statsPromise = (async () => {
            const [totalArticlesRes, totalMediaRes, pendingCommentsRes, totalCommentsRes, viewsDataRes, categoriesRes] = await Promise.all([
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('blogs').select('*', { count: 'exact', head: true }).not('image_url', 'is', null),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('comments').select('*', { count: 'exact', head: true }), // Total Comments
                supabase.from('blogs').select('views'),
                supabase.from('categories').select('*', { count: 'exact', head: true })
            ]);

            const totalArticles = totalArticlesRes.count || 0;
            const totalMedia = totalMediaRes.count || 0;
            const pendingCommentsCount = pendingCommentsRes.count || 0;
            const totalCommentsCount = totalCommentsRes.count || 0;
            const totalViewsCount = viewsDataRes.data?.reduce((acc, b) => acc + (parseInt(b.views) || 0), 0) || 0;
            const totalCategories = categoriesRes.count || 0;

            return {
                totalArticles,
                totalCategories,
                totalMedia,
                pendingComments: pendingCommentsCount,
                totalComments: totalCommentsCount,
                totalViews: totalViewsCount > 1000 ? `${(totalViewsCount / 1000).toFixed(1)}k` : totalViewsCount
            };
        })();

        // [2] Recent Posts
        const recentPostsPromise = supabase
            .from('blogs')
            .select('id, title, status, created_at')
            .order('created_at', { ascending: false })
            .limit(5);

        // [3] Recent Comments
        const recentCommentsPromise = supabase
            .from('comments')
            .select('*, profiles(username, avatar_url), blogs(title)')
            .order('created_at', { ascending: false })
            .limit(5);

        // [4] Growth (Post volume)
        const growthPromise = supabase.from('blogs').select('created_at');

        // [5] Engagement (Comment volume)
        const engagementPromise = supabase.from('comments').select('created_at');

        const { period = 'year' } = req.query; // 'day', 'week', 'year'

        const [stats, recentPosts, recentComments, growthRaw, engagementRaw] = await Promise.all([
            statsPromise, recentPostsPromise, recentCommentsPromise, growthPromise, engagementPromise
        ]);

        const processAnalytics = (items, period) => {
            const now = new Date();
            const counts = {};

            if (period === 'day') {
                // Hourly (00:00 - 23:00) for today
                const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
                labels.forEach(l => counts[l] = 0);

                items.forEach(item => {
                    const d = new Date(item.created_at);
                    if (d.toDateString() === now.toDateString()) {
                        const hour = `${d.getHours().toString().padStart(2, '0')}:00`;
                        counts[hour]++;
                    }
                });
                return labels.map(label => ({ label, value: counts[label] }));
            } else if (period === 'week') {
                // Last 7 days
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const labels = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    const dayName = days[d.getDay()];
                    labels.push({ date: d.toISOString().split('T')[0], label: dayName });
                    counts[d.toISOString().split('T')[0]] = 0;
                }

                items.forEach(item => {
                    const dStr = new Date(item.created_at).toISOString().split('T')[0];
                    if (counts[dStr] !== undefined) counts[dStr]++;
                });

                return labels.map(l => ({ label: l.label, value: counts[l.date] }));
            } else {
                // Yearly (Jan-Dec) for current year
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                months.forEach(m => counts[m] = 0);

                items.forEach(item => {
                    const d = new Date(item.created_at);
                    if (d.getFullYear() === now.getFullYear()) {
                        counts[months[d.getMonth()]]++;
                    }
                });
                return months.map(m => ({ label: m, value: counts[m] }));
            }
        };

        const growthData = processAnalytics(growthRaw.data || [], period).map(d => ({ month: d.label, posts: d.value }));
        const engagementData = processAnalytics(engagementRaw.data || [], period).map(d => ({ month: d.label, value: d.value }));

        // Mock Demographics Data (since we don't have geo-IP tracking yet)
        const demographicsData = [
            { location: "Nigeria", percentage: 45 },
            { location: "United States", percentage: 25 },
            { location: "United Kingdom", percentage: 15 },
            { location: "Ghana", percentage: 10 },
            { location: "Others", percentage: 5 }
        ];

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                recentPosts: recentPosts.data || [],
                recentComments: recentComments.data || [],
                growth: growthData,
                engagement: engagementData,
                demographics: demographicsData
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Consolidated Analytics Summary (Admin)
app.get('/api/admin/analytics/summary', async (req, res) => {
    try {
        const statsPromise = (async () => {
            const [totalArticlesRes, totalMediaRes, pendingCommentsRes, totalCommentsRes, categoriesRes] = await Promise.all([
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('blogs').select('*', { count: 'exact', head: true }).not('image_url', 'is', null),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('comments').select('*', { count: 'exact', head: true }),
                supabase.from('categories').select('*', { count: 'exact', head: true })
            ]);
            return {
                totalArticles: totalArticlesRes.count || 0,
                totalMedia: totalMediaRes.count || 0,
                pendingComments: pendingCommentsRes.count || 0,
                totalComments: totalCommentsRes.count || 0,
                totalCategories: categoriesRes.count || 0
            };
        })();

        const growthPromise = supabase.from('blogs').select('created_at');
        const engagementPromise = supabase.from('comments').select('created_at');

        const { period = 'year', growthPeriod: gp, engagementPeriod: ep } = req.query;
        const growthPeriod = gp || period;
        const engagementPeriod = ep || period;

        const [stats, growthRaw, engagementRaw] = await Promise.all([
            statsPromise, growthPromise, engagementPromise
        ]);

        const processAnalytics = (items, period) => {
            const now = new Date();
            const counts = {};

            if (period === 'day') {
                // Hourly (00:00 - 23:00) for today
                const labels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);
                labels.forEach(l => counts[l] = 0);

                items.forEach(item => {
                    const d = new Date(item.created_at);
                    if (d.toDateString() === now.toDateString()) {
                        const hour = `${d.getHours().toString().padStart(2, '0')}:00`;
                        counts[hour]++;
                    }
                });
                return labels.map(label => ({ label, value: counts[label] }));
            } else if (period === 'week') {
                // Last 7 days
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                const labels = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(now.getDate() - i);
                    const dayName = days[d.getDay()];
                    labels.push({ date: d.toISOString().split('T')[0], label: dayName });
                    counts[d.toISOString().split('T')[0]] = 0;
                }

                items.forEach(item => {
                    const dStr = new Date(item.created_at).toISOString().split('T')[0];
                    if (counts[dStr] !== undefined) counts[dStr]++;
                });

                return labels.map(l => ({ label: l.label, value: counts[l.date] }));
            } else {
                // Yearly (Jan-Dec) for current year
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                months.forEach(m => counts[m] = 0);

                items.forEach(item => {
                    const d = new Date(item.created_at);
                    if (d.getFullYear() === now.getFullYear()) {
                        counts[months[d.getMonth()]]++;
                    }
                });
                return months.map(m => ({ label: m, value: counts[m] }));
            }
        };

        // Map 'value' to 'posts' for frontend compatibility if needed, or simply use 'value' generic
        const growthData = processAnalytics(growthRaw.data || [], growthPeriod).map(d => ({ month: d.label, posts: d.value }));
        // Note: Kept 'month' and 'posts' keys to minimize frontend breakage initially, but 'month' now contains generic labels (Hours, Days, Months)

        const engagementData = processAnalytics(engagementRaw.data || [], engagementPeriod).map(d => ({ month: d.label, value: d.value }));

        // Fetch Demographics & Devices from Analytics Table
        let demographicsData = [];
        let deviceData = [];

        try {
            const { data: analyticsData, error: analyticsError } = await supabase
                .from('analytics')
                .select('country, device_type');

            if (!analyticsError && analyticsData && analyticsData.length > 0) {
                // Process Demographics
                const countryCounts = {};
                const deviceCounts = {};

                analyticsData.forEach(d => {
                    // Country
                    const country = d.country === 'Unknown' ? 'Unknown Location' : d.country;
                    countryCounts[country] = (countryCounts[country] || 0) + 1;

                    // Device
                    const device = d.device_type || 'desktop';
                    deviceCounts[device] = (deviceCounts[device] || 0) + 1;
                });

                const total = analyticsData.length;

                // Format Demographics
                demographicsData = Object.entries(countryCounts)
                    .map(([loc, count]) => ({ location: loc, percentage: Math.round((count / total) * 100) }))
                    .sort((a, b) => b.percentage - a.percentage);

                if (demographicsData.length > 5) {
                    const top4 = demographicsData.slice(0, 4);
                    const othersLegacy = demographicsData.slice(4).reduce((acc, curr) => acc + curr.percentage, 0);
                    top4.push({ location: "Others", percentage: othersLegacy });
                    demographicsData = top4;
                }

                // Format Devices
                deviceData = Object.entries(deviceCounts)
                    .map(([device, count]) => ({ device, count, percentage: Math.round((count / total) * 100) }))
                    .sort((a, b) => b.percentage - a.percentage);

            } else {
                // No real data
                demographicsData = [];
                deviceData = [];
            }
        } catch (e) {
            console.error("Analytics fetch error:", e);
        }

        // If empty (no table or no data), maybe show nothing or specific "No Data" state in frontend
        // The frontend handles empty arrays gracefully usually, but let's ensure we return arrays.

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                growth: growthData,
                engagement: engagementData,
                demographics: demographicsData,
                devices: deviceData
            }
        });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Update Blog (Protected)
app.patch('/api/blogs/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

        const { title, content, body, tags, image_url, status, reading_time } = req.body;

        const { data, error } = await supabase
            .from('blogs')
            .update({
                title,
                content: content || body,
                tags,
                image_url,
                status,
                reading_time,
                updated_at: new Date()
            })
            .eq('id', req.params.id)
            .select();

        if (error) throw error;
        res.status(200).json({ status: 'success', data: { blog: data[0] } });
    } catch (err) {
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Delete Blog (Protected)
app.delete('/api/blogs/:id', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("Delete Request Auth Header:", authHeader);
        const token = authHeader?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) {
            console.log("Auth Error:", authError);
            return res.status(401).json({ message: `Invalid token: ${authError?.message || 'User not found'}` });
        }

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

        console.log("Attempting to delete blog with ID:", req.params.id);

        // Only select 'id' to avoid returning massive base64 image data
        const { data: deletedData, error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', req.params.id)
            .select('id');

        console.log("Delete result - deleted IDs:", deletedData?.map(d => d.id), "error:", error);

        if (error) {
            console.log("Delete error:", error);
            throw error;
        }

        if (!deletedData || deletedData.length === 0) {
            console.log("No rows were deleted. RLS policy may be blocking the delete.");
            return res.status(400).json({ message: 'Delete failed. No rows affected. Check RLS policies.' });
        }

        console.log("Successfully deleted blog ID:", deletedData[0].id);
        res.status(204).send();
    } catch (err) {
        console.log("Delete catch error:", err);
        res.status(400).json({ status: 'fail', message: err.message });
    }
});

// Get Categories with Counts
app.get('/api/categories', async (req, res) => {
    try {
        // Fetch categories
        const { data: categories, error } = await supabase.from('categories').select('*').order('name');
        if (error) throw error;

        // Fetch all blog tags to calculate counts
        // Note: fetching all blogs' tags might be heavy in production, but okay for small scale. 
        // A dedicated counter cache trigger is better for scale.
        const { data: blogs } = await supabase.from('blogs').select('tags');

        const counts = {};
        blogs?.forEach(blog => {
            if (Array.isArray(blog.tags)) {
                blog.tags.forEach(tag => {
                    counts[tag] = (counts[tag] || 0) + 1;
                });
            }
        });

        // Merge counts
        const enhancedCategories = categories.map(cat => ({
            ...cat,
            count: counts[cat.name] || 0
        }));

        res.status(200).json({ status: 'success', data: { categories: enhancedCategories } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Get Notifications
app.get('/api/admin/notifications', async (req, res) => {
    try {
        const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10);
        if (error) throw error;
        res.status(200).json({ status: 'success', data: { notifications: data } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Global Search (Admin)
app.get('/api/admin/global-search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.status(200).json({ status: 'success', data: { results: [] } });

        // Search Blogs
        const { data: blogs } = await supabase.from('blogs').select('id, title, status').ilike('title', `%${q}%`).limit(5);
        // Search Comments
        const { data: comments } = await supabase.from('comments').select('id, content, blog_id').ilike('content', `%${q}%`).limit(5);
        // Search Profiles
        const { data: profiles } = await supabase.from('profiles').select('id, username').ilike('username', `%${q}%`).limit(5);

        const results = [
            ...(blogs || []).map(b => ({ type: 'post', id: b.id, label: b.title, status: b.status, link: `/admin/posts` })), // Link to posts (filter?)
            ...(comments || []).map(c => ({ type: 'comment', id: c.id, label: `"${c.content.substring(0, 30)}..."`, link: `/admin/comments` })),
            ...(profiles || []).map(p => ({ type: 'user', id: p.id, label: p.username, link: `/admin/profile` }))
        ];

        res.status(200).json({ status: 'success', data: { results } });
    } catch (err) {
        res.status(500).json({ status: 'fail', message: err.message });
    }
});

// Analytics Tracking Endpoint
app.post('/api/track', async (req, res) => {
    try {
        const userAgent = req.headers['user-agent'];
        const { referrer, path, country } = req.body;

        // Parse User Agent
        const parser = new UAParser(userAgent);
        const result = parser.getResult();

        const deviceType = result.device.type || 'desktop'; // Default to desktop if undefined (mobile/tablet/console usually defined)
        const browser = result.browser.name;
        const os = result.os.name;

        // Insert into analytics table
        // Note: 'analytics' table must exist.
        const { error } = await supabase.from('analytics').insert({
            device_type: deviceType,
            browser,
            os,
            referrer,
            path,
            country: country || 'Unknown' // Ideally passed from client or determined by IP middleware
        });

        if (error) {
            console.log("Analytics Insert Error (Table might not exist):", error.message);
            // Don't fail the request significantly, just log
            return res.status(200).json({ status: 'ok', warning: 'Tracking failed silently' });
        }

        res.status(200).json({ status: 'success' });
    } catch (err) {
        console.log("Tracking Error:", err);
        res.status(200).json({ status: 'error', message: err.message }); // Return 200 to avoid client errors
    }
});


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
