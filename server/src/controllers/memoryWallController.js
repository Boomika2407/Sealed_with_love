import multer from 'multer';
import MemoryPost from '../models/MemoryPost.js';
import Spot from '../models/Spot.js';
import { containsProfanity } from '../utils/profanity.js';

// ─── Multer config for memory wall uploads ────────────────────────────────────
const ALLOWED_MIME = [
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/webm'
];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

export const wallUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 6 }, // max 5 images + 1 video
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images and MP4/WEBM videos are allowed.'), false);
    }
  }
});

// ─── Helper: Upload buffer to Cloudinary or local fallback ───────────────────
async function uploadMedia(buffer, mimetype, folder = 'sealed/wall') {
  const isVideo = mimetype.startsWith('video/');

  // Try Cloudinary if configured
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    const { v2: cloudinary } = await import('cloudinary');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    });

    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isVideo ? 'video' : 'image',
          eager: isVideo ? [{ format: 'jpg', so: '0' }] : undefined // thumbnail
        },
        (error, result) => {
          if (error) return reject(error);
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            type: isVideo ? 'video' : 'image',
            thumbnailUrl: isVideo
              ? result.eager?.[0]?.secure_url || result.secure_url.replace('/upload/', '/upload/so_0/').replace('.mp4', '.jpg')
              : null
          });
        }
      );
      stream.end(buffer);
    });
  }

  // Local fallback: base64 data URL (dev only)
  const base64 = buffer.toString('base64');
  const dataUrl = `data:${mimetype};base64,${base64}`;
  return {
    url: dataUrl,
    publicId: null,
    type: isVideo ? 'video' : 'image',
    thumbnailUrl: null
  };
}

// ─── POST /api/memory-wall ────────────────────────────────────────────────────
export const createMemoryPost = async (req, res) => {
  try {
    const { caption, mood, spotId, throwbackDate, visibility, isAnonymous } = req.body;

    // Profanity check
    if (containsProfanity(caption)) {
      return res.status(400).json({
        success: false,
        message: "Let's keep the wall friendly! Your caption contains words we can't allow. 🌸"
      });
    }

    // Validate files
    const files = req.files || [];
    const videoFiles = files.filter((f) => f.mimetype.startsWith('video/'));
    const imageFiles = files.filter((f) => f.mimetype.startsWith('image/'));

    if (videoFiles.length > 1) {
      return res.status(400).json({ success: false, message: 'Only one video per post allowed.' });
    }
    if (imageFiles.length > 5) {
      return res.status(400).json({ success: false, message: 'Maximum 5 images per post.' });
    }

    // Upload all media
    const mediaItems = [];
    for (const file of files) {
      const result = await uploadMedia(file.buffer, file.mimetype);
      mediaItems.push(result);
    }

    // Resolve spot tag
    let spotTag = {};
    if (spotId) {
      const spot = await Spot.findById(spotId);
      if (spot) {
        spotTag = {
          spotId: spot._id,
          spotName: spot.name,
          coordinates: spot.location.coordinates
        };
      }
    }

    const post = await MemoryPost.create({
      author: req.user._id,
      authorName: req.user.name,
      authorBatch: req.user.batch,
      college: req.user.college,
      isAnonymous: isAnonymous === 'true' || isAnonymous === true,
      caption: caption || '',
      media: mediaItems,
      mood: mood || '',
      spotTag: spotTag.spotId ? spotTag : undefined,
      throwbackDate: throwbackDate ? new Date(throwbackDate) : undefined,
      visibility: visibility === 'batch' ? 'batch' : 'college'
    });

    const visText = post.visibility === 'batch' ? `your batch (${req.user.batch})` : 'the whole college';
    res.status(201).json({
      success: true,
      message: `Pinned! ${visText} will see this 🎉`,
      post: _safePost(post, req.user._id)
    });
  } catch (err) {
    console.error('[MemoryWall] createMemoryPost error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to create post.' });
  }
};

