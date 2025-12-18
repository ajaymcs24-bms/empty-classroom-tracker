const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataFile = path.join(__dirname, "../audiBookings.json");

function loadBookings() {
  if (!fs.existsSync(dataFile)) return {};
  return JSON.parse(fs.readFileSync(dataFile, "utf8"));
}

function saveBookings(data) {
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
}

router.get("/", (req, res) => {
  const { audi, date } = req.query;
  const key = `${audi}-${date}`;
  const bookings = loadBookings();
  const data = bookings[key] || [];

  const slots = [
    "9:00 AM - 11:00 AM",
    "11:00 AM - 1:00 PM",
    "2:00 PM - 4:00 PM",
    "4:00 PM - 6:00 PM"
  ].map(s => {
    const found = data.find(b => b.slot === s);
    return found ? { ...found, booked: true } : { slot: s, booked: false };
  });

  res.json(slots);
});

router.post("/book", (req, res) => {
  if (!req.session.user || req.session.user.role !== "faculty")
    return res.sendStatus(403);

  const { audi, date, slot } = req.body;
  const key = `${audi}-${date}`;

  const bookings = loadBookings();
  bookings[key] = bookings[key] || [];

  if (bookings[key].some(b => b.slot === slot))
    return res.send("ALREADY_BOOKED");

  bookings[key].push({
    slot,
    bookedBy: req.session.user.email
  });

  saveBookings(bookings);
  res.send("BOOKED");
});

router.post("/cancel", (req, res) => {
  const { audi, date, slot } = req.body;
  const key = `${audi}-${date}`;

  const bookings = loadBookings();
  bookings[key] = (bookings[key] || []).filter(b => b.slot !== slot);

  saveBookings(bookings);
  res.send("CANCELLED");
});

module.exports = router;
