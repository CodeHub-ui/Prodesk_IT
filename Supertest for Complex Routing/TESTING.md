# Testing Report — Digital Supertest System

This document shows how the Digital Supertest project was run and tested
end-to-end (frontend + backend), along with the results observed.

## 1. Environment Used

- **Platform:** CodeSandbox Devbox (cloud development environment)
- **Backend:** Node.js + Express, run with `npm start` inside `server/`
- **Frontend:** React 19 + Vite, run with `npm run dev` inside `client/`

## 2. How the Project Was Run

| Step | Command | Folder | Result |
|------|---------|--------|--------|
| 1 | `npm install` | `server/` | Installed Express + CORS dependencies |
| 2 | `npm start` | `server/` | Server started on `http://localhost:5000` |
| 3 | `npm install` | `client/` | Installed React + Vite dependencies |
| 4 | `npm run dev` | `client/` | Vite dev server started on port `5173` |
| 5 | Opened preview URL in browser | — | App loaded successfully |

## 3. Backend API Testing

| Test Case | Endpoint | Input | Expected Result | Actual Result |
|-----------|----------|-------|------------------|----------------|
| Health check | `GET /api/health` | — | `{"status":"ok"}` | ✅ Passed |
| Get all records (empty) | `GET /api/records` | — | Empty array | ✅ Passed |
| Create valid record | `POST /api/records` | Valid name, ID, department, score | 201 Created, record returned | ✅ Passed |
| Missing required fields | `POST /api/records` | Empty name/ID/department | 400 with field errors | ✅ Passed |
| Invalid test score | `POST /api/records` | `testScore: 150` | 400, "must be between 0 and 100" | ✅ Passed |
| XSS input | `POST /api/records` | `<script>alert(1)</script>` in name | Stored as escaped text (`&lt;script&gt;...`) | ✅ Passed |

## 4. Frontend Feature Testing

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

## 5. Screenshots

> Add your screenshots below by uploading them to a `screenshots/` folder
> in this repo, then linking them here (see instructions after this file).

**Server running successfully:**
`![Server running](./screenshots/server-running.png)`

**Empty state (no records yet):**
`![Empty state](./screenshots/empty-state.png)`

**Form validation errors:**
`![Validation errors](./screenshots/validation-errors.png)`

**Record created and shown in table:**
`![Record created](./screenshots/record-created.png)`

**Search working:**
`![Search](./screenshots/search-working.png)`

## 6. Known Limitations (By Design)

- Data is stored **in-memory only** — restarting the server clears all
  records, since this project uses no database (per project requirements).
- No authentication/login system yet.
- No automated unit tests included — all testing above was performed
  manually against the running application.

## 7. Conclusion

All required features from the Technical Requirements Document (empty
state, slow-network handling, input validation, XSS sanitization,
accessibility, search, and analytics logging) were manually tested and
confirmed working end-to-end, with the React frontend successfully
communicating with the Express backend via the `/api/records` API.
