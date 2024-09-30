const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  entity: {
    type: {
      type: String,
      enum: ['club', 'community', 'department-society', 'professional-society'],
      required: true
    },
    id: { type: Schema.Types.ObjectId, required: true }
  },
  date: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    }
  },
  organizer: {
    type: {
      type: String,
      enum: ['Cluster', 'Department', 'Institute'],
      required: true
    },
    id: { type: Schema.Types.ObjectId, required: true }
  },
  venue: {
    type: String,
    required: true
  },
  Eventtype: {
    type: String,
    enum: ["flagship", "weekly", "monthly"],
    required: true
  },
  category: {
    type: String,
    enum: ["Hackathon", "Workshop", "Seminar"],
    required: true
  },
  organizationLevel: {
    type: String,
    enum: ['Open for all', 'Members only'],
    required: true
  },
  budget: {
    type: Number,
    required: true
  },
  approval: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Event', eventSchema);
