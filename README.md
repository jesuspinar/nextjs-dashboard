# Next.js Dashboard Application

![Dashboard preview.](./public/opengraph-image.png)

## Project Overview
This is a comprehensive Next.js dashboard application demonstrating modern web development practices, including:
- Server-side rendering with Next.js 15
- Authentication with NextAuth
- Tailwind CSS for styling
- PostgreSQL database integration
- Prisma for database migrations
- TypeScript for type safety

For more information, see the [course curriculum](https://nextjs.org/learn) on the Next.js Website.

## Prerequisites
Before getting started, ensure you have the following installed:
- Node.js (recommended version 20.x or later)
- Docker (optional, for database containerization)
- PostgreSQL (if not using Docker)
- OpenSSL (for generating secure tokens)

## Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/jesuspinar/nextjs-dashboard.git
cd nextjs-dashboard
```

### 2. Environment Configuration
#### 2.1 Create Environment File
Copy the example environment configuration:
```bash
cp .env.example .env
```

#### 2.2 Configure Database Connection
Open the `.env` file and update the following PostgreSQL connection parameters:
```env
# Database Connection
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DATABASE=your_database_name

# NextAuth Configuration
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

#### Option A: Docker Deployment
For a quick and consistent database setup, use Docker:
```bash
# Pull PostgreSQL image
docker pull postgres

# Run PostgreSQL container
docker run --name dashboard-postgres \
  -e POSTGRES_PASSWORD=your_secure_password \
  -p 5432:5432 \
  -d postgres
```

#### Option B: Local PostgreSQL Installation
If you prefer a local PostgreSQL installation:
```bash
# Start PostgreSQL service
sudo service postgresql start
```

### 3.1 Create database (adjust names as needed)
```bash
# Connect to postgres
psql postgresql://your_user:your_password@localhost:5432

# Create new database
$ CREATE DATABASE your_database_name;

# Focus the new database
$ \c your_database_name

# Adds uuid-ossp extension to new database
$ CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

# Close the connection
$ exit
```

### 4. Install Dependencies
```bash
# Use pnpm, npm, or yarn
npm install
# or
pnpm install
# or
yarn install
```

### 5. Database Migrations and Seeding
```bash
# Deploy Prisma schema to the database
npm run schema_to_db

# Run database seed
npm run seed
```

### 6. Generate Authentication Secret
```bash
# Generate a secure random token for NextAuth
openssl rand -base64 32
```
Copy this generated token into your `.env` file for `AUTH_SECRET`.

### 7. Development Server
```bash
# Start development server with Turbopack
npm run dev

# Open http://localhost:3000 in your browser
```

## Troubleshooting
- Ensure all dependencies are installed correctly
- Check PostgreSQL connection parameters
- Verify environment variables are properly set
