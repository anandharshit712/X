# EngageX Complete Database Setup

This file provides instructions for setting up all EngageX databases using the comprehensive setup script.

## 🚀 Quick Start

### Windows Users

```cmd
# Double-click the batch file or run from command prompt
DatabaseSchema\setup_engagex_databases.bat
```

### Linux/Mac Users

```bash
# Make executable and run
chmod +x DatabaseSchema/setup_engagex_databases.sh
./DatabaseSchema/setup_engagex_databases.sh
```

### Manual Execution

```bash
# Run the SQL script directly
psql -U postgres -f DatabaseSchema/create_engagex_databases.sql
```

## 📋 What This Script Does

The `create_engagex_databases.sql` script will:

1. **Create Main Database**: `engagex` (for system management)
2. **Create Service Databases**:
   - `service_dashboard` (9 tables)
   - `service_offerwall` (13 tables)
   - `service_emailing` (1 table)
3. **Create All Tables** with proper relationships
4. **Set Up Indexes** for performance optimization
5. **Configure Triggers** for automatic timestamp updates
6. **Enable Extensions** (UUID support)
7. **Create Summary Table** in main database

## ⚠️ Important Notes

- **WARNING**: This script will drop existing databases if they exist!
- Requires PostgreSQL superuser privileges
- PostgreSQL must be running and accessible
- `psql` command must be in your system PATH

## 🔧 Prerequisites

- PostgreSQL 12 or higher installed
- PostgreSQL service running
- Superuser access (postgres user)
- psql command line tool available

## 📊 Database Summary

After successful execution, you'll have:

| Database            | Tables | Purpose                 |
| ------------------- | ------ | ----------------------- |
| `engagex`           | 1      | Main system database    |
| `service_dashboard` | 9      | Advertiser dashboard    |
| `service_offerwall` | 13     | Offerwall functionality |
| `service_emailing`  | 1      | Email tracking          |

**Total: 24 tables across 4 databases**

## 🎯 Expected Output

When the script completes successfully, you should see:

```
====================================================
EngageX Database Setup Completed Successfully!
====================================================
Created databases:
- engagex (main database)
- service_dashboard (9 tables)
- service_offerwall (13 tables)
- service_emailing (1 table)
====================================================
Total tables created: 23
All indexes and triggers configured
====================================================
```

## 🔍 Verification

After setup, verify the installation:

```sql
-- Connect to main database
\c engagex

-- Check database summary
SELECT * FROM database_summary;

-- List all databases
SELECT datname FROM pg_database WHERE datname LIKE '%engagex%' OR datname LIKE '%service_%';

-- Check tables in each database
\c service_dashboard
\dt

\c service_offerwall
\dt

\c service_emailing
\dt
```

## 🛠️ Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   # Ensure you're running as postgres user
   sudo -u postgres psql -f create_engagex_databases.sql
   ```

2. **psql not found**

   ```bash
   # Add PostgreSQL bin to PATH or use full path
   /usr/local/pgsql/bin/psql -U postgres -f create_engagex_databases.sql
   ```

3. **Database already exists**

   - The script will drop existing databases
   - Ensure you have backups if needed

4. **Connection refused**
   ```bash
   # Check if PostgreSQL is running
   sudo systemctl status postgresql
   # or
   brew services list | grep postgresql
   ```

## 📁 File Structure

```
DatabaseSchema/
├── create_engagex_databases.sql      # Main setup script
├── setup_engagex_databases.bat       # Windows batch file
├── setup_engagex_databases.sh        # Linux/Mac shell script
├── SETUP_README.md                   # This file
└── README.md                         # Main documentation
```

## 🔄 Rollback

If you need to remove all databases:

```sql
-- Connect as superuser
psql -U postgres

-- Drop all databases
DROP DATABASE IF EXISTS engagex CASCADE;
DROP DATABASE IF EXISTS service_dashboard CASCADE;
DROP DATABASE IF EXISTS service_offerwall CASCADE;
DROP DATABASE IF EXISTS service_emailing CASCADE;
```

## 📞 Support

If you encounter issues:

1. Check the main `README.md` for detailed documentation
2. Verify PostgreSQL installation and permissions
3. Check the PostgreSQL logs for error messages
4. Ensure all prerequisites are met

---

**Happy Database Setup! 🎉**
