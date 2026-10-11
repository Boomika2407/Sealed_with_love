import mongoose from 'mongoose';

const campusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Campus name is required'],
      trim: true
    },
    code: {
      type: String,
      required: [true, 'Campus unique code is required'],
      unique: true,
      trim: true,
      uppercase: true
    },
    city: {
      type: String,
      trim: true
    },
    center: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [77.0028, 11.0247]
    },
    zoom: {
      type: Number,
      default: 17
    },
    boundary: {
      type: {
        type: String,
        enum: ['Polygon'],
        default: 'Polygon',
        required: true
      },
      // GeoJSON Polygon: array of linear rings with [longitude, latitude]
      coordinates: {
        type: [[[Number]]],
        required: [true, 'Boundary coordinates polygon is required']
      }
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

campusSchema.index({ boundary: '2dsphere' });

export default mongoose.model('Campus', campusSchema);
