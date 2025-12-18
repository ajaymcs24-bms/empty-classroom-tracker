const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { requireLogin, isFaculty } = require("../middleware/authMiddleware");

const dataFile = path.join(__dirname, "../attendanceLogs.json");

// helper
function readLogs() {
  if (!fs.existsSync(dataFile)) return [];
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

// ===============================
// 📄 SHOW REPORT AS HTML PAGE
// ===============================
router.get("/download", requireLogin, isFaculty, (req, res) => {
  const logs = readLogs();

  let rows = logs.map(l => `
    <tr>
      <td>${l.name || "-"}</td>
      <td>${l.email || "-"}</td>
      <td>${l.block}</td>
      <td>${l.floor}</td>
      <td>${l.room}</td>
      <td>${new Date(l.startTime).toLocaleString()}</td>
      <td>${new Date(l.endTime).toLocaleString()}</td>
    </tr>
  `).join("");

  if (!rows) {
    rows = `<tr><td colspan="7">No records found</td></tr>`;
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
  <title>Class Report</title>
  <style>
    body { font-family: Arial; padding: 20px; }
    h2 { text-align: center; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th, td { border: 1px solid #ccc; padding: 8px; text-align: center; }
    th { background: #007BFF; color: white; }
    .btns { margin-top: 20px; text-align: center; }
    button {
      padding: 10px 18px;
      margin: 5px;
      font-weight: bold;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }
    .print { background: #28a745; color: white; }
    .clear { background: #dc3545; color: white; }
    .back { background: #007BFF; color: white; }
  </style>
</head>
<body>

<h2>Class Report</h2>

<table>
  <tr>
    <th>Faculty Name</th>
    <th>Email</th>
    <th>Block</th>
    <th>Floor</th>
    <th>Room</th>
    <th>Start Time</th>
    <th>End Time</th>
  </tr>
  ${rows}
</table>

<div class="btns">
  <button class="print" onclick="window.print()">Print</button>
  <button class="clear" onclick="clearReport()">Clear Report</button>
  <button class="back" onclick="window.close()">Back</button>
</div>

<script>
function clearReport() {
  if (!confirm("Clear all report data?")) return;

  fetch("/api/reports/clear", {
    method: "POST",
    credentials: "include"
  })
  .then(() => {
    alert("Report cleared");
    location.reload();
  });
}
</script>

</body>
</html>
  `);
});

// ===============================
// 🧹 CLEAR REPORT
// ===============================
router.post("/clear", requireLogin, isFaculty, (req, res) => {
  fs.writeFileSync(dataFile, JSON.stringify([], null, 2));
  res.send("CLEARED");
});

module.exports = router;
