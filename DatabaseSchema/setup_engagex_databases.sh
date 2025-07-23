#!/bin/bash

echo "===================================================="
echo "EngageX Database Setup Script"
echo "===================================================="
echo ""
echo "This script will create all EngageX databases in PostgreSQL"
echo ""
echo "Prerequisites:"
echo "- PostgreSQL must be installed and running"
echo "- psql command must be available in PATH"
echo "- You must have superuser privileges (postgres user)"
echo ""
echo "WARNING: This will drop existing databases if they exist!"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

echo ""
echo "Connecting to PostgreSQL and creating databases..."
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run the SQL script
psql -U postgres -f "$SCRIPT_DIR/create_engagex_databases.sql"

echo ""
echo "===================================================="
echo "Database setup completed!"
echo "===================================================="
echo ""
echo "Created databases:"
echo "- engagex (main database)"
echo "- service_dashboard (9 tables)"
echo "- service_offerwall (13 tables)"
echo "- service_emailing (1 table)"
echo ""
echo "Total tables created: 23"
echo ""
read -p "Press Enter to exit..." 