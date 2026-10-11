import mongoose from 'mongoose';

const capsuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Capsule title is required'],
      trim: true,
      maxlength: 120
    },
    capsuleType: {
      type: String,
      enum: ['FRESHERS_LETTER', 'BATCH_FAREWELL', 'CLASS_MEMORY'],
      required: [true, 'Capsule type is required'],
      default: 'FRESHERS_LETTER'
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    creatorName: {
      type: String,
      required: true
    },
    batch: {
      type: String,
      required: true
    },
    unlockDate: {
      type: Date,
      required: [true, 'Unlock date is required'],
      index: true
    },
    // Campus spot geospatial representation
    location: {
      name: {
        type: String,
        required: [true, 'Spot name is required (e.g., Main Gate, Canteen)'],
        trim: true
      },
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      // GeoJSON standard: [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required [longitude, latitude]']
      },
      // Configurable unlock radius per spot (default 100 meters)
      radiusMeters: {
        type: Number,
        default: 100,
        min: 20,
        max: 500
      }
    },
    visibility: {
      type: String,
      enum: ['ONLY_ME', 'BATCH', 'PUBLIC_WALL'],
      default: 'ONLY_ME',
      index: true
    },
    // Server-enforced access control: sensitive content NEVER queried by default
    messageCiphertext: {
      type: String,
      select: false
    },
    messageIv: {
      type: String,
      select: false
    },
    messageTag: {
      type: String,
      select: false
    },
    // Media storage (Cloudinary authenticated or signed private storage)
    mediaUrl: {
      type: String,
      select: false
    },
    mediaPublicId: {
      type: String,
      select: false
    },
    mediaType: {
      type: String,
      enum: ['none', 'image'],
      default: 'none'
    },
    // Unlock state
    isUnlocked: {
      type: Boolean,
      default: false,
      index: true
    },
    unlockedAt: {
      type: Date
    },
    unlockedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // Node-cron scheduler notification status
    isNotified: {
      type: Boolean,
      default: false,
      index: true
    },
    // Wall engagement
    reactions: {
      hearts: {
        type: Number,
        default: 0
      },
      reactedUsers: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        }
      ]
    },
    // Scrapbook visual theme customization
    theme: {
      color: {
        type: String,
        default: 'blush' // 'blush', 'lilac', 'yellow', 'mint'
      },
      stamp: {
        type: String,
        default: 'wax-heart'
      },
      tiltDeg: {
        type: Number,
        default: -1.5
      }
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for campus proximity queries
capsuleSchema.index({ 'location.coordinates': '2dsphere' });

// Compound index for cron job & unlock date checks
capsuleSchema.index({ unlockDate: 1, isNotified: 1 });

export default mongoose.model('Capsule', capsuleSchema);
