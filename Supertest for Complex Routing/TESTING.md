# Testing Report — Digital Supertest System(Supertest for Complex Routing)

# Testing Report — Supertest for Complex Routing

This document shows how the Digital Supertest project was run and tested
end-to-end (frontend + backend), along with the results observed.

## 1. Live Deployment

- **Live URL:** [https://prodesk-it.onrender.com](https://prodesk-it.onrender.com)
- **Hosting Platform:** Render (free tier, single Web Service)
- **Architecture:** The Express backend serves both the `/api/records` API
  and the built React frontend (`client/dist`) from the same service, so
  the entire app runs on one domain with no separate frontend/backend URLs.
- **Source Code:** Hosted on GitHub in the `Prodesk_IT` repository, inside
  the `Supertest for Complex Routing` folder.

| Test Case | Steps | Result |
|-----------|-------|--------|
| Live site loads | Opened the Render URL in browser | App (TopBar, form, table) loaded successfully | ✅ Passed |
| Live record creation | Filled form and submitted on live site | Record saved and displayed instantly in table | ✅ Passed |
| Live API reachable | Opened `/api/health` on the live URL | Returned `{"status":"ok"}` | ✅ Passed |

> Note: Render's free tier spins the service down after a period of
> inactivity, so the very first request after idle time can take
> 10–30 seconds to respond while the server wakes up. This is expected
> behavior on the free plan, not a bug.

## 2. Environment Used

- **Development Platform:** VS Code
- **Deployment Platform:** Render (Web Service, free tier)
- **Backend:** Node.js + Express, run with `npm start` inside `server/`
- **Frontend:** React 19 + Vite, run with `npm run dev` inside `client/`
  during development, and built with `npm run build` for production

## 3. How the Project Was Run (Local/Development)

| Step | Command | Folder | Result |
|------|---------|--------|--------|
| 1 | `npm install` | `server/` | Installed Express + CORS dependencies |
| 2 | `npm start` | `server/` | Server started on `http://localhost:5000` |
| 3 | `npm install` | `client/` | Installed React + Vite dependencies |
| 4 | `npm run dev` | `client/` | Vite dev server started on port `5173` |
| 5 | Opened preview URL in browser | — | App loaded successfully |

## 4. How the Project Was Deployed (Production)

| Step | Action | Result |
|------|--------|--------|
| 1 | Pushed project to GitHub (`Prodesk_IT` repo) | Source code available on GitHub |
| 2 | Created a new Web Service on Render, connected to the GitHub repo | Repo linked to Render |
| 3 | Set Root Directory to `Supertest for Complex Routing` | Render scoped the build to the correct subfolder |
| 4 | Set Build Command: `cd client && npm install && npm run build && cd ../server && npm install` | Frontend built, backend dependencies installed |
| 5 | Set Start Command: `cd server && npm start` | Server started and began serving both API and frontend |
| 6 | Render deploy completed | "Your service is live" at `https://prodesk-it.onrender.com` |

## 5. Backend API Testing

| Test Case | Endpoint | Input | Expected Result | Actual Result |
|-----------|----------|-------|------------------|----------------|
| Health check | `GET /api/health` | — | `{"status":"ok"}` | ✅ Passed |
| Get all records (empty) | `GET /api/records` | — | Empty array | ✅ Passed |
| Create valid record | `POST /api/records` | Valid name, ID, department, score | 201 Created, record returned | ✅ Passed |
| Missing required fields | `POST /api/records` | Empty name/ID/department | 400 with field errors | ✅ Passed |
| Invalid test score | `POST /api/records` | `testScore: 150` | 400, "must be between 0 and 100" | ✅ Passed |
| XSS input | `POST /api/records` | `<script>alert(1)</script>` in name | Stored as escaped text (`&lt;script&gt;...`) | ✅ Passed |

## 6. Frontend Feature Testing

| Feature | How Tested | Result |
|---------|-----------|--------|
| Empty state | Loaded app with no records | Showed "No Data Found / Create your first Supertest record" | ✅ Passed |
| Form validation | Submitted form with empty required fields | Red border + error text shown under each field | ✅ Passed |
| Loading state | Submitted form on slow connection | Spinner shown, submit button disabled during request | ✅ Passed |
| Duplicate submit prevention | Clicked submit button rapidly multiple times | Only one record created | ✅ Passed |
| Successful record creation | Filled valid data and submitted | Record appeared in table instantly | ✅ Passed |
| Search | Typed employee name/ID/department in search box | Table filtered live | ✅ Passed |
| Analytics log | Created a record, checked browser console | `[Analytics] User interacted with Supertest` logged | ✅ Passed |
| Accessibility | Tabbed through form using keyboard only | All fields reachable, focus outline visible | ✅ Passed |
| Responsive layout | Resized browser window to mobile width | Table switched to stacked card layout | ✅ Passed |

## 7. Known Limitations  

- Data is stored **in-memory only** — (per project requirements).
- No authentication/login system yet.
- No automated unit tests included — all testing above was performed
  manually against the running application, both locally and on the
  live deployment.
- Render's free tier has a cold-start delay after inactivity.

## 8. Conclusion

All required features from the Technical Requirements Document (empty
state, slow-network handling, input validation, XSS sanitization,
accessibility, search, and analytics logging) were manually tested and
confirmed working end-to-end, both in local development and on the live
production deployment at **https://prodesk-it.onrender.com**, with the
React frontend successfully communicating with the Express backend via
the `/api/records` API.
