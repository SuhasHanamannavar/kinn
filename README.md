# Kin — Company Research Platform

A professional company research platform inspired by Apple's design aesthetics. Generate comprehensive research reports on public companies with real-time data.

## Features

- **Company Search**: Search by company name or ticker symbol
- **Comprehensive Research Reports**: 
  - Company Overview
  - Product & Technology Analysis
  - Financial Fundamentals
  - Market & Competition
  - Growth Catalysts & Risk Factors
  - Investment Conclusion with Score & Recommendation
- **Personal Dashboard**: Track your research history and statistics
- **Secure Authentication**: Powered by Clerk
- **Real-time Data**: Bright Data integration for accurate company information
- **Apple/Mac Design**: Clean, modern interface with frosted glass effects

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **Supabase** - PostgreSQL database
- **Clerk** - Authentication & user management
- **Bright Data** - Company data collection

### Frontend
- **React 18** + **Vite** - Modern frontend framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Clerk React** - Authentication components

## Project Structure

```
kin-research/
├── backend/
│   ├── server.js          # Main Express server
│   ├── .env               # Environment variables
│   ├── schema.sql         # Database schema
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js        # Clerk auth middleware
│   ├── routes/
│   │   ├── auth.js        # Auth endpoints
│   │   ├── companies.js   # Company search & data
│   │   └── research.js    # Report generation & management
│   └── services/
│       ├── supabase.js    # Database operations
│       ├── clerk.js       # Clerk client
│       └── brightdata.js  # Bright Data integration
└── frontend/
    ├── index.html
    ├── .env               # Environment variables
    ├── package.json
    ├── tailwind.config.js
    ├── vite.config.js
    └── src/
        ├── main.jsx       # React entry point
        ├── App.jsx        # App with routing
        ├── index.css      # Global styles & Apple theme
        ├── components/
        │   └── Layout.jsx # Navigation & layout
        ├── pages/
        │   ├── Home.jsx           # Landing page
        │   ├── Search.jsx         # Company search
        │   ├── CompanyDetail.jsx  # Company profile
        │   ├── Dashboard.jsx      # User dashboard
        │   ├── Reports.jsx        # Reports list
        │   └── ReportDetail.jsx   # Full research report
        └── services/
            └── api.js       # API client
```

## Getting Started

### 1. Database Setup

First, set up your Supabase database by running the SQL schema:

```bash
# Copy schema.sql contents to your Supabase SQL Editor
# or run via psql
psql $SUPABASE_DB_URL -f backend/schema.sql
```

### 2. Backend Setup

```bash
cd backend
npm install

# The .env file is pre-configured with your API keys:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY  
# - CLERK_SECRET_KEY
# - BRIGHT_DATA_API_KEY
# - BRIGHT_DATA_COLLECTOR_ID

npm start
```

Backend runs on **http://localhost:3001**

### 3. Frontend Setup

```bash
cd frontend
npm install

# The .env file is pre-configured with:
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_API_URL

npm run dev
```

Frontend runs on **http://localhost:5173**

## API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/webhook` - Clerk webhook endpoint

### Companies
- `GET /api/companies` - List companies
- `GET /api/companies/search?q=` - Search companies
- `GET /api/companies/:ticker` - Get company details
- `GET /api/companies/history/recent` - Get search history

### Research
- `POST /api/research/generate` - Generate research report
- `GET /api/research/my` - Get user's reports
- `GET /api/research/:id` - Get report details
- `DELETE /api/research/:id` - Delete a report

### Health
- `GET /api/health` - Server health check

## Environment Variables

### Backend (`backend/.env`)
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
CLERK_SECRET_KEY=your_clerk_secret_key
BRIGHT_DATA_API_KEY=your_bright_data_api_key
BRIGHT_DATA_COLLECTOR_ID=your_collector_id
PORT=3001
```

### Frontend (`frontend/.env`)
```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3001/api
```

## Design System

The UI follows Apple's design language:

- **Colors**: Apple system colors (blue, green, red, orange, etc.)
- **Typography**: SF Pro stack with proper letter-spacing
- **Effects**: Frosted glass (backdrop-filter), subtle shadows
- **Components**: Rounded corners (pill buttons, card radius), segmented controls
- **Motion**: Smooth transitions, subtle hover effects, fade/slide animations

## Report Scoring System

Reports include an overall score (0-100) based on:
- Revenue growth momentum
- Profitability margins
- Return on equity
- Capital structure / leverage

| Score | Recommendation |
|-------|---------------|
| 75+ | Strong Buy |
| 60-74 | Buy |
| 45-59 | Hold |
| 30-44 | Reduce |
| <30 | Sell |

## License

MIT
