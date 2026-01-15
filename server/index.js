const express = require('express');
const cors = require('cors');
const supabase = require('./supabaseClient');

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
            const [totalArticlesRes, totalMediaRes, pendingCommentsRes, viewsDataRes, categoriesRes] = await Promise.all([
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('blogs').select('*', { count: 'exact', head: true }).not('image_url', 'is', null),
                supabase.from('comments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
                supabase.from('blogs').select('views'),
                supabase.from('categories').select('*', { count: 'exact', head: true })
            ]);

            const totalArticles = totalArticlesRes.count || 0;
            const totalMedia = totalMediaRes.count || 0;
            const pendingCommentsCount = pendingCommentsRes.count || 0;
            const totalViewsCount = viewsDataRes.data?.reduce((acc, b) => acc + (parseInt(b.views) || 0), 0) || 0;
            const totalCategories = categoriesRes.count || 0;

            return {
                totalArticles,
                totalCategories,
                totalMedia,
                pendingComments: pendingCommentsCount,
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

        const [stats, recentPosts, recentComments, growthRaw, engagementRaw] = await Promise.all([
            statsPromise, recentPostsPromise, recentCommentsPromise, growthPromise, engagementPromise
        ]);

        // Process Analytics
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const processByMonth = (items, key = 'created_at') => {
            const counts = {};
            items.forEach(item => {
                if (item[key]) {
                    const date = new Date(item[key]);
                    const m = months[date.getMonth()];
                    counts[m] = (counts[m] || 0) + 1;
                }
            });
            return months.map(m => ({ month: m, value: counts[m] || 0 }));
        };

        const growthData = processByMonth(growthRaw.data || []).map(d => ({ month: d.month, posts: d.value }));
        const engagementData = processByMonth(engagementRaw.data || []);

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                recentPosts: recentPosts.data || [],
                recentComments: recentComments.data || [],
                growth: growthData,
                engagement: engagementData
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
            const [totalArticlesRes, totalMediaRes, pendingCommentsRes, categoriesRes] = await Promise.all([
                supabase.from('blogs').select('*', { count: 'exact', head: true }),
                supabase.from('blogs').select('*', { count: 'exact', head: true }).not('image_url', 'is', null),
                supabase.from('comments').select('*', { count: 'exact', head: true }),
                supabase.from('categories').select('*', { count: 'exact', head: true })
            ]);
            return {
                totalArticles: totalArticlesRes.count || 0,
                totalMedia: totalMediaRes.count || 0,
                pendingComments: pendingCommentsRes.count || 0,
                totalCategories: categoriesRes.count || 0
            };
        })();

        const growthPromise = supabase.from('blogs').select('created_at');
        const engagementPromise = supabase.from('comments').select('created_at');

        const [stats, growthRaw, engagementRaw] = await Promise.all([
            statsPromise, growthPromise, engagementPromise
        ]);

        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const processByMonth = (items, key = 'created_at') => {
            const counts = {};
            items.forEach(item => {
                if (item[key]) {
                    const date = new Date(item[key]);
                    const m = months[date.getMonth()];
                    counts[m] = (counts[m] || 0) + 1;
                }
            });
            return months.map(m => ({ month: m, value: counts[m] || 0 }));
        };

        const growthData = processByMonth(growthRaw.data || []).map(d => ({ month: d.month, posts: d.value }));
        const engagementData = processByMonth(engagementRaw.data || []);

        res.status(200).json({
            status: 'success',
            data: {
                stats,
                growth: growthData,
                engagement: engagementData
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
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        const { data: { user }, error: authError } = await supabase.auth.getUser(token);
        if (authError || !user) return res.status(401).json({ message: 'Invalid token' });

        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile?.role !== 'admin') return res.status(403).json({ message: 'Admins only' });

        const { error } = await supabase
            .from('blogs')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.status(204).send();
    } catch (err) {
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


const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
