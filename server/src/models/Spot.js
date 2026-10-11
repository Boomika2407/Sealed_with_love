import mongoose from 'mongoose';

const spotSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Spot name is required'],
      trim: true
    },
    campus: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campus'
    },
    category: {
      type: String,
      enum: ['gate', 'canteen', 'library', 'academic', 'sports', 'hostel', 'iconic'],
      default: 'iconic'
    },
    description: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      // GeoJSON standard: [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Spot coordinates [longitude, latitude] are required']
      }
    },
    radiusMeters: {
      type: Number,
      default: 100,
      min: 20,
      max: 500
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

spotSchema.index({ 'location.coordinates': '2dsphere' });

export default mongoose.model('Spot', spotSchema);
