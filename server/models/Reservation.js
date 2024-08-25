// models/Reservation.js
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  building: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Building',
  },
  floor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Floor',
  },
  slot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Slot',
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  startTime: Date,
  endTime: Date,
  status: String,
});
const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;
