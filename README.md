# FMBL


# Fumble

<img width="1536" height="1024" alt="Fumble Cover" src="https://github.com/user-attachments/assets/c31846d6-ae12-4fba-92a6-d697334a1427" />

## Project Overview

A comprehensive web-based platform for managing sports leagues, matches, teams, and player statistics. The application provides a seamless interface for organizers to set up tournaments, for teams to manage their squads, and for players to track their performance metrics.

## Features

- **User Management**
  - Secure authentication and authorization for different user roles (Admin, Organizer, Captain, Player).
- **Tournament Management**
  - Complete tournament lifecycle management including scheduling, match organization, and score updates.
- **Team Management**
  - Squad management, player assignments, and player transfers between teams.
- **Player Statistics**
  - Real-time tracking of goals, assists, yellow cards, red cards, and player ratings.
- **Admin Dashboard**
  - Comprehensive overview of the league system with filterable statistics.

## Tech Stack

- **Frontend**: React with Vite
- **Backend**: Node.js with Express
- **Database**: SQL Server
- **Authentication**: JWT (JSON Web Tokens)

## Project Structure

```
fumble/
├── frontend/          # React application
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── ...
│   ├── package.json
│   └── vite.config.js
│
├── backend/           # Express.js application
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Authentication and error handling
│   ├── routes/         # API route definitions
│   ├── config/         # Database configuration
│   └── ...
│
└── ...                # Configuration and scripts
```

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm
- SQL Server (or Azure SQL Database)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd fmbl/backend

# Install dependencies
npm install

# Set up database
# 1. Create the database using the SQL Server Management Studio script.
# 2. Update the connection string in backend/config/db.js:
#    - Change USER_NAME
#    - Change SQL_SERVER_NAME (usually your machine name)
#    - Leave SQL_DATABASE as 'Fumble'
#    - Leave SQL_PASSWORD as 'qwerty1234'

# Run the server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd fmbl/frontend

# Install dependencies
npm install

# Run the application
npm run dev
```

The application will be accessible at `http://localhost:3000`.

## Usage

### Default Credentials

- **Admin**: [EMAIL_ADDRESS] / password
- **Organizer**: [EMAIL_ADDRESS] / password
- **Captain**: [EMAIL_ADDRESS] / password
- **Player**: [EMAIL_ADDRESS] / password

### Running Tests

Run frontend tests:
```bash
cd fmbl/frontend
npm test
```
