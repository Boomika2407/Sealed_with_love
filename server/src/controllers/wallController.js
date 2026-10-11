import Capsule from '../models/Capsule.js';
import { decryptMessage } from '../utils/crypto.js';
import { generateSignedMediaUrl } from '../utils/mediaStorage.js';

/**
 * Retrieves opened public capsules for the Campus Wall.
 * Only returns capsules that are both PUBLIC_WALL and isUnlocked: true.
 */
export const getPublicWall = async (req, res) => {
  try {
    const unlockedCapsules = await Capsule.find({
      visibility: 'PUBLIC_WALL',
      isUnlocked: true
    })
      .select('+messageCiphertext +messageIv +messageTag +mediaUrl +mediaPublicId')
      .sort({ unlockedAt: -1 })
      .limit(50);

    const wallItems = unlockedCapsules.map((cap) => {
      let decryptedMsg = '';
      try {
        decryptedMsg = decryptMessage(
          cap.messageCiphertext,
          cap.messageIv,
          cap.messageTag
        );
      } catch {
        decryptedMsg = '[Unable to decrypt letter]';
      }

      const signedUrl = cap.mediaPublicId
        ? generateSignedMediaUrl(cap.mediaPublicId)
        : null;

      const obj = cap.toObject();
      delete obj.messageCiphertext;
      delete obj.messageIv;
      delete obj.messageTag;
      delete obj.mediaPublicId;

      return {
        ...obj,
        message: decryptedMsg,
        mediaUrl: signedUrl
      };
    });

    res.json({
      success: true,
      count: wallItems.length,
      capsules: wallItems
    });
  } catch (error) {
    console.error('Error fetching public wall:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campus wall',
      error: error.message
    });
  }
};
