const supabase = require('../server/supabaseClient');

const clearAnalytics = async () => {
    console.log("Clearing analytics data...");
    // Delete all rows where id is not null (effectively all rows)
    const { error } = await supabase.from('analytics').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.error("Error clearing analytics:", error.message);
    } else {
        console.log("Successfully cleared analytics table.");
    }
    process.exit();
};

clearAnalytics();
