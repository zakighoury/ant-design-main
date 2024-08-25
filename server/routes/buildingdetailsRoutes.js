const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const Transaction = require("../models/Transaction");
const { io } = require("../index");
const { sendEmail } = require("../config/nodemailerConfig");
const {
  requireSignin,
  isProvider,
  isProviderCustomer,
} = require("../middlewares/authmiddleware");
const dayjs = require("dayjs");
const isBetween = require("dayjs/plugin/isBetween");
const isSameOrBefore = require("dayjs/plugin/isSameOrBefore");
const isSameOrAfter = require("dayjs/plugin/isSameOrAfter");
router.get("/buildings/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: "Building not found" });
    res.json({
      building,
      messsage: "building fetched successfully",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to get building",
    });
  }
});

dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
router.post("/:id/reserve", requireSignin, async (req, res) => {
  const {
    floorNumber,
    slotNumber,
    reservationStartTime,
    reservationEndTime,
    vehicleType,
  } = req.body;
  const { id: buildingId } = req.params;

  if (
    !floorNumber ||
    !slotNumber ||
    !reservationStartTime ||
    !reservationEndTime ||
    !vehicleType
  ) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const currentTime = dayjs();
  const startTime = dayjs(reservationStartTime, "YYYY-MM-DD HH:mm A");
  const endTime = dayjs(reservationEndTime, "YYYY-MM-DD HH:mm A");

  if (startTime.isSame(endTime)) {
    return res.status(400).json({ message: "Start time and end time cannot be the same" });
  }

  if (startTime.isBefore(currentTime)) {
    return res.status(400).json({ message: "Start time cannot be before the current time" });
  }

  if (endTime.isBefore(startTime)) {
    return res.status(400).json({ message: "End time cannot be before start time" });
  }

  if (endTime.diff(startTime, 'minute') < 60) {
    return res.status(400).json({ message: "Reservation must be at least 1 hour long" });
  }

  try {
    const building = await Building.findById(buildingId);
    if (!building) return res.status(404).json({ error: "Building not found" });

    const floor = building.floors.find((f) => f.number === floorNumber);
    if (!floor) return res.status(404).json({ error: "Floor not found" });

    const slot = floor.slots.find((s) => s.number === slotNumber);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    // Clean up expired reservations
    slot.reservations = slot.reservations.filter((reservation) => {
      const isExpired = dayjs(reservation.reservationEndTime).isBefore(currentTime);
      if (isExpired) {
        console.log(`Deleting expired reservation: ${reservation._id} - End Time: ${reservation.reservationEndTime}`);
      }
      return !isExpired;
    });

    // Check for overlapping reservations
    const overlappingReservation = slot.reservations.find((r) => {
      const rStartTime = dayjs(r.reservationStartTime);
      const rEndTime = dayjs(r.reservationEndTime);
      return (
        (startTime.isBefore(rEndTime) && endTime.isAfter(rStartTime)) ||
        (startTime.isSame(rStartTime) || endTime.isSame(rEndTime))
      );
    });

    if (overlappingReservation) {
      return res.status(400).json({
        message: `Slot already reserved between ${dayjs(overlappingReservation.reservationStartTime).format(
          "YYYY-MM-DD HH:mm A"
        )} and ${dayjs(overlappingReservation.reservationEndTime).format(
          "YYYY-MM-DD HH:mm A"
        )}`,
      });
    }

    const reservationObj = {
      reservedBy: req.user._id,
      reservedByName: req.user.name,
      reservedByEmail: req.user.email,
      reservationStartTime: startTime.toDate(),
      reservationEndTime: endTime.toDate(),
      vehicleType,
    };

    slot.reservations.push(reservationObj);
    await building.save();

    io.emit("emailNotification", {
      type: "reserveSlot",
      floorNumber,
      slotNumber,
    });

    await sendEmail(
      req.user.email,
      `${req.user.name}, Reservation Confirmation from Carpark`,
      `Dear ${
        req.user.name
      },\n\nThank you for reserving a slot for your ${vehicleType} at Carpark. Your reservation for Floor ${floorNumber}, Slot ${slotNumber} has been confirmed. The reservation time is from ${startTime.format(
        "YYYY-MM-DD HH:mm A"
      )} to ${endTime.format(
        "YYYY-MM-DD HH:mm A"
      )}.\n\nBest regards,\nCarpark Team`
    );

    res.json({ message: "Slot reserved successfully" });
  } catch (error) {
    console.error("Error during reservation:", error);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/:id/cancel", isProviderCustomer, async (req, res) => {
  const {
    floorNumber,
    slotNumber,
    reservationTime,
    reservationIndex,
    vehicleType,
  } = req.body;

  try {
    // Find the building
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: "Building not found" });

    // Find the floor
    const floor = building.floors.find((f) => f.number === floorNumber);
    if (!floor) return res.status(404).json({ error: "Floor not found" });

    // Find the slot
    const slot = floor.slots.find((s) => s.number === slotNumber);
    if (!slot) return res.status(404).json({ error: "Slot not found" });

    // Check if the reservationIndex is valid
    if (reservationIndex < 0 || reservationIndex >= slot.reservations.length) {
      return res.status(400).json({ error: "Invalid reservation index" });
    }

    // Remove the reservation
    slot.reservations = slot.reservations.filter(
      (_, index) => index !== reservationIndex
    );

    // Update slot state if there are no more reservations
    if (slot.reservations.length === 0) {
      slot.is = false;
      slot.reservedBy = null;
      slot.reservedByName = null;
      slot.reservationByEmail = null;
      slot.reservationStartTime = null;
      slot.reservationEndTime = null;
      slot.vehicleType = null;
      slot.isAvailable = true;
    }

    // Save the building with updated slot information
    await building.save();

    // Notify via WebSocket
    io.emit("emailNotification", {
      type: "cancelReservation",
      floorNumber,
      slotNumber,
    });

    // Send confirmation email
    await sendEmail(
      req.user.email,
      `${req.user.name}, Reservation Cancellation Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nYour reservation for Floor ${floorNumber}, Slot ${slotNumber} on ${reservationTime} for ${vehicleType} at Carpark has been successfully cancelled.\n\nBest regards,\nCarpark Team`
    );

    // Send response
    res.json({
      message: "Reservation cancelled successfully",
      building,
      success: true,
    });
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    res.status(500).json({ error: error.message, success: false });
  }
});

