# Supertest for Complex Routing

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
  "employeeName": "Harshit Gupta",
  "employeeId": "Harshit-96",
  "department": "IT",
  "testScore": 100,
  "remarks": "No remark"
}
```

`employeeName`, `employeeId`, and `department` are required. `testScore` must
be between 0 and 100 if provided. `remarks` is optional.

 
