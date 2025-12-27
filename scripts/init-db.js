const db = require('../db/database');

async function init() {
    try {
        await db.init();
        console.log('✅ Database initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to initialize database:', error);
        process.exit(1);
    }
}

init();

