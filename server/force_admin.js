const supabase = require('./supabaseClient');

const forceAdmin = async () => {
    const email = 'abiolaquadri111@gmail.com';
    console.log(`Checking user: ${email}`);

    // List users to find the ID (limit 1000, assuming not many users yet)
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
        console.error("Auth Error:", authError);
        return;
    }

    const user = users.find(u => u.email === email);
    if (!user) {
        console.error("User not found in Auth! Please sign up first.");
        return;
    }

    console.log(`User found: ${user.id}`);

    // Check Profile
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profileError && profileError.code !== 'PGRST116') {
        console.error("Profile Fetch Error:", profileError);
    }

    if (!profile) {
        console.log("Profile missing! Creating...");
        const { error: insertError } = await supabase.from('profiles').insert([{
            id: user.id,
            username: 'Admin',
            role: 'admin'
        }]);
        if (insertError) console.error("Insert Error:", insertError);
        else console.log("Profile created as Admin.");
    } else {
        console.log(`Current Role: ${profile.role}`);
        if (profile.role !== 'admin') {
            console.log("Updating to admin...");
            const { error: updateError } = await supabase.from('profiles').update({ role: 'admin' }).eq('id', user.id);
            if (updateError) console.error("Update Error:", updateError);
            else console.log("Updated to Admin.");
        } else {
            console.log("Success: User is already Admin.");
        }
    }
};

forceAdmin();
