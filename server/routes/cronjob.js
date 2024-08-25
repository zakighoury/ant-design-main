// const cron = require('node-cron');
// const Building = require('../models/Building'); // Adjust path as needed

// cron.schedule('*/10 * * * *', async () => { // Runs every hour
//   try {
//     const currentTime = dayjs();
//     const buildings = await Building.find();

//     for (const building of buildings) {
//       for (const floor of building.floors) {
//         for (const slot of floor.slots) {
//           slot.reservations = slot.reservations.filter(reservation => {
//             return dayjs(new Date(reservation.reservationEndTime)).isAfter(currentTime);
//           });
//         }

//       }

//       await building.save(); // Save each building with cleaned-up reservations
//     }

//     console.log('Expired reservations cleaned up');
//   } catch (error) {
//     console.error('Error cleaning up expired reservations:', error);
//   }
// });
