const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  floorNumber: { type: Number, required: true },
  slotNumber: { type: Number, required: true },
  time: { type: [Date], required: true }, // Store start and end times
  vehicleType: { type: String, required: true },
  paymentInfo: { type: String, required: true },
});
const Booking = mongoose.model('Book', bookingSchema);
module.exports = Booking;
