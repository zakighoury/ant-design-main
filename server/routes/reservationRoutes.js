// routes/reservations.js
const express = require('express');
const Reservation = require('../models/Reservation');

const router = express.Router();

// Make a reservation
router.post('/reserve', async (req, res) => {
  const { building, floor, slot, customer, provider, startTime, endTime } = req.body;
  const reservation = new Reservation({ building, floor, slot, customer, provider, startTime, endTime, status: 'reserved' });
  await reservation.save();
  res.send(reservation);
});

// View customer reservations for provider
router.get('/provider/:providerId', async (req, res) => {
  const reservations = await Reservation.find({ provider: req.params.providerId }).populate('building floor slot customer');
  res.send(reservations);
});

// Cancel reservation
router.post('/cancel', async (req, res) => {
  const { reservationId } = req.body;
  const reservation = await Reservation.findById(reservationId);
  reservation.status = 'cancelled';
  await reservation.save();
  res.send(reservation);
});

module.exports = router;
