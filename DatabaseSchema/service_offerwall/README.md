# Service Offerwall Database

This folder contains all the SQL files needed to set up the `service_offerwall` database for the EngageX platform.

## Database Overview

The `service_offerwall` database manages the complete offerwall functionality, including:

- Offer management and tracking
- User clicks and conversions
- Revenue tracking and analytics
- Payment processing and billing
- User reward status management

## Files Overview

### Database Creation

- `02_create_service_offerwall.sql` - Creates the service_offerwall database

### Table Creation Files (14 tables)

- `01_dashboard_app.sql` - App information for offerwall
- `02_offerwall_clicks.sql` - User click tracking
- `03_offerwall_conversions.sql` - User conversion tracking
- `04_offerwall_offers.sql` - Offer information
- `05_offerwall_offer_status.sql` - Offer status tracking
- `06_offerwall_postback.sql` - Postback information
- `07_offerwall_users.sql` - User information
- `08_user_reward_status.sql` - Reward status tracking
- `09_offerwall_revenue.sql` - Revenue tracking
- `10_offerwall_app.sql` - App management
- `11_offerwall_payments.sql` - Payment tracking
- `12_offerwall_payments_status.sql` - Payment status
- `13_offerwall_billing_details.sql` - Billing information
- `14_offerwall_invoice_upload.sql` - Invoice management

## Setup Instructions

### Step 1: Create Database

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the service_offerwall database
\i DatabaseSchema/service_offerwall/02_create_service_offerwall.sql
```

### Step 2: Create Tables

```bash
# Connect to service_offerwall database
psql -U postgres -d service_offerwall

# Create tables in order
\i DatabaseSchema/service_offerwall/01_dashboard_app.sql
\i DatabaseSchema/service_offerwall/02_offerwall_clicks.sql
\i DatabaseSchema/service_offerwall/03_offerwall_conversions.sql
\i DatabaseSchema/service_offerwall/04_offerwall_offers.sql
\i DatabaseSchema/service_offerwall/05_offerwall_offer_status.sql
\i DatabaseSchema/service_offerwall/06_offerwall_postback.sql
\i DatabaseSchema/service_offerwall/07_offerwall_users.sql
\i DatabaseSchema/service_offerwall/08_user_reward_status.sql
\i DatabaseSchema/service_offerwall/09_offerwall_revenue.sql
\i DatabaseSchema/service_offerwall/10_offerwall_app.sql
\i DatabaseSchema/service_offerwall/11_offerwall_payments.sql
\i DatabaseSchema/service_offerwall/12_offerwall_payments_status.sql
\i DatabaseSchema/service_offerwall/13_offerwall_billing_details.sql
\i DatabaseSchema/service_offerwall/14_offerwall_invoice_upload.sql
```

### Step 3: Verify Setup

```sql
-- Check tables
\dt

-- Check table structure
\d offerwall_offers
\d offerwall_users
\d offerwall_clicks
```

## Table Relationships

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

dashboard_app (N) ←→ (1) offerwall_offers (via app_id)
offerwall_app (N) ←→ (1) offerwall_offers (via app_id)
```

## Key Features

### PostgreSQL Specific Features

- **INET** type for IP address storage
- **DECIMAL** for precise financial calculations
- **DATE** type for date tracking
- **Indexes** for performance optimization
- **Primary keys** and **composite keys** for data integrity

### Offerwall Features

- **Click Tracking**: Monitor user clicks on offers
- **Conversion Tracking**: Track offer completions
- **Revenue Analytics**: Daily revenue and performance metrics
- **Payment Processing**: Payment tracking and status management
- **Billing Management**: Billing details and invoice uploads
- **User Management**: User tracking and reward status
- **Offer Management**: Offer creation and status tracking
- **Postback System**: Conversion verification system

## Data Types Used

- **VARCHAR(255)**: For IDs, names, and text fields
- **TEXT**: For longer descriptions
- **DECIMAL(10,2)**: For financial amounts
- **INTEGER**: For counts and metrics
- **DATE**: For date tracking
- **TIMESTAMP**: For timestamps
- **INET**: For IP addresses

## Performance Considerations

- Indexes created on frequently queried columns
- Composite indexes for common query patterns
- IP address indexing for fraud detection
- Date-based indexing for analytics queries
- Advertiser-based indexing for reporting

## Security Features

- IP address tracking for fraud prevention
- Device information tracking
- Geographic location tracking
- Timestamp tracking for audit trails
- Proper indexing for performance