// ─── GET /api/memory-wall ─────────────────────────────────────────────────────
export const getMemoryWall = async (req, res) => {
  try {
    const {
      cursor,
      limit = 12,
      filter = 'all', // all | photos | videos | text | batch
      mood,
      spotId,
      sort = 'latest', // latest | loved | onthisday
      search
    } = req.query;

    const query = {
      isHidden: false,
      college: req.user.college
    };

    // Batch filter
    if (filter === 'batch' || filter === 'my-batch') {
      query.visibility = 'batch';
      query.authorBatch = req.user.batch;
    }

    // Media type filter
    if (filter === 'photos') {
      query['media.0'] = { $exists: true };
      query['media.type'] = 'image';
    } else if (filter === 'videos') {
      query['media'] = { $elemMatch: { type: 'video' } };
    } else if (filter === 'text') {
      query['media'] = { $size: 0 };
    }

    // Mood filter
    if (mood && mood !== 'all') query.mood = mood;

    // Spot filter
    if (spotId) query['spotTag.spotId'] = spotId;

    // Cursor-based pagination
    if (cursor) {
      if (sort === 'latest') {
        query.createdAt = { $lt: new Date(cursor) };
      }
    }

    let sortObj = { createdAt: -1 };
    if (sort === 'loved') {
      // Sort by total reactions count — computed in aggregation
      sortObj = { totalReactions: -1, createdAt: -1 };
    } else if (sort === 'onthisday') {
      // Today's month-day filter
      const now = new Date();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      query.$expr = {
        $and: [
          { $eq: [{ $month: '$throwbackDate' }, month] },
          { $eq: [{ $dayOfMonth: '$throwbackDate' }, day] }
        ]
      };
    }

    const pageSize = Math.min(parseInt(limit), 24);

    let posts;
    if (sort === 'loved') {
      posts = await MemoryPost.aggregate([
        { $match: query },
        {
          $addFields: {
            totalReactions: {
              $add: [
                { $size: '$reactions.heart' },
                { $size: '$reactions.cry' },
                { $size: '$reactions.haha' },
                { $size: '$reactions.care' },
                { $size: '$reactions.grad' }
              ]
            }
          }
        },
        { $sort: { totalReactions: -1, createdAt: -1 } },
        { $limit: pageSize + 1 }
      ]);
    } else {
      posts = await MemoryPost.find(query)
        .sort(sortObj)
        .limit(pageSize + 1)
        .lean();
    }

    const hasMore = posts.length > pageSize;
    if (hasMore) posts.pop();

    const nextCursor = hasMore && posts.length > 0
      ? posts[posts.length - 1].createdAt?.toISOString()
      : null;

    const userId = req.user._id.toString();
    const safePosts = posts.map((p) => _safePostLean(p, userId));

    res.json({ success: true, posts: safePosts, nextCursor, hasMore });
  } catch (err) {
    console.error('[MemoryWall] getMemoryWall error:', err);
    res.status(500).json({ success: false, message: 'Failed to load wall.' });
  }
};

