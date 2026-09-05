# Digital Supertest (Walking Skeleton)

A small internal tool for recording Supertest results digitally, replacing
paper forms and Excel sheets. Floor staff can create records; managers can
view and search them.

This is a **walking skeleton**: the goal is a complete, working end-to-end
flow (frontend ↔ backend ↔ storage) rather than a polished, feature-complete
product.

## Tech Stack

- **Frontend:** React 19 + Vite, vanilla CSS, Fetch API
- **Backend:** Express.js on Node.js
- **Storage:** In-memory (no database) — data resets when the server restarts

## Project Structure

```
project/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # TopBar, RecordForm, RecordTable, LoadingSpinner, EmptyMessage
│       ├── pages/            # Home.jsx
│       ├── services/         # supertestApi.js (fetch wrapper)
│       └── styles/           # global.css, dashboard.css, form.css, table.css
├── server/                  # Express backend
│   ├── routes/               # records.js
│   ├── controllers/          # recordController.js
│   ├── middleware/           # validateRecord.js
│   ├── utils/                 # sanitizeText.js
│   └── data/                  # recordsStore.js (in-memory array)
└── README.md
```

## Prerequisites

- Node.js 18+ and npm installed on your machine

## Setup & Running Locally

You'll run the backend and frontend in two separate terminals.

### 1. Start the backend (Express API)

```bash
cd server
npm install
npm start
```

The API will start on **http://localhost:5000**.

You can confirm it's running by visiting `http://localhost:5000/api/health` —
it should return `{"status":"ok"}`.

### 2. Start the frontend (React app)

In a new terminal:

```bash
cd client
npm install
npm run dev
```

The app will start on **http://localhost:5173**. Vite is configured to proxy
any request to `/api/*` through to the Express server on port 5000, so the
frontend and backend can talk to each other during local development without
extra CORS setup.

Open **http://localhost:5173** in your browser to use the app.

## API Endpoints

| Method | Endpoint         | Description                                  |
|--------|------------------|-----------------------------------------------|
| GET    | `/api/records`   | Returns all Supertest records                |
| POST   | `/api/records`   | Creates a new record (validated + sanitized) |

**POST body shape:**

```json
{
  "employeeName": "Jane Doe",
  "employeeId": "EMP-1024",
  "department": "Manufacturing",
  "testScore": 87,
  "remarks": "Retest not required"
}
```

`employeeName`, `employeeId`, and `department` are required. `testScore` must
be between 0 and 100 if provided. `remarks` is optional.

## Key Behaviors Implemented

- **Empty state** — shows "No Data Found / Create your first Supertest
  record" when there are no records (or no search matches).
- **Loading & slow-network handling** — a spinner is shown while records
  load or a record is being submitted; the submit button is disabled during
  submission to prevent duplicate requests.
- **Client + server validation** — required fields and test score range are
  checked both in the browser (`RecordForm.jsx`) and on the server
  (`middleware/validateRecord.js`). Invalid fields get a red border and an
  error message underneath.
- **XSS protection** — all text fields are escaped via
  `server/utils/sanitizeText.js` before being stored.
- **Accessibility** — every input has an associated `<label>`, the search
  box and buttons have `aria-label`s, and there's a visible focus outline on
  all interactive elements for keyboard users.
- **Search** — filters the records table client-side by name, ID, or
  department as you type.
- **Analytics simulation** — logs `[Analytics] User interacted with
  Supertest` to the console after every successful record creation.

## Notes / Known Limitations (by design, for this stage)

- Data is stored **in memory only** — restarting the server clears all
  records. A real database (e.g. PostgreSQL, MongoDB) would replace
  `server/data/recordsStore.js` in a future iteration.
- There's no authentication yet — anyone with access to the app can create
  records. Role-based access (floor staff vs. managers) is a planned
  follow-up.
- No automated tests are included in this walking-skeleton pass.
