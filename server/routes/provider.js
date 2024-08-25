const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const Transaction = require("../models/Transaction");
const { io } = require("../index");
const { sendEmail } = require("../config/nodemailerConfig");
const { isProvider } = require("../middlewares/authmiddleware");
router.get("/buildings/all", isProvider, async (req, res) => {
  try {
    const buildings = await Building.find();
    if (!buildings) {
      return res
        .status(404)
        .json({ message: "No buildings found", success: false });
    }

    res.status(200).json({
      buildings,
      success: true,
      message: "Buildings fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to get buildings",
    });
  }
});

router.get("/buildings/:id", async (req, res) => {
  try {
    const building = await Building.findById(req.params.id);
    if (!building) return res.status(404).json({ error: "Building not found" });
    res.status(200).json({
      building,
      success: true,
      message: "Building fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
      message: "Failed to get building",
      success: false,
    });
  }
});

router.post("/buildings/:id/buy", isProvider, async (req, res) => {
  const { providerName, providerEmail, phoneNumber, price } = req.body;

  try {
    const building = await Building.findById(req.params.id);
    if (!building)
      return res.status(404).json({ message: "Building not found" });
    if (building.isBought)
      return res.status(400).json({ message: "Building already bought" });

    building.isBought = true;
    building.available = false;
    building.boughtById = req.user._id;
    building.boughtByName = req.user.name;
    building.status = "reserved";
    building.providerName = providerName;
    building.providerEmail = providerEmail;
    building.phoneNumber = phoneNumber;
    await building.save();

    const transaction = new Transaction({
      providerName,
      phoneNumber,
      providerEmail,
      buildingId: building._id,
      price,
    });
    await transaction.save();

    io.emit("emailNotification", { type: "buyBuilding" });

    await sendEmail(
      req.user.email,
      `Purchase Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nCongratulations! You have successfully purchased the building ${building.name}. Your phone number is ${phoneNumber}. The purchase price was ${price}.\n\nBest regards,\nCarpark Team`
    );

    res.json({ message: "Building purchased successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/:id/leave", isProvider, async (req, res) => {
  const { leaveReason } = req.body;

  try {
    const building = await Building.findById(req.params.id).populate({
      path: "floors.slots.reservations", // Populate reservations for each slot
      model: "Reservation",
    });

    if (!building) return res.status(404).json({ error: "Building not found" });

    if (!building.isBought)
      return res.status(400).json({ error: "Building not bought" });

    // Delete all reservations associated with this building
    for (const floor of building.floors) {
      for (const slot of floor.slots) {
        if (slot.reservations.length > 0) {
          // Assuming you have a Reservation model
          const reservationIds = slot.reservations.map((r) => r._id);
          await Building.deleteMany({ _id: { $in: reservationIds } });
          console.log("Deleted reservations", reservationIds);
          // Notify customers about the cancellation
          for (const reservation of slot.reservations) {
            await sendEmail(
              reservation.reservedByEmail,
              `Reservation Canceled - ${building.name}`,
              `Dear ${reservation.reservedByName},\n\nYour reservation for the slot ${slot.number} in the building ${building.name} has been canceled as the provider has left the building.\n\nBest regards,\nCarpark Team`
            );
          }

          // Clear the slot's reservations
          slot.reservations = [];
          slot.isAvailable = true;
          slot.isReserved = false;
        }
      }
    }

    // Update building status
    building.price = 400;
    building.status = "available";
    building.isBought = false;
    building.boughtById = null;
    building.boughtByName = null;
    building.providerName = null;
    building.providerEmail = null;
    building.phoneNumber = null;

    await building.save();

    // Emit socket event for notifications
    io.emit("emailNotification", { type: "leaveBuilding", leaveReason });

    // Send confirmation email to provider
    await sendEmail(
      req.user.email,
      `Building Leave Confirmation from Carpark`,
      `Dear ${req.user.name},\n\nYou have successfully left the building ${building.name}. Reason: ${leaveReason}.\n\nBest regards,\nCarpark Team`
    );

    res.json({
      building,
      message:
        "Leave Building Successfully. All reservations have been deleted.",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Building Leave Failed" || "First buy the building",
      success: false,
    });
  }
});

router.post("/reservations/:id/cancel", isProvider, async (req, res) => {
  const { reservationId, cancelReason } = req.body;

  try {
    // Find the building that contains the reservation
    const building = await Building.findOne({
      "floors.slots.reservations._id": reservationId,
    }).populate("floors.slots.reservations");

    if (!building) {
      return res.status(404).json({ error: "Building not found" });
    }

    // Traverse floors and slots to find the reservation
    let reservation;
    let floor;
    let slot;

    for (const f of building.floors) {
      for (const s of f.slots) {
        reservation = s.reservations.id(reservationId);
        if (reservation) {
          floor = f;
          slot = s;
          break;
        }
      }
      if (reservation) break;
    }

    if (!reservation) {
      return res.status(404).json({ error: "Reservation not found" });
    }

    // Remove the reservation from the slot
    slot.reservations = slot.reservations.filter(
      (r) => r._id.toString() !== reservationId.toString()
    );

    // Update slot state if there are no more reservations
    if (slot.reservations.length === 0) {
      slot.isReserved = false;
      slot.reservedBy = null;
      slot.reservationStartTime = null;
      slot.reservationEndTime = null;
      slot.vehicleType = null;
      slot.isAvailable = true;
    }

    // Save the building with updated slot information
    await building.save();

    // Notify the provider and customer about the cancellation
    io.emit("emailNotification", { type: "cancelReservation", cancelReason });

    // Send confirmation to the customer
    await sendEmail(
      reservation.reservedByEmail,
      `Reservation Cancellation Confirmation from Carpark`,
      `Dear ${reservation.reservedByName},\n\nWe regret to inform you that your reservation for slot ${slot.number} in building ${building.name} has been successfully canceled. We understand this may be inconvenient, and we appreciate your understanding. The reason for cancellation is: ${cancelReason}. If you have any questions or need further assistance, please feel free to reach out to us.\n\nThank you for choosing Carpark.\n\nBest regards,\nCarpark Team`
    );

    // Send notice to the provider
    if (building.providerEmail) {
      await sendEmail(
        building.providerEmail,
        `Reservation Cancellation Notice from Carpark`,
        `Dear ${building.providerName},\n\nWe wanted to inform you that the reservation for slot ${slot.number} in your building ${building.name} has been canceled by the customer. The reason provided for the cancellation is: ${cancelReason}. We hope this does not cause too much inconvenience. Please let us know if there's anything further we can assist with.\n\nThank you for your continued partnership with Carpark.\n\nBest regards,\nCarpark Team`
      );
    }

    res.json({
      message:
        "Reservation canceled successfully. We have notified both the customer and the provider.",
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message:
        "An error occurred while attempting to cancel the reservation. Please try again later.",
      success: false,
    });
  }
});

module.exports = router;
