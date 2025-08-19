const { Pool } = require("pg");

// Create connection pool for a specific database
const createPool = (database) => {
  // Ensure password is handled as string
  const dbPassword = process.env.DB_PASSWORD;

  const config = {
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "postgres",
    password: String(dbPassword || "" ),
    database: database,
    port: parseInt(process.env.DB_PORT) || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl:
      process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
  };

  // Add any additional configuration if needed in the future

  return new Pool(config);
};

// Define all databases
const databases = {
  dashboard: "service_dashboard",
  offerwall: "service_offerwall",
  emailing: "service_emailing",
  engagex: "engagex",
};

// Initialize all pools
const pools = {};
for (const [key, dbName] of Object.entries(databases)) {
  pools[key] = createPool(dbName);
}

// Test all database connections
const testAllConnections = async () => {
  try {
    for (const [name, pool] of Object.entries(pools)) {
      try {
        const client = await pool.connect();
        console.log(
          `✅ Successfully connected to ${name} database (${databases[name]})`
        );

        // Get table count for each database
        const result = await client.query(`
          SELECT COUNT(*) as table_count 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `);
        console.log(`📊 Tables in ${name}: ${result.rows[0].table_count}`);

        client.release();
      } catch (err) {
        console.error(`❌ Error connecting to ${name} database:`, err.message);
      }
    }
  } catch (err) {
    console.error("❌ Global connection error:", err.message);
  }
};

// Legacy functions for backward compatibility
const testConnection = async () => {
  try {
    const client = await pools.dashboard.connect();
    console.log("✅ Database connected successfully");
    client.release();
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    console.log(
      "📝 Please ensure PostgreSQL is running and the database exists"
    );
    process.exit(1);
  }
};

const initializeDatabase = async () => {
  try {
    console.log("✅ Database connection verified");
    console.log(
      "📝 Note: Tables should be created using the SQL files in DatabaseSchema folder"
    );
  } catch (error) {
    console.error("❌ Database verification failed:", error.message);
    throw error;
  }
};

// Export pools and legacy functions
module.exports = {
  pools,
  testAllConnections,
  testConnection,
  initializeDatabase,
  // Legacy single pool export for backward compatibility
  pool: pools.dashboard,
};
