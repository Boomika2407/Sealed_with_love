import Capsule from '../models/Capsule.js';
import Campus from '../models/Campus.js';
import Spot from '../models/Spot.js';
import { encryptMessage, decryptMessage } from '../utils/crypto.js';
import { calculateHaversineDistance, verifyLocationAccess } from '../utils/geo.js';
import { verifyTimeAccess } from '../utils/time.js';
import { uploadPrivateMedia, generateSignedMediaUrl } from '../utils/mediaStorage.js';
import { isPointInsideCampus } from '../utils/turfGeo.js';

/**
 * Creates a new time capsule.
 * Content is encrypted at rest using AES-256-GCM.
 * Sensitive fields are set with select: false in schema.
 */
export const createCapsule = async (req, res) => {
  try {
    const {
      title,
      capsuleType,
      message,
      unlockDate,
      spotId,
      locationName,
      latitude,
      longitude,
      radiusMeters,
      visibility,
      themeColor,
      stamp,
      tiltDeg
    } = req.body;

    if (!title || !message || !unlockDate) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, message, unlockDate'
      });
    }

    let resolvedLocationName = locationName;
    let lat = parseFloat(latitude);
    let lon = parseFloat(longitude);
    let parsedRadius = radiusMeters ? parseInt(radiusMeters, 10) : 100;

    // 1. If user selected an official pre-registered Spot
    if (spotId) {
      const existingSpot = await Spot.findById(spotId);
      if (existingSpot) {
        resolvedLocationName = existingSpot.name;
        lon = existingSpot.location.coordinates[0];
        lat = existingSpot.location.coordinates[1];
        parsedRadius = existingSpot.radiusMeters || 100;
      }
    }

    if (!resolvedLocationName || isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({
        success: false,
        message: 'Valid spot location or coordinates [longitude, latitude] are required.'
      });
    }

    // 2. Validate custom pins against real Campus Polygon boundary using Turf.js
    const activeCampus = await Campus.findOne({ isActive: true });
    if (activeCampus && activeCampus.boundary) {
      const isWithinCampus = isPointInsideCampus(lon, lat, activeCampus.boundary);
      if (!isWithinCampus) {
        return res.status(400).json({
          success: false,
          error: 'OUTSIDE_CAMPUS_BOUNDARY',
          message: `Whoa! That pin (${lat.toFixed(4)}, ${lon.toFixed(4)}) is outside ${activeCampus.name} campus bounds. You can't seal college memories in another city! 🗺️`
        });
      }
    }

    // Encrypt message at rest using AES-256-GCM
    const { ciphertext, iv, tag } = encryptMessage(message);

    // Handle optional media upload (Cloudinary authenticated or local signed fallback)
    let mediaData = null;
    if (req.file) {
      mediaData = await uploadPrivateMedia(req.file);
    }

    const capsule = await Capsule.create({
      title,
      capsuleType: capsuleType || 'FRESHERS_LETTER',
      creator: req.user._id,
      creatorName: req.user.name,
      batch: req.user.batch,
      unlockDate: new Date(unlockDate),
      location: {
        name: locationName,
        type: 'Point',
        coordinates: [lon, lat], // GeoJSON order: [longitude, latitude]
        radiusMeters: parsedRadius
      },
      visibility: visibility || 'ONLY_ME',
      messageCiphertext: ciphertext,
      messageIv: iv,
      messageTag: tag,
      mediaUrl: mediaData ? mediaData.secureUrl : null,
      mediaPublicId: mediaData ? mediaData.publicId : null,
      mediaType: mediaData ? 'image' : 'none',
      theme: {
        color: themeColor || 'blush',
        stamp: stamp || 'wax-heart',
        tiltDeg: tiltDeg !== undefined ? parseFloat(tiltDeg) : -1.5
      }
    });

    res.status(201).json({
      success: true,
      message: "Sealed. Don't even think about peeking.",
      capsule: {
        _id: capsule._id,
        title: capsule.title,
        capsuleType: capsule.capsuleType,
        unlockDate: capsule.unlockDate,
        location: capsule.location,
        visibility: capsule.visibility,
        hasMedia: capsule.mediaType !== 'none',
        theme: capsule.theme,
        isUnlocked: false,
        createdAt: capsule.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating capsule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seal capsule',
      error: error.message
    });
  }
};

