# Service Emailing Database

This folder contains all the SQL files needed to set up the `service_emailing` database for the EngageX platform.

## Database Overview

The `service_emailing` database manages email-related functionality, including:
- Email click tracking
- User interaction monitoring
- Device and location tracking

## Files Overview

### Database Creation
- `03_create_service_emailing.sql` - Creates the service_emailing database

### Table Creation Files (1 table)
- `01_email_clicks.sql` - Email click tracking

## Setup Instructions

### Step 1: Create Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the service_emailing database
\i DatabaseSchema/service_emailing/03_create_service_emailing.sql
```

### Step 2: Create Tables
```bash
# Connect to service_emailing database
psql -U postgres -d service_emailing

# Create tables
\i DatabaseSchema/service_emailing/01_email_clicks.sql
```

### Step 3: Verify Setup
```sql
-- Check tables
\dt

-- Check table structure
\d email_clicks
```

## Table Relationships

```
email_clicks (N) ←→ (1) offerwall_offers (via offer_id)
email_clicks (N) ←→ (1) offerwall_users (via offerwall_user_id)
```

## Key Features

### PostgreSQL Specific Features
- **INET** type for IP address storage
- **TIMESTAMP** for precise time tracking
- **Indexes** for performance optimization
- **Primary keys** for data integrity

### Email Features
- **Click Tracking**: Monitor email clicks
- **Device Tracking**: Track user device information
- **Location Tracking**: IP-based location tracking
- **User Association**: Link clicks to offerwall users
- **Offer Association**: Link clicks to specific offers

## Data Types Used

- **VARCHAR(255)**: For IDs and text fields
- **TIMESTAMP**: For timestamps
- **INET**: For IP addresses

## Performance Considerations

- Indexes created on frequently queried columns
- IP address indexing for analytics
- User and offer-based indexing for reporting
- Timestamp indexing for time-based queries

## Security Features

- IP address tracking for fraud prevention
- Device information tracking
- Timestamp tracking for audit trails
- User association for accountability

## Future Expansion

This database is designed to be expandable for additional email-related functionality such as:
- Email campaign management
- Email templates
- Email delivery tracking
- Email analytics and reporting 