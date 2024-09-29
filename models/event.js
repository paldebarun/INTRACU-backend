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
    type: Date,
    required: true 
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
    required: true 
  },
  category: {
    type: String,
    required: true 
  },
  approval: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  budget:{
    type: Number,
    required:true
  }
});

module.exports = mongoose.model('Event', eventSchema);
