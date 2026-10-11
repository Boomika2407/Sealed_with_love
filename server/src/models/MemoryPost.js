import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorBatch: { type: String },
    text: { type: String, required: true, maxlength: 500 },
    isAnonymous: { type: Boolean, default: false },
    replies: [
      {
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        authorName: { type: String, required: true },
        authorBatch: { type: String },
        text: { type: String, required: true, maxlength: 300 },
        isAnonymous: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

const mediaItemSchema = new mongoose.Schema({
  url: { type: String, required: true },
  publicId: { type: String },
  type: { type: String, enum: ['image', 'video'], required: true },
  thumbnailUrl: { type: String }, // for video thumbnail
  duration: { type: Number } // video duration in seconds
});

const memoryPostSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    authorName: { type: String, required: true },
    authorBatch: { type: String, required: true },
    college: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },

    caption: { type: String, maxlength: 1000, default: '' },

    media: [mediaItemSchema],

    mood: {
      type: String,
      enum: ['Funny', 'Emotional', 'Fest', 'Canteen', 'Class', 'Hostel', 'Farewell', ''],
      default: ''
    },

    spotTag: {
      spotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Spot' },
      spotName: { type: String },
      coordinates: { type: [Number] } // [lng, lat]
    },

    throwbackDate: { type: Date },

    visibility: {
      type: String,
      enum: ['college', 'batch'],
      default: 'college',
      index: true
    },

    // Reactions: emoji → array of user IDs
    reactions: {
      heart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      cry:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      haha:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      care:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      grad:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },

    comments: [commentSchema],

    savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Moderation
    isHidden: { type: Boolean, default: false, index: true },
    reports: [
      {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, maxlength: 300 },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    // For cursor-based pagination
    createdAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: { createdAt: false, updatedAt: true } }
);

// Compound index for college + batch filtering
memoryPostSchema.index({ college: 1, isHidden: 1, createdAt: -1 });
memoryPostSchema.index({ 'spotTag.spotId': 1 });

export default mongoose.model('MemoryPost', memoryPostSchema);
