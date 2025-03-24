import sql from "mssql";

const config = {
  user: "sa_TNB",
  password: "Ch!r@g@123456",
  server: "mssql-116808-0.cloudclusters.net",//"43.251.72.103", // You can use 'localhost\\instance' to connect to named instance
  port: 19246,
  database: "BillingMaster",
  options: {
    encrypt: true, // Use this if you're on Windows Azure
    trustServerCertificate: true, // Change to true for local dev / self-signed certs
    serverName: 'localhost',
  },
};

// user: "sa_TNB",
// password: "Ch!r@g@123456",
// server: "mssql-116808-0.cloudclusters.net",//"43.251.72.103", // You can use 'localhost\\instance' to connect to named instance
// port: 19246,

// Connect to the database
const connectDB = async () => {
  try {
    let pool = await sql.connect(config);
    console.log("🚀 Connected to SQL Server");
    return pool;
  } catch (err) {
    console.error("SQL error", err);
    process.exit(1); // Exit process with failure
  }
};

// Export the pool promise
export { connectDB, sql };
