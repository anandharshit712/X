const fs = require("fs");
const path = require("path");

// Function to update a file from MySQL to PostgreSQL syntax
function updateFileToPostgreSQL(filePath) {
  try {
    let content = fs.readFileSync(filePath, "utf8");

    // Replace pool.execute with pool.query
    content = content.replace(/pool\.execute\(/g, "pool.query(");

    // Replace ? placeholders with $1, $2, etc.
    let placeholderCount = 0;
    content = content.replace(/\?/g, () => {
      placeholderCount++;
      return `$${placeholderCount}`;
    });

    // Reset placeholder count for each query
    content = content.replace(/pool\.query\(/g, (match) => {
      placeholderCount = 0;
      return match;
    });

    // Replace array destructuring [result] with result
    content = content.replace(
      /const \[([^\]]+)\] = await pool\.query/g,
      "const $1 = await pool.query"
    );

    // Replace .length with .rows.length
    content = content.replace(/\.length/g, ".rows.length");

    // Replace array access [0] with .rows[0]
    content = content.replace(/\[0\]/g, ".rows[0]");

    // Replace .insertId with .rows[0].id (for PostgreSQL)
    content = content.replace(/\.insertId/g, ".rows[0].id");

    // Replace MySQL DATE_SUB with PostgreSQL interval
    content = content.replace(
      /DATE_SUB\(NOW\(\), INTERVAL (\d+) DAY\)/g,
      "NOW() - INTERVAL '$1 days'"
    );

    // Replace MySQL DATE_SUB with PostgreSQL interval for other intervals
    content = content.replace(
      /DATE_SUB\(NOW\(\), INTERVAL (\d+) HOUR\)/g,
      "NOW() - INTERVAL '$1 hours'"
    );
    content = content.replace(
      /DATE_SUB\(NOW\(\), INTERVAL (\d+) MINUTE\)/g,
      "NOW() - INTERVAL '$1 minutes'"
    );

    // Add RETURNING clause for INSERT statements
    content = content.replace(
      /INSERT INTO ([^(]+) \(([^)]+)\) VALUES \(([^)]+)\)/g,
      (match, table, columns, values) => {
        // Extract the first column name to return its ID
        const firstCol = columns.split(",")[0].trim();
        return `INSERT INTO ${table} (${columns}) VALUES (${values}) RETURNING ${firstCol}`;
      }
    );

    // Fix array access for result data
    content = content.replace(/result\[0\]/g, "result.rows[0]");
    content = content.replace(/users\[0\]/g, "users.rows[0]");
    content = content.replace(/offers\[0\]/g, "offers.rows[0]");
    content = content.replace(/transactions\[0\]/g, "transactions.rows[0]");
    content = content.replace(/images\[0\]/g, "images.rows[0]");
    content = content.replace(/apps\[0\]/g, "apps.rows[0]");
    content = content.replace(/walletBalance\[0\]/g, "walletBalance.rows[0]");
    content = content.replace(/totalBalance\[0\]/g, "totalBalance.rows[0]");
    content = content.replace(/countResult\[0\]/g, "countResult.rows[0]");

    // Fix array data in responses
    content = content.replace(
      /data: \{\s*([^}]+),\s*([^}]+)\s*\}/g,
      (match, key, value) => {
        if (value.includes(":")) {
          return `data: {\n        ${key},\n        ${value.replace(
            /,\s*$/,
            ""
          )}\n      }`;
        }
        return match;
      }
    );

    // Fix specific array references
    content = content.replace(
      /transactions,/g,
      "transactions: transactions.rows,"
    );
    content = content.replace(/offers,/g, "offers: offers.rows,");
    content = content.replace(/apps,/g, "apps: apps.rows,");
    content = content.replace(/images,/g, "images: images.rows,");
    content = content.replace(/spending,/g, "spending: spending.rows,");
    content = content.replace(
      /balanceHistory,/g,
      "balanceHistory: balanceHistory.rows,"
    );

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Updated: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
}

// List of files to update
const filesToUpdate = [
  "routes/user.js",
  "routes/transactions.js",
  "routes/offers.js",
  "routes/images.js",
  "routes/apps.js",
  "middleware/auth.js",
];

console.log("🔄 Updating files from MySQL to PostgreSQL syntax...\n");

filesToUpdate.forEach((file) => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    updateFileToPostgreSQL(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log("\n✅ All files updated!");
console.log("📝 Please review the changes and test your application.");
console.log(
  "🔧 You may need to manually adjust some queries for PostgreSQL-specific features."
);
