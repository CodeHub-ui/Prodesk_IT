const express = require("express");
const router = express.Router();

const { getRecords, createRecord } = require("../controllers/recordController");
const validateRecord = require("../middleware/validateRecord");

router.get("/", getRecords);

router.post("/", validateRecord, createRecord);

module.exports = router;