/**
 * Gets all capsules belonging to the authenticated student.
 * Server-enforced access control: sensitive message and mediaUrl are omitted for locked capsules.
 */
export const getMyCapsules = async (req, res) => {
  try {
    const capsules = await Capsule.find({ creator: req.user._id })
      .sort({ createdAt: -1 });

    const safeCapsules = await Promise.all(
      capsules.map(async (cap) => {
        const timeCheck = verifyTimeAccess(cap.unlockDate);

        if (cap.isUnlocked) {
          // If already unlocked, safely query encrypted payload and decrypt
          const fullCap = await Capsule.findById(cap._id).select(
            '+messageCiphertext +messageIv +messageTag +mediaUrl +mediaPublicId'
          );

          let decryptedMsg = '';
          try {
            decryptedMsg = decryptMessage(
              fullCap.messageCiphertext,
              fullCap.messageIv,
              fullCap.messageTag
            );
          } catch {
            decryptedMsg = '[Unable to decrypt payload]';
          }

          const signedUrl = fullCap.mediaPublicId
            ? generateSignedMediaUrl(fullCap.mediaPublicId)
            : null;

          return {
            ...cap.toObject(),
            message: decryptedMsg,
            mediaUrl: signedUrl,
            timeCheck
          };
        }

        // LOCKED CAPSULE: Message and media are strictly NEVER sent
        return {
          ...cap.toObject(),
          message: undefined,
          mediaUrl: undefined,
          timeCheck
        };
      })
    );

    res.json({
      success: true,
      count: safeCapsules.length,
      serverTimeUtc: new Date().toISOString(),
      capsules: safeCapsules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve capsules',
      error: error.message
    });
  }
};

/**
 * Gets a single capsule by ID.
 * Employs server-enforced access control: does not leak locked content to unverified requests.
 */
export const getCapsuleById = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'This page graduated early. (Capsule not found)'
      });
    }

    const timeCheck = verifyTimeAccess(capsule.unlockDate);

    // If unlocked, deliver decrypted content
    if (capsule.isUnlocked) {
      const fullCap = await Capsule.findById(capsule._id).select(
        '+messageCiphertext +messageIv +messageTag +mediaUrl +mediaPublicId'
      );

      let decryptedMsg = '';
      try {
        decryptedMsg = decryptMessage(
          fullCap.messageCiphertext,
          fullCap.messageIv,
          fullCap.messageTag
        );
      } catch {
        decryptedMsg = '[Unable to decrypt content]';
      }

      const signedUrl = fullCap.mediaPublicId
        ? generateSignedMediaUrl(fullCap.mediaPublicId)
        : null;

      return res.json({
        success: true,
        capsule: {
          ...capsule.toObject(),
          message: decryptedMsg,
          mediaUrl: signedUrl,
          timeCheck
        }
      });
    }

    // Locked: Return metadata only
    res.json({
      success: true,
      capsule: {
        ...capsule.toObject(),
        timeCheck
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch capsule',
      error: error.message
    });
  }
};

/**
 * THE CRITICAL UNLOCK ENDPOINT:
 * Dual-key gatekeeper enforcing both:
 * 1. Server-authoritative UTC date arrival.
 * 2. Physical geospatial proximity (within spot radius + GPS accuracy).
 * 
 * Locked content is NEVER provided unless both checks pass.
 */
