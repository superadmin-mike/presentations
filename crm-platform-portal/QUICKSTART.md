# Marc CRM Platform - Quick Start Guide

## Prerequisites
- Backend API running: `http://localhost:3001/api`
- PostgreSQL database with test data
- Node.js v24+ and npm v10+

## Start the Portal

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

Portal opens at: **http://localhost:5173**

## Demo Credentials

Copy any of these to test different roles:

### Administrator
```
Email: admin@example.com
Password: TestPassword123
```
- Full system management access
- View all users and companies
- System settings and configuration

### Supervisor (Manager)
```
Email: manager@example.com
Password: TestPassword123
```
- Team lead distribution analytics
- Export phone numbers for Meta Ads
- View all team leads and assignments
- Access to all 13 test leads

### Sales Rep
```
Email: sales@example.com
Password: TestPassword123
```
- View assigned leads
- See lead scoring and status
- Color-coded qualification levels
- Access to test lead data

## Test the Portal

### 1. Login
1. Navigate to http://localhost:5173
2. Copy one of the demo credentials above
3. Paste into login form
4. Click "Login"

### 2. Explore Your Dashboard

#### If logged in as Admin:
- See 4 system stat cards
- Click "Overview" tab to see dashboard
- Click "Users" tab (placeholder for user management)
- Click "Companies" tab (placeholder for multi-tenant)
- Click "Settings" tab to configure system

#### If logged in as Supervisor:
- See total leads count: **13**
- See team members count: **1**
- See average lead score: **59**
- See team distribution cards with lead counts
- Click "Export Phones" to download CSV for Meta Ads
  - Modal appears asking to confirm
  - Click "Export" to download `crm-leads-2026-06-01.csv`
- Scroll down to see all leads in a table
  - Name, Phone, Email, Status, Score
  - Status badges color-coded
  - See "Unassigned" group (10 leads)
  - See team member with their 3 assigned leads

#### If logged in as Sales Rep:
- See assigned leads count: **13**
- See average score: **59**
- See qualified leads count: **1**
- Scroll to table showing all 13 leads
- Notice color-coded scores:
  - Green: Score 75+ (Qualified)
  - Yellow: Score 50-74 (Hot)
  - Red: Score <50 (Cold)
- Notice colored status badges:
  - Blue: New
  - Purple: Engaged
  - Green: Qualified
  - Gray: Closed

### 3. Test Token Persistence
1. Logged in to any role
2. Press F5 to refresh page
3. Notice you stay logged in
4. Check browser DevTools → Application → LocalStorage
5. See `token` and `user` stored

### 4. Test Logout
1. Click "Logout" button in top right
2. Redirected to login page
3. Notice localStorage cleared
4. Can't access dashboard without logging in again

## Features Working

### Authentication
- ✅ Email/password login
- ✅ JWT token generation
- ✅ Token storage in localStorage
- ✅ Auto-login on page refresh
- ✅ Automatic logout on 401
- ✅ Error message display

### Dashboards
- ✅ Role-based routing
- ✅ Stat cards with real data
- ✅ Team distribution analysis
- ✅ Color-coded lead scores
- ✅ Status badges
- ✅ CSV export functionality
- ✅ Responsive layout

### API Integration
- ✅ JWT token injection on requests
- ✅ Protected endpoint access
- ✅ Error handling
- ✅ Data formatting and display

## Troubleshooting

**Port 5173 already in use?**
```bash
# Kill the existing process
lsof -i :5173 | grep node | awk '{print $2}' | xargs kill -9

# Then start again
npm run dev
```

**Backend API not responding?**
```bash
# Check if backend is running
curl http://localhost:3001/api/contacts

# Should return JSON response
# If not, start backend API in separate terminal
```

**Clear browser cache if login doesn't work:**
```javascript
// Open DevTools → Console and run:
localStorage.clear()
location.reload()
```

**TypeScript compilation errors?**
```bash
# Rebuild
rm -rf node_modules dist
npm install
npm run dev
```

## Performance

- **Dev Build**: 942ms (cold start)
- **Prod Build**: 988ms
- **Portal Load**: <200ms (Vite HMR)
- **API Response**: 10-50ms

## File Structure

```
crm-platform-portal/
├── src/
│   ├── pages/          # Dashboards (Login, Sales Rep, Supervisor, Admin)
│   ├── components/     # Shared UI (DashboardLayout, ProtectedRoute)
│   ├── store/          # Zustand auth store
│   ├── utils/          # API client
│   ├── types/          # TypeScript interfaces
│   ├── App.tsx         # Routing configuration
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── .env                # API URL configuration
├── tailwind.config.js  # Tailwind theme customization
├── postcss.config.js   # PostCSS & Autoprefixer
├── tsconfig.json       # TypeScript configuration
├── vite.config.ts      # Vite build configuration
└── package.json        # Dependencies & scripts
```

## Next Steps

1. **Test CSV Export**: Download phone numbers on Supervisor dashboard
2. **Mobile Testing**: Resize browser to 375px wide (mobile view)
3. **Advanced Features**: See PORTAL-STATUS.md for roadmap

## Documentation

- **Status Report**: [PORTAL-STATUS.md](./PORTAL-STATUS.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Architecture**: [README.md](./README.md)

---

**Need help?** Check PORTAL-STATUS.md testing checklist or review error messages in browser console.
