const express = require("express");
const cors = require("cors");

const recordsRouter = require("./routes/records");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/records", recordsRouter);

app.use("/api", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

const path = require("path");
const clientDistPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientDistPath));

app.get("*", (req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Digital Supertest server running on http://localhost:${PORT}`);
});
