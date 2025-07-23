# EngageX User Backend

A comprehensive Node.js/Express backend for the EngageX user dashboard, providing authentication, transaction management, campaign management, wallet operations, and more.

## Features

- 🔐 **Authentication & Authorization**: JWT-based authentication with secure password hashing
- 💳 **Transaction Management**: Complete payment processing with idempotency
- 🎯 **Campaign Management**: Create, update, and manage advertising campaigns
- 💰 **Wallet System**: Balance tracking, spending analytics, and fund management
- 📱 **App Management**: Manage multiple apps and their package IDs
- 🖼️ **Image Upload**: Logo and banner upload with file validation
- 📊 **Analytics**: Comprehensive statistics and reporting
- 🔒 **Security**: Input validation, CORS, helmet, and rate limiting

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT + bcryptjs
- **File Upload**: Multer
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. **Clone the repository**

   ```bash
   cd Backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   ```bash
   # Copy the environment template
   cp env.example .env

   # Edit .env with your configuration
   nano .env
   ```

4. **Database Setup**

   ```bash
   # Create PostgreSQL databases using the SQL files
   psql -U postgres -f DatabaseSchema/00_create_all_databases.sql

   # Create tables for service_dashboard
   psql -U postgres -d service_dashboard -f DatabaseSchema/01_dashboard_login.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/02_dashboard_details.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/03_dashboard_transactions.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/04_dashboard_offers.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/05_dashboard_wallet.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/06_dashboard_images.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/07_dashboard_wallet_balance_tracking.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/08_dashboard_wallet_spending.sql
   psql -U postgres -d service_dashboard -f DatabaseSchema/09_dashboard_app.sql
   ```

5. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=service_dashboard
DB_PORT=5432

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Security
BCRYPT_ROUNDS=12
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new advertiser
- `POST /api/auth/login` - Login advertiser
- `GET /api/auth/profile` - Get current user profile

### User Management

- `GET /api/user/profile` - Get user profile with details
- `PUT /api/user/profile` - Update user profile
- `PUT /api/user/details` - Update user additional details
- `GET /api/user/dashboard-stats` - Get dashboard statistics

### Transactions

- `POST /api/transactions` - Create new transaction
- `GET /api/transactions` - Get all transactions (with pagination)
- `GET /api/transactions/:id` - Get specific transaction
- `GET /api/transactions/stats/summary` - Get transaction statistics

### Campaigns/Offers

- `POST /api/offers` - Create new campaign
- `GET /api/offers` - Get all campaigns (with pagination)
- `GET /api/offers/:id` - Get specific campaign
- `PUT /api/offers/:id` - Update campaign
- `PATCH /api/offers/:id/status` - Update campaign status
- `GET /api/offers/stats/summary` - Get campaign statistics

### Wallet

- `GET /api/wallet/balance` - Get wallet balance and details
- `GET /api/wallet/transactions` - Get wallet transactions
- `GET /api/wallet/spending` - Get wallet spending
- `POST /api/wallet/add-funds` - Add funds to wallet
- `GET /api/wallet/stats/summary` - Get wallet statistics
- `GET /api/wallet/balance-history` - Get balance history

### Images

- `POST /api/images/logo` - Upload logo
- `POST /api/images/banner` - Upload banner
- `GET /api/images` - Get user images
- `DELETE /api/images/logo` - Delete logo
- `DELETE /api/images/banner` - Delete banner

### Apps

- `POST /api/apps` - Add new app
- `GET /api/apps` - Get all apps (with pagination)
- `GET /api/apps/:id` - Get specific app
- `PUT /api/apps/:id` - Update app
- `DELETE /api/apps/:id` - Delete app
- `GET /api/apps/stats/summary` - Get app statistics
- `GET /api/apps/search/apps` - Search apps

### Health Check

- `GET /api/health` - Server health check

## Database Schema

The platform uses 3 separate databases:

### service_dashboard (User-side tables)

1. **dashboard_login** - User authentication and basic info
2. **dashboard_details** - Additional user details
3. **dashboard_transactions** - Payment transactions
4. **dashboard_offers** - Advertising campaigns
5. **dashboard_wallet** - Wallet transactions
6. **dashboard_images** - User logos and banners
7. **dashboard_wallet_balance_tracking** - Balance history
8. **dashboard_wallet_spending** - Spending tracking
9. **dashboard_app** - User apps

### service_offerwall

- Offerwall-related tables (to be defined)

### service_emailing

- Email management tables (to be defined)

**Note**: Tables are created using separate SQL files in the `DatabaseSchema/` folder, not automatically by the server.

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## File Upload

- Supported formats: JPG, PNG, GIF, WebP
- Maximum file size: 5MB (configurable)
- Files are stored in the `uploads/` directory
- Access via: `http://localhost:3000/uploads/filename`

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error type",
  "message": "Human-readable error message",
  "details": [] // Validation errors (if applicable)
}
```

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start

# Check server health
curl http://localhost:3000/api/health
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Helmet security headers
- File upload validation
- SQL injection prevention with parameterized queries

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