router.post("/:id/buy", isProvider, async (req, res) => {
  const { providerName, phoneNumber, price } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building)
      return res.status(404).json({ message: "Building not found" });
    if (building.isBought)
      return res.status(400).json({ message: "Building already bought" });

    building.isBought = true;
    building.status = "reserved";
    building.providerName = providerName;
    building.phoneNumber = phoneNumber;
    building.boughtBy = req.user._id;
    await building.save();

    const transaction = new Transaction({
      providerName,
      phoneNumber,
      buildingId: building._id,
      price,
    });
    await transaction.save();

    io.emit("emailNotification", { type: "buyBuilding" });

    await sendEmail(
      `Purchase Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nCongratulations! You have successfully purchased the building ${building.name}. Your phone number is ${phoneNumber}. The purchase price was ${price}.\n\nBest regards,\nCarpark Team`
    );

    res.json({ message: "Building purchased successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/buyFloor", requireSignin, async (req, res) => {
  const { floorNumber, price } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building)
      return res.status(404).json({ message: "Building not found" });

    const floor = building.floors.find((f) => f.number === floorNumber);
    if (!floor) return res.status(404).json({ message: "Floor not found" });

    if (floor.isBought)
      return res.status(400).json({ message: "Floor already bought" });

    floor.isBought = true;
    await building.save();

    io.emit("emailNotification", { type: "buyFloor" });

    await sendEmail(
      req.user.email,
      `Floor Purchase Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nCongratulations! You have successfully purchased Floor ${floorNumber}. The purchase price was ${price}.\n\nBest regards,\nCarpark Team`
    );

    res.json({ message: "Floor purchased successfully" });
  } catch (error) {
    res.status500.json({ message: error.message });
  }
});

router.post("/:id/leave", requireSignin, async (req, res) => {
  const { leaveReason } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: "Building not found" });

    if (!building.isBought)
      return res.status(400).json({ error: "Building not bought" });
    // building.price= 400;
    building.status = "available";
    building.isBought = false;
    building.providerName = null;
    building.phoneNumber = null;
    await building.save();

    io.emit("emailNotification", { type: "leaveBuilding", leaveReason });

    await sendEmail(
      req.user.email,
      `Building Leave Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nYou have successfully left the building ${building.name}. Reason: ${leaveReason}.\n\nBest regards,\nCarpark Team`
    );

    res.json(building);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
router.get("/:id/profit", requireSignin, isProvider, async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: "Building not found" });

    const totalProfit = building.calculateTotalProfit();
    res.json({ totalProfit });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;
