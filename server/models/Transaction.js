const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  providerName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  providerEmail: { type: String, required: true },
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Building', required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});
const Transaction = mongoose.model('Transaction', TransactionSchema);
module.exports = Transaction;
