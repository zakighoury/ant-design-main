// routes/buildings.js
const express = require("express");
const router = express.Router();
const Building = require("../models/Building");
const { isAdmin } = require("../middlewares/authmiddleware");

// Get all buildings
router.get("/data/all", async (req, res) => {
  try {
    const buildings = await Building.find();
    if (!buildings) {
      return res
        .status(404)
        .json({ message: "No buildings found", success: false });
    }
console.log(buildings)
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


router.get("/data/slots", async (req, res) => {
  try {
    const buildings = await Building.find({}, 'floors');
    
    if (!buildings) {
      return res
        .status(404)
        .json({ message: "No buildings found", success: false });
    }

    const slots = buildings.flatMap(building =>
      building.floors.flatMap(floor =>
        floor.slots.map(slot => ({
          buildingId: building._id,
          buildingName: building.name,
          floorNumber: floor.number,
          slotNumber: slot.number,
          reservations: slot.reservations,
          // reservedByName: slot.reservations?.map(reservation => reservation.reservedByName),
          // reservationId: slot.reservations?.map(reservation => reservation._id),
          // reservationStartTime: slot.reservations?.map(reservation => reservation.reservationStartTime),
          // reservationEndTime: slot.reservations?.map(reservation => reservation.reservationEndTime),
          // vehicleType: slot.reservations?.map(reservation => reservation.vehicleType),
        }))
      )
    );

    res.status(200).json({
      slots,
      success: true,
      message: "Slots fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to get slots",
    });
  }
});

router.get("/all/reserve", async (req, res) => {
  try {
    const buildings = await Building.find({ isBought: true });
    if (!buildings) {
      return res
        .status(404)
        .json({ message: "No buildings found", success: false });
    }

    res.status(200).json({
      buildings,
      success: true,
      message: "Reserve Buildings fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to get buildings",
    });
  }
});

// Update building
router.put("/:id", async (req, res) => {
  try {
    const building = await Building.findByIdAndUpdate(req.params.id, req.body);
    if (!building)
      return res
        .status(404)
        .json({ message: "No building found", success: false });
    res.json({
      building,
      success: true,
      message: "Building updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to update building",
    });
  }
});

// Delete building
router.delete("/:id", async (req, res) => {
  try {
    const building = await Building.findByIdAndDelete(req.params.id);
    if (!building) {
      return res
        .status(404)
        .json({ message: "No building found", success: false });
    }
    res.status(204).json({
      building,
      success: true,
      message: "Building deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to delete building",
    });
  }
});

// Update floor
router.put("/:buildingId/floors/:floorNumber", async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    if (!building)
      return res.status(404).json({ message: "Building not found" });
    const floor = building.floors.id(req.params.floorNumber);
    if (!floor) return res.status(404).json({ message: "Floor not found" });
    Object.assign(floor, req.body);
    await building.save();
    res
      .status(204)
      .json({ building, success: true, message: "Floor updated successfully" });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to update floor",
    });
  }
});

// Delete floor
router.delete("/:buildingId/floors/:floorNumber", isAdmin, async (req, res) => {
  try {
    const building = await Building.findOne({ _id: req.params.buildingId });
    if (!building) {
      return res.status(404).json({
        message: "Building not found",
        success: false,
      });
    }
    const floor = building.floors.find(
      (floor) => floor.number === req.params.floorNumber
    );
    if (!floor)
      return res.status(404).json({
        message: "Floor not found",
        success: false,
      });
    building.floors = building.floors.filter(
      (floor) => floor.number !== req.params.floorNumber
    );
    await building.save();
    res.status(204).json({
      success: true,
      message: "Floor deleted successfully",
      building,
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      success: false,
      message: "Failed to delete floor",
    });
  }
});

// Update slot
router.put(
  "/:buildingId/floors/:floorNumber/slots/:slotNumber",
  isAdmin,
  async (req, res) => {
    const { buildingId, floorNumber, slotNumber } = req.params;
    try {
      const building = await Building.findById(buildingId);
      if (!building)
        return res
          .status(404)
          .json({ message: "Building not found", success: false });
      const floor = building.floors.find(
        (floor) => floor.number === floorNumber
      );
      if (!floor)
        return res.status(404).json({
          message: "Floor not found",
          success: false,
        });
      const slot = floor.slots.find((slot) => slot.number === slotNumber);
      if (!slot)
        return res
          .status(404)
          .json({ message: "Slot not found", success: false });
      Object.assign(slot, req.body);
      await building.save();
      res.json({
        building,
        success: true,
        message: "Slot updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        success: false,
        message: "Failed to update slot",
      });
    }
  }
);

// Delete slot
router.delete(
  "/:buildingId/floors/:floorNumber/slots/:slotNumber",
  async (req, res) => {
    const { buildingId, floorNumber, slotNumber } = req.params;
    if (!buildingId || !floorNumber || !slotNumber) {
      return res.status(400).json({ message: "Missing required parameters" });
    }
    try {
      const building = await Building.findOne({ _id: req.params.buildingId });
      if (!building) {
        return res
          .status(404)
          .json({ message: "Building not found", success: false });
      }
      const floor = building.floors.find(
        (floor) => floor.number === floorNumber
      );
      if (!floor)
        return res.status(404).json({
          message: "Floor not found",
          success: false,
        });
      const slot = floor.slots.find((slot) => slot.number === slotNumber);
      if (!slot)
        return res
          .status(404)
          .json({ message: "Slot not found", success: false });

      floor.slots = floor.slots.filter((slot) => slot.number !== slotNumber);
      await building.save();
      res.status(204).json({
        success: true,
        message: "Slot deleted successfully",
        building,
      });
    } catch (error) {
      res.status(500).json({
        error: error.message,
        message: "Failed to delete slot",
        success: false,
      });
    }
  }
);

module.exports = router;
