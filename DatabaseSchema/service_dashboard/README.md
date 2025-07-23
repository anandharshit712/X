# Service Dashboard Database

This folder contains all the SQL files needed to set up the `service_dashboard` database for the EngageX platform.

## Database Overview

The `service_dashboard` database manages the advertiser dashboard functionality, including:

- Advertiser authentication and profile management
- Campaign and offer management
- Wallet and transaction tracking
- Image and app management
- Spending and balance tracking

## Files Overview

### Database Creation

- `01_create_service_dashboard.sql` - Creates the service_dashboard database

### Table Creation Files (9 tables)

- `01_dashboard_login.sql` - Advertiser authentication and basic information
- `02_dashboard_details.sql` - Additional advertiser contact information
- `03_dashboard_transactions.sql` - Payment transaction records
- `04_dashboard_offers.sql` - Advertising campaign management
- `05_dashboard_wallet.sql` - Wallet transaction records
- `06_dashboard_images.sql` - Logo and banner storage
- `07_dashboard_wallet_balance_tracking.sql` - Wallet balance history
- `08_dashboard_wallet_spending.sql` - Spending tracking records
- `09_dashboard_app.sql` - Advertiser app management

## Setup Instructions

### Step 1: Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the service_dashboard database
\i DatabaseSchema/service_dashboard/01_create_service_dashboard.sql
```

### Step 2: Create Tables

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

### Step 3: Verify Setup

```sql
-- Check tables
\dt

-- Check table structure
\d dashboard_login
\d dashboard_offers
\d dashboard_wallet
```

## Table Relationships

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

## Key Features

### PostgreSQL Specific Features

- **SERIAL** for auto-incrementing primary keys
- **CHECK constraints** for data validation
- **Triggers** for automatic timestamp updates
- **Indexes** for performance optimization
- **Foreign key constraints** with CASCADE delete
- **DECIMAL** for precise financial calculations

### Dashboard Features

- **Advertiser Management**: Registration, authentication, and profile management
- **Campaign Management**: Create and manage advertising campaigns
- **Wallet System**: Balance tracking and transaction management
- **Payment Processing**: Transaction tracking with multiple payment methods
- **Image Management**: Logo and banner upload and storage
- **App Management**: Advertiser app registration and tracking
- **Analytics**: Spending and conversion tracking

## Data Types Used

- **VARCHAR(255)**: For IDs, names, and text fields
- **TEXT**: For longer descriptions and names
- **DECIMAL(10,2)**: For financial amounts
- **INTEGER**: For counts and metrics
- **TIMESTAMP**: For timestamps
- **SERIAL**: For auto-incrementing primary keys

## Table Details

### dashboard_login

- Primary advertiser authentication table
- Stores basic profile information
- Supports Individual and Company account types
- Includes address and contact information

### dashboard_details

- Additional contact information
- Personal email, WhatsApp, and Skype details
- One-to-one relationship with dashboard_login

### dashboard_transactions

- Payment transaction tracking
- Supports UPI, Credit card, and debit card
- Includes idempotency tokens for security
- Tracks transaction status and completion

### dashboard_offers

- Campaign and offer management
- Bid request and acceptance tracking
- Multiple offer types (CPI, CPR, CPA)
- Employee approval workflow

### dashboard_wallet

- Wallet balance and transaction tracking
- Supports CREDIT, TRANSACTION_REVERSAL, and REFUND
- Employee association for management

### dashboard_images

- Logo and banner storage
- Separate timestamps for logo and banner uploads
- One-to-one relationship with advertisers

### dashboard_wallet_balance_tracking

- Historical balance tracking
- Audit trail for wallet changes

### dashboard_wallet_spending

- Campaign spending tracking
- Conversion count monitoring

### dashboard_app

- Advertiser app registration
- Package ID and app name management

## Performance Considerations

- Indexes created on frequently queried columns
- Composite indexes for common query patterns
- Foreign key indexing for joins
- Timestamp indexing for time-based queries

## Security Features

- Input validation through CHECK constraints
- Foreign key integrity
- Proper indexing for performance
- Timestamp tracking for audit trails
- Idempotency tokens for transaction safety

## Usage Examples

### Create a New Advertiser

```sql
INSERT INTO dashboard_login (
    advertiser_id, Name, E_mail, Password, Account_type
) VALUES (
    'adv123', 'John Doe', 'john@example.com', 'hashed_password', 'Individual'
);
```

### Create a Campaign

```sql
INSERT INTO dashboard_offers (
    advertiser_id, campaign_name, bid_requested, offer_type
) VALUES (
    'adv123', 'Summer Campaign', 100.00, 'CPI'
);
```

### Track Wallet Transaction

```sql
INSERT INTO dashboard_wallet (
    advertiser_id, balance, amount_in_INR, transaction_type
) VALUES (
    'adv123', 100.00, 7500.00, 'CREDIT'
);
```