export const unlockCapsule = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, accuracy } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Device coordinates (latitude, longitude) are required to verify campus proximity.'
      });
    }

    const capsule = await Capsule.findById(id).select(
      '+messageCiphertext +messageIv +messageTag +mediaUrl +mediaPublicId'
    );

    if (!capsule) {
      return res.status(404).json({
        success: false,
        message: 'This page graduated early. (Capsule not found)'
      });
    }

    // 1. Check Server UTC Time Lock (Strict server-enforced UTC comparison)
    const timeVerification = verifyTimeAccess(capsule.unlockDate);

    if (!timeVerification.isUnlocked) {
      return res.status(403).json({
        success: false,
        error: 'TIME_LOCKED',
        message: timeVerification.message,
        details: {
          daysLeft: timeVerification.daysLeft,
          unlockDateUtc: timeVerification.unlockDateUtc,
          serverTimeUtc: timeVerification.serverTimeUtc
        }
      });
    }

    // 2. Check Physical Campus Proximity via Haversine Formula
    const targetLon = capsule.location.coordinates[0];
    const targetLat = capsule.location.coordinates[1];
    const spotRadius = capsule.location.radiusMeters || 100;

    const locationVerification = verifyLocationAccess({
      userLat: parseFloat(latitude),
      userLon: parseFloat(longitude),
      userAccuracy: accuracy !== undefined ? parseFloat(accuracy) : null,
      targetLat,
      targetLon,
      radiusMeters: spotRadius,
      locationName: capsule.location.name
    });

    if (!locationVerification.isWithinRange) {
      return res.status(403).json({
        success: false,
        error: 'LOCATION_LOCKED',
        message: locationVerification.message,
        details: {
          distanceMeters: locationVerification.distanceMeters,
          allowedRadius: locationVerification.allowedRadius,
          spotName: capsule.location.name
        }
      });
    }

    // BOTH CHECKS PASSED: Decrypt AES-256-GCM ciphertext
    let decryptedMessage = '';
    try {
      decryptedMessage = decryptMessage(
        capsule.messageCiphertext,
        capsule.messageIv,
        capsule.messageTag
      );
    } catch (decryptErr) {
      console.error('Decryption failed:', decryptErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to decrypt capsule content. Integrity check failed.'
      });
    }

    // Generate short-lived signed URL for authenticated media
    const signedMediaUrl = capsule.mediaPublicId
      ? generateSignedMediaUrl(capsule.mediaPublicId)
      : null;

    // Mark as unlocked
    capsule.isUnlocked = true;
    capsule.unlockedAt = new Date();
    capsule.unlockedBy = capsule.unlockedBy || [];
    if (!capsule.unlockedBy.some((uid) => uid.toString() === req.user._id.toString())) {
      capsule.unlockedBy.push(req.user._id);
    }
    await capsule.save();

    res.json({
      success: true,
      message: 'WELCOME BACK. You survived college. 🎓',
      capsule: {
        _id: capsule._id,
        title: capsule.title,
        capsuleType: capsule.capsuleType,
        creatorName: capsule.creatorName,
        batch: capsule.batch,
        unlockDate: capsule.unlockDate,
        location: capsule.location,
        theme: capsule.theme,
        isUnlocked: true,
        unlockedAt: capsule.unlockedAt,
        message: decryptedMessage,
        mediaUrl: signedMediaUrl,
        reactions: capsule.reactions
      }
    });
  } catch (error) {
    console.error('Error during capsule unlock:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while unlocking capsule',
      error: error.message
    });
  }
};

/**
 * Toggle heart reaction on a capsule
 */
export const reactToCapsule = async (req, res) => {
  try {
    const capsule = await Capsule.findById(req.params.id);
    if (!capsule) {
      return res.status(404).json({ success: false, message: 'Capsule not found' });
    }

    if (!capsule.reactions) {
      capsule.reactions = { hearts: 0, reactedUsers: [] };
    }

    const userId = req.user._id.toString();
    const existingIndex = capsule.reactions.reactedUsers.findIndex(
      (u) => u.toString() === userId
    );
    const hasReacted = existingIndex !== -1;

    if (hasReacted) {
      capsule.reactions.reactedUsers.splice(existingIndex, 1);
      capsule.reactions.hearts = Math.max(0, capsule.reactions.hearts - 1);
    } else {
      capsule.reactions.reactedUsers.push(req.user._id);
      capsule.reactions.hearts += 1;
    }

    await capsule.save();

    res.json({
      success: true,
      hearts: capsule.reactions.hearts,
      hasReacted: !hasReacted
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to react to capsule',
      error: error.message
    });
  }
};
