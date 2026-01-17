const supabase = require('../server/supabaseClient');

const countries = ['Nigeria', 'United States', 'United Kingdom', 'Ghana', 'Canada', 'South Africa'];
const devices = ['mobile', 'desktop', 'tablet'];
const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge'];
const osMap = {
    'mobile': ['iOS', 'Android'],
    'desktop': ['Windows', 'Mac OS', 'Linux'],
    'tablet': ['iOS', 'Android']
};

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seed = async () => {
    console.log("Seeding analytics data...");
    const rows = [];

    for (let i = 0; i < 50; i++) { // Generate 50 random visits
        const device = getRandom(devices);
        const os = getRandom(osMap[device]);
        const browser = getRandom(browsers);
        const country = getRandom(countries);

        // Random time in last 7 days
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 7));

        rows.push({
            device_type: device,
            browser,
            os,
            country,
            referrer: Math.random() > 0.5 ? 'https://google.com' : 'Direct',
            path: '/',
            created_at: date.toISOString()
        });
    }

    const { error } = await supabase.from('analytics').insert(rows);

    if (error) {
        console.error("Error seeding:", error.message);
    } else {
        console.log("Successfully seeded 50 analytics entries.");
    }
    process.exit();
};

seed();