// ─── POST /api/memory-wall/:id/react ──────────────────────────────────────────
export const reactToPost = async (req, res) => {
  try {
    const { emoji } = req.body; // heart | cry | haha | care | grad
    const validEmojis = ['heart', 'cry', 'haha', 'care', 'grad'];
    if (!validEmojis.includes(emoji)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction.' });
    }

    const post = await MemoryPost.findById(req.params.id);
    if (!post || post.isHidden) {
      return res.status(404).json({ success: false, message: 'Post not found.' });
    }

    const userId = req.user._id;
    const arr = post.reactions[emoji];
    const idx = arr.findIndex((id) => id.toString() === userId.toString());

    if (idx === -1) {
      arr.push(userId); // add reaction
    } else {
      arr.splice(idx, 1); // toggle off
    }

    await post.save();
    res.json({ success: true, reactions: _serializeReactions(post.reactions, userId.toString()) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/memory-wall/:id/comments ───────────────────────────────────────
export const addComment = async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty.' });
    }
    if (containsProfanity(text)) {
      return res.status(400).json({
        success: false,
        message: "Keep it friendly! That comment has words we can't allow. 🌸"
      });
    }

    const post = await MemoryPost.findById(req.params.id);
    if (!post || post.isHidden) return res.status(404).json({ success: false, message: 'Post not found.' });

    post.comments.push({
      author: req.user._id,
      authorName: isAnonymous ? 'Anonymous' : req.user.name,
      authorBatch: req.user.batch,
      text: text.trim().slice(0, 500),
      isAnonymous: !!isAnonymous
    });

    await post.save();
    const newComment = post.comments[post.comments.length - 1];
    res.status(201).json({ success: true, comment: newComment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/memory-wall/:id/comments/:commentId/reply ──────────────────────
export const replyToComment = async (req, res) => {
  try {
    const { text, isAnonymous } = req.body;
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Reply cannot be empty.' });
    }
    if (containsProfanity(text)) {
      return res.status(400).json({ success: false, message: "Keep it friendly! 🌸" });
    }

    const post = await MemoryPost.findById(req.params.id);
    if (!post || post.isHidden) return res.status(404).json({ success: false, message: 'Post not found.' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

    comment.replies.push({
      author: req.user._id,
      authorName: isAnonymous ? 'Anonymous' : req.user.name,
      authorBatch: req.user.batch,
      text: text.trim().slice(0, 300),
      isAnonymous: !!isAnonymous
    });

    await post.save();
    res.status(201).json({ success: true, reply: comment.replies[comment.replies.length - 1] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/memory-wall/:id/save ───────────────────────────────────────────
export const savePost = async (req, res) => {
  try {
    const post = await MemoryPost.findById(req.params.id);
    if (!post || post.isHidden) return res.status(404).json({ success: false, message: 'Post not found.' });

    const userId = req.user._id;
    const idx = post.savedBy.findIndex((id) => id.toString() === userId.toString());
    let saved;
    if (idx === -1) {
      post.savedBy.push(userId);
      saved = true;
    } else {
      post.savedBy.splice(idx, 1);
      saved = false;
    }
    await post.save();
    res.json({ success: true, saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/memory-wall/:id/report ─────────────────────────────────────────
export const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await MemoryPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const alreadyReported = post.reports.some(
      (r) => r.reporter.toString() === req.user._id.toString()
    );
    if (alreadyReported) {
      return res.json({ success: true, message: "You've already reported this post. We'll look into it!" });
    }

    post.reports.push({ reporter: req.user._id, reason: (reason || '').slice(0, 300) });
    // Auto-hide if >= 5 reports
    if (post.reports.length >= 5) post.isHidden = true;
    await post.save();

    res.json({ success: true, message: "Report submitted. Our mods are on it. 🛡️" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── DELETE /api/memory-wall/:id ──────────────────────────────────────────────
export const deleteMemoryPost = async (req, res) => {
  try {
    const post = await MemoryPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });

    const isOwner = post.author.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "That's not your post to delete." });
    }

    await post.deleteOne();
    res.json({ success: true, message: 'Post deleted. Gone but not forgotten. 🗑️' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── ADMIN: PUT /api/memory-wall/:id/hide ─────────────────────────────────────
export const adminHidePost = async (req, res) => {
  try {
    const post = await MemoryPost.findByIdAndUpdate(
      req.params.id,
      { isHidden: req.body.hide !== false },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Post not found.' });
    res.json({ success: true, message: `Post ${post.isHidden ? 'hidden' : 'restored'}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/memory-wall/spots-map ───────────────────────────────────────────
export const getSpotMapPins = async (req, res) => {
  try {
    const pins = await MemoryPost.aggregate([
      {
        $match: {
          isHidden: false,
          college: req.user.college,
          'spotTag.spotId': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$spotTag.spotId',
          spotName: { $first: '$spotTag.spotName' },
          coordinates: { $first: '$spotTag.coordinates' },
          count: { $sum: 1 },
          latestPost: { $max: '$createdAt' }
        }
      }
    ]);
    res.json({ success: true, pins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Share capsule to wall ─────────────────────────────────────────────────────
export const shareCapsuleToWall = async (req, res) => {
  try {
    const { capsuleId, caption } = req.body;
    const { default: Capsule } = await import('../models/Capsule.js');

    const capsule = await Capsule.findById(capsuleId).select('+messageCiphertext +messageIv +messageTag');
    if (!capsule) return res.status(404).json({ success: false, message: 'Capsule not found.' });
    if (!capsule.isUnlocked) {
      return res.status(403).json({ success: false, message: 'Capsule must be unlocked before sharing.' });
    }
    if (capsule.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only the creator can share this capsule.' });
    }

    const { decryptMessage } = await import('../utils/crypto.js');
    const message = decryptMessage(capsule.messageCiphertext, capsule.messageIv, capsule.messageTag);

    const post = await MemoryPost.create({
      author: req.user._id,
      authorName: req.user.name,
      authorBatch: req.user.batch,
      college: req.user.college,
      isAnonymous: false,
      caption: caption || `🔓 From my time capsule: "${capsule.title}" — ${message.slice(0, 200)}${message.length > 200 ? '...' : ''}`,
      mood: 'Emotional',
      visibility: 'college'
    });

    res.status(201).json({ success: true, message: 'Capsule shared to Memory Wall! 🎉', post });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function _serializeReactions(reactions, userId) {
  return {
    heart: { count: reactions.heart.length, reacted: reactions.heart.some((id) => id.toString() === userId) },
    cry:   { count: reactions.cry.length,   reacted: reactions.cry.some((id)   => id.toString() === userId) },
    haha:  { count: reactions.haha.length,  reacted: reactions.haha.some((id)  => id.toString() === userId) },
    care:  { count: reactions.care.length,  reacted: reactions.care.some((id)  => id.toString() === userId) },
    grad:  { count: reactions.grad.length,  reacted: reactions.grad.some((id)  => id.toString() === userId) }
  };
}

function _safePost(post, userId) {
  const obj = post.toObject();
  return _safePostLean(obj, userId.toString());
}

function _safePostLean(obj, userId) {
  return {
    ...obj,
    reactions: _serializeReactions(obj.reactions || {}, userId),
    isSaved: (obj.savedBy || []).some((id) => id.toString() === userId),
    isOwner: obj.author?.toString() === userId,
    comments: (obj.comments || []).slice(-20) // last 20 comments
  };
}
