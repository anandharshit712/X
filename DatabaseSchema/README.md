# EngageX Database Schema

This folder contains all the SQL files needed to set up the EngageX platform databases.

## Database Structure

The EngageX platform uses **3 separate databases**:

1. **`service_dashboard`** - Advertiser dashboard and authentication (9 tables)
2. **`service_offerwall`** - Offerwall functionality (13 tables)
3. **`service_emailing`** - Email management system (1 table)

### Database Overview

- **service_dashboard**: Manages advertiser accounts, campaigns, wallets, and transactions
- **service_offerwall**: Handles offer management, user interactions, conversions, and revenue tracking
- **service_emailing**: Tracks email click interactions and user engagement

## Files Overview

### Folder Structure

```
DatabaseSchema/
├── 00_create_all_databases.sql          # Creates all 3 databases
├── README.md                            # This file - main documentation
├── service_dashboard/                   # Dashboard database files
│   ├── README.md                        # Dashboard-specific documentation
│   ├── 01_create_service_dashboard.sql  # Creates dashboard database
│   └── 01_dashboard_login.sql          # Table creation files (9 files)
├── service_offerwall/                   # Offerwall database files
│   ├── README.md                        # Offerwall-specific documentation
│   ├── 02_create_service_offerwall.sql  # Creates offerwall database
│   └── 01_offerwall_clicks.sql         # Table creation files (13 files)
└── service_emailing/                    # Emailing database files
    ├── README.md                        # Emailing-specific documentation
    ├── 03_create_service_emailing.sql   # Creates emailing database
    └── 01_email_clicks.sql             # Table creation files (1 file)
```

### Database Creation Files

- `create_engagex_databases.sql` - **Complete setup script** - Creates main engagex database + all 3 service databases with all tables
- `setup_engagex_databases.bat` - Windows batch script to run the complete setup
- `setup_engagex_databases.sh` - Linux/Mac shell script to run the complete setup
- `00_create_all_databases.sql` - Creates all 3 databases at once (legacy)
- `service_dashboard/01_create_service_dashboard.sql` - Creates service_dashboard database only
- `service_offerwall/02_create_service_offerwall.sql` - Creates service_offerwall database only
- `service_emailing/03_create_service_emailing.sql` - Creates service_emailing database only

### Table Creation Files (service_dashboard)

- `01_dashboard_login.sql` - Advertiser authentication and basic information
- `02_dashboard_details.sql` - Additional advertiser contact information
- `03_dashboard_transactions.sql` - Payment transaction records
- `04_dashboard_offers.sql` - Advertising campaign management
- `05_dashboard_wallet.sql` - Wallet transaction records
- `06_dashboard_images.sql` - Logo and banner storage
- `07_dashboard_wallet_balance_tracking.sql` - Wallet balance history
- `08_dashboard_wallet_spending.sql` - Spending tracking records
- `09_dashboard_app.sql` - Advertiser app management

### Table Creation Files (service_offerwall)

- `01_offerwall_clicks.sql` - User click tracking
- `02_offerwall_conversions.sql` - User conversion tracking
- `03_offerwall_offers.sql` - Offer information
- `04_offerwall_offer_status.sql` - Offer status tracking
- `05_offerwall_postback.sql` - Postback information
- `06_offerwall_users.sql` - User information
- `07_user_reward_status.sql` - Reward status tracking
- `08_offerwall_revenue.sql` - Revenue tracking
- `09_offerwall_app.sql` - App management
- `10_offerwall_payments.sql` - Payment tracking
- `11_offerwall_payments_status.sql` - Payment status
- `12_offerwall_billing_details.sql` - Billing information
- `13_offerwall_invoice_upload.sql` - Invoice management

### Table Creation Files (service_emailing)

- `01_email_clicks.sql` - Email click tracking

## Setup Instructions

### Quick Setup

### Option 1: Complete Setup (Recommended)

**Windows:**

```cmd
# Run the batch script
DatabaseSchema\setup_engagex_databases.bat
```

**Linux/Mac:**

```bash
# Make script executable and run
chmod +x DatabaseSchema/setup_engagex_databases.sh
./DatabaseSchema/setup_engagex_databases.sh
```

**Manual:**

```bash
# Connect to PostgreSQL as superuser
psql -U postgres -f DatabaseSchema/create_engagex_databases.sql
```

### Option 2: Manual Setup (Step by Step)

## Prerequisites

- PostgreSQL 12 or higher
- psql command line tool or pgAdmin

### Step 1: Create Databases

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create all databases at once
\i DatabaseSchema/00_create_all_databases.sql

# Or create databases individually
\i DatabaseSchema/01_create_service_dashboard.sql
\i DatabaseSchema/02_create_service_offerwall.sql
\i DatabaseSchema/03_create_service_emailing.sql
```

### Step 2: Create Tables (service_dashboard)

```bash
# Connect to service_dashboard database
psql -U postgres -d service_dashboard

# Create tables in order (due to foreign key dependencies)
\i DatabaseSchema/service_dashboard/01_dashboard_login.sql
\i DatabaseSchema/service_dashboard/02_dashboard_details.sql
\i DatabaseSchema/service_dashboard/03_dashboard_transactions.sql
\i DatabaseSchema/service_dashboard/04_dashboard_offers.sql
\i DatabaseSchema/service_dashboard/05_dashboard_wallet.sql
\i DatabaseSchema/service_dashboard/06_dashboard_images.sql
\i DatabaseSchema/service_dashboard/07_dashboard_wallet_balance_tracking.sql
\i DatabaseSchema/service_dashboard/08_dashboard_wallet_spending.sql
\i DatabaseSchema/service_dashboard/09_dashboard_app.sql
```

### Step 3: Create Tables (service_offerwall)

```bash
# Connect to service_offerwall database
psql -U postgres -d service_offerwall

