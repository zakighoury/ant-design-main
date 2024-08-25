const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  reservedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reservedByName: { type: String },
  reservedByEmail: { type: String },
  reservationStartTime: { type: String, required: true },
  reservationEndTime: { type: String, required: true },
  vehicleType: { type: String, required: true },
  price: { type: Number }, // Added price field
});

const slotSchema = new mongoose.Schema({
  number: Number,
  isAvailable: Boolean,
  isReserved: Boolean,
  reservations: [reservationSchema],
});

const floorSchema = new mongoose.Schema({
  number: Number,
  slots: [slotSchema],
  isBought: {
    type: Boolean,
    default: false,
  },
});

const feedbackSchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: String,
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
});

const buildingSchema = new mongoose.Schema({
  name: String,
  address: String,
  description: String,
  ImgUrl: String,
  price: Number,
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  boughtById: String,
  boughtByName: String,
  status: {
    type: String,
    enum: ["available", "reserved"],
    default: "available",
  },
  available: Boolean,
  isBought: {
    type: Boolean,
    default: false,
  },
  providerName: String,
  providerEmail: String,
  phoneNumber: String,
  reservationRules: {
    maxReservationTime: Number, // Time in minutes
    blackoutPeriods: [
      {
        start: Date,
        end: Date,
      },
    ],
  },
  floors: [floorSchema],
  feedback: [feedbackSchema],
});

// Method to calculate total profit
buildingSchema.methods.calculateTotalProfit = function () {
  let totalProfit = 0;

  this.floors.forEach((floor) => {
    floor.slots.forEach((slot) => {
      slot.reservations.forEach((reservation) => {
        totalProfit += reservation.price;
      });
    });
  });

  return totalProfit;
};

const Building = mongoose.model("Building", buildingSchema);
module.exports = Building;
