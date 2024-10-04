const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  entityType: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

const Ticket = mongoose.model('Ticket', counterSchema);

module.exports = Ticket;