# Create tables in order
\i DatabaseSchema/service_offerwall/01_offerwall_clicks.sql
\i DatabaseSchema/service_offerwall/02_offerwall_conversions.sql
\i DatabaseSchema/service_offerwall/03_offerwall_offers.sql
\i DatabaseSchema/service_offerwall/04_offerwall_offer_status.sql
\i DatabaseSchema/service_offerwall/05_offerwall_postback.sql
\i DatabaseSchema/service_offerwall/06_offerwall_users.sql
\i DatabaseSchema/service_offerwall/07_user_reward_status.sql
\i DatabaseSchema/service_offerwall/08_offerwall_revenue.sql
\i DatabaseSchema/service_offerwall/09_offerwall_app.sql
\i DatabaseSchema/service_offerwall/10_offerwall_payments.sql
\i DatabaseSchema/service_offerwall/11_offerwall_payments_status.sql
\i DatabaseSchema/service_offerwall/12_offerwall_billing_details.sql
\i DatabaseSchema/service_offerwall/13_offerwall_invoice_upload.sql
```

### Step 4: Create Tables (service_emailing)

```bash
# Connect to service_emailing database
psql -U postgres -d service_emailing

# Create tables
\i DatabaseSchema/service_emailing/01_email_clicks.sql
```

### Step 5: Verify Setup

```sql
-- Check databases
SELECT datname FROM pg_database WHERE datname LIKE 'service_%';

-- Check tables in service_dashboard
\c service_dashboard
\dt

-- Check tables in service_offerwall
\c service_offerwall
\dt

-- Check tables in service_emailing
\c service_emailing
\dt

-- Check table structure
\d dashboard_login
\d offerwall_offers
\d email_clicks
```

## Database Features

### PostgreSQL Specific Features

- **SERIAL** for auto-incrementing primary keys
- **CHECK constraints** for data validation
- **Triggers** for automatic timestamp updates
- **Indexes** for performance optimization
- **Foreign key constraints** with CASCADE delete
- **DECIMAL** for precise financial calculations
- **INET** type for IP address storage
- **UUID extension** for unique identifiers

### Security Features

- Input validation through CHECK constraints
- Foreign key integrity
- Proper indexing for performance
- Timestamp tracking for audit trails
- IP address tracking for fraud prevention
- Idempotency tokens for transaction safety

## Table Relationships

### service_dashboard

```
dashboard_login (1) ←→ (1) dashboard_details
dashboard_login (1) ←→ (N) dashboard_transactions
dashboard_login (1) ←→ (N) dashboard_offers
dashboard_login (1) ←→ (N) dashboard_wallet
dashboard_login (1) ←→ (1) dashboard_images
dashboard_login (1) ←→ (N) dashboard_app

dashboard_wallet (1) ←→ (N) dashboard_wallet_balance_tracking
dashboard_wallet (1) ←→ (N) dashboard_wallet_spending
```

### service_offerwall

```
offerwall_users (1) ←→ (N) offerwall_clicks
offerwall_users (1) ←→ (N) offerwall_conversions
offerwall_users (1) ←→ (N) offerwall_offer_status
offerwall_users (1) ←→ (N) user_reward_status
offerwall_users (1) ←→ (N) offerwall_postback

offerwall_offers (1) ←→ (N) offerwall_clicks
offerwall_offers (1) ←→ (N) offerwall_conversions
offerwall_offers (1) ←→ (N) offerwall_offer_status
offerwall_offers (1) ←→ (N) user_reward_status
offerwall_offers (1) ←→ (N) offerwall_postback

offerwall_clicks (1) ←→ (N) offerwall_conversions
```

### service_emailing

```
email_clicks (N) ←→ (1) offerwall_offers (via offer_id)
email_clicks (N) ←→ (1) offerwall_users (via offerwall_user_id)
```

## Environment Configuration

Update your `.env` file with PostgreSQL settings:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=service_dashboard
DB_PORT=5432
```

## Backup and Restore

### Backup

```bash
# Backup all databases
pg_dump -U postgres service_dashboard > service_dashboard_backup.sql
pg_dump -U postgres service_offerwall > service_offerwall_backup.sql
pg_dump -U postgres service_emailing > service_emailing_backup.sql
```

### Restore

```bash
# Restore databases
psql -U postgres -d service_dashboard < service_dashboard_backup.sql
psql -U postgres -d service_offerwall < service_offerwall_backup.sql
psql -U postgres -d service_emailing < service_emailing_backup.sql
```

## Troubleshooting

### Common Issues

1. **Permission Denied**

   ```bash
   # Grant necessary permissions
   GRANT ALL PRIVILEGES ON DATABASE service_dashboard TO your_user;
   ```

2. **Connection Issues**

   - Check PostgreSQL service is running
   - Verify port 5432 is accessible
   - Check firewall settings

3. **Extension Not Found**
   ```sql
   -- Install UUID extension
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

### Performance Optimization

- Monitor query performance with `EXPLAIN ANALYZE`
- Check index usage with `pg_stat_user_indexes`
- Regular VACUUM and ANALYZE operations

## Notes

- All timestamps use `CURRENT_TIMESTAMP` for consistency
- Foreign keys use `ON DELETE CASCADE` for data integrity
- Indexes are created for frequently queried columns
- Triggers automatically update `updated_at` timestamps
- CHECK constraints ensure data validation at database level
