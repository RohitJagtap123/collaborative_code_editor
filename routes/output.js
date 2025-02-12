const express = require('express')
const router = express.Router();


const { RunCode, GetOutput } = require("../controllers/outputController");

router.post("/run-code", RunCode);
router.get("/get-output/:token", GetOutput);

module.exports = router;