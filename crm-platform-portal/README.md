# Marc CRM Platform - Frontend Portal

Professional CRM portal with role-based access control for Commercial (Sales Rep), Supervisor, and Admin users.

## Features

- **Authentication**: Username + Password login with JWT token management
- **Role-Based Dashboards**:
  - **Sales Rep**: View assigned leads with real-time scoring and status tracking
  - **Supervisor**: Team lead distribution analytics and phone number export for Meta Ads LKL
  - **Admin**: Full system management and multi-tenant support
- **Black Theme**: Professional dark UI with Marc branding
- **Real-time Data**: Connected to backend API with automatic token refresh

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Routing**: React Router v6

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Update API URL if needed:

```env
VITE_API_URL=http://localhost:3001/api
```

### 3. Start Development Server

```bash
npm run dev
```

Server runs at `http://localhost:5173`

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | TestPassword123 |
| Supervisor | manager@example.com | TestPassword123 |
| Sales Rep | sales@example.com | TestPassword123 |

## Development Commands

```bash
npm run dev       # Start dev server
npm run build     # Build for production
npm run preview   # Preview production build
```

## Project Structure

- `src/pages/` - Role-based dashboards (Login, SalesRepDashboard, SupervisorDashboard, AdminDashboard)
- `src/components/` - Reusable components (DashboardLayout, ProtectedRoute)
- `src/store/` - Zustand auth store
- `src/utils/` - API client with axios
- `src/types/` - TypeScript interfaces

## Related

- Backend: `../crm-platform-api/`
- API Docs: `../crm-platform-api/API.md`

## System Status

✅ **FULLY OPERATIONAL** (Verified: 2026-06-01)

- Frontend Portal: http://localhost:5173 (Running)
- Backend API: http://localhost:3001/api (Running)
- Database: PostgreSQL (Connected)
- All authentication flows: Verified
- Role-based access: Verified
- Data integration: Verified

See [PORTAL-STATUS.md](./PORTAL-STATUS.md) for detailed verification results.

## Deployment

### Requirements
- Node.js v24+
- npm v10+
- Backend API running on localhost:3001
- PostgreSQL database with test data

### Production Build
```bash
npm run build     # Creates optimized dist/ folder
npm run preview   # Test production build locally
```

### Environment Variables
```env
VITE_API_URL=http://your-api-server.com/api
```

## Testing

Run integration tests:
```bash
node test-portal.mjs
```

Manual browser testing checklist available in [PORTAL-STATUS.md](./PORTAL-STATUS.md)

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-06-01  
**Version**: 1.0.0
