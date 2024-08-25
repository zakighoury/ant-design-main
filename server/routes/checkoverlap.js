// utils/checkOverlap.js
const dayjs = require('dayjs');
const Building = require('../models/Building');

const checkOverlap = async (buildingId, floorNumber, slotNumber, startTime, endTime) => {
  const building = await Building.findById(buildingId);
  if (!building) {
    throw new Error('Building not found');
  }

  const floor = building.floors.find(f => f.number === floorNumber);
  if (!floor) {
    throw new Error('Floor not found');
  }

  const slot = floor.slots.find(s => s.number === slotNumber);
  if (!slot) {
    throw new Error('Slot not found');
  }

  for (const reservation of slot.reservations) {
    const existingStart = dayjs(reservation.reservationStartTime);
    const existingEnd = dayjs(reservation.reservationEndTime);
    const newStart = dayjs(startTime);
    const newEnd = dayjs(endTime);

    if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
      throw new Error('Slot is already reserved during the selected time period.');
    }
  }
};

module.exports = checkOverlap;
