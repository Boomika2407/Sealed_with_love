import Campus from '../models/Campus.js';
import Spot from '../models/Spot.js';
import { isPointInsideCampus } from '../utils/turfGeo.js';
import { seedDemoDataIfEmpty } from '../utils/seed.js';

/**
 * Gets the current active campus configuration (with GeoJSON Polygon boundary)
 */
export const getCampus = async (req, res) => {
  try {
    let campus = await Campus.findOne({ isActive: true });
    if (!campus) {
      campus = await Campus.findOne();
    }

    if (!campus) {
      // Auto-seed if not yet loaded
      await seedDemoDataIfEmpty();
      campus = await Campus.findOne({ isActive: true }) || await Campus.findOne();
    }

    // Fallback campus object if database has no records
    if (!campus) {
      return res.json({
        success: true,
        campus: {
          name: 'Coimbatore Institute of Technology',
          code: 'CIT_COIMBATORE',
          city: 'Coimbatore, Tamil Nadu',
          center: [77.0274, 11.0277],
          zoom: 17,
          boundary: {
            type: 'Polygon',
            coordinates: [
              [
                [77.024792, 11.0252095],
                [77.0248796, 11.0246174],
                [77.0254527, 11.0246677],
                [77.0255216, 11.0243531],
                [77.0296894, 11.025048],
                [77.0296368, 11.0271274],
                [77.029296, 11.0284461],
                [77.0291505, 11.0297877],
                [77.0286976, 11.0301435],
                [77.0285581, 11.0306955],
                [77.025105, 11.0282723],
                [77.0254559, 11.0268839],
                [77.0257352, 11.0253567],
                [77.024792, 11.0252095]
              ]
            ]
          }
        }
      });
    }

    res.json({
      success: true,
      campus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campus boundary',
      error: error.message
    });
  }
};

/**
 * Gets all active campus spots
 */
export const getSpots = async (req, res) => {
  try {
    let spots = await Spot.find({ isActive: true }).sort({ category: 1, name: 1 });
    if (spots.length === 0) {
      await seedDemoDataIfEmpty();
      spots = await Spot.find({ isActive: true }).sort({ category: 1, name: 1 });
    }

    res.json({
      success: true,
      count: spots.length,
      spots
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve spots',
      error: error.message
    });
  }
};

/**
 * Admin: Creates a new campus spot
 * Validates that spot coordinates are inside campus polygon boundary
 */
export const createSpot = async (req, res) => {
  try {
    const { name, category, description, longitude, latitude, radiusMeters } = req.body;

    if (!name || longitude === undefined || latitude === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Spot name, longitude, and latitude are required'
      });
    }

    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    const radius = radiusMeters ? parseInt(radiusMeters, 10) : 100;

    // Validate coordinates are within campus boundary
    const campus = await Campus.findOne({ isActive: true });
    if (campus && campus.boundary) {
      const isInside = isPointInsideCampus(lon, lat, campus.boundary);
      if (!isInside) {
        return res.status(400).json({
          success: false,
          error: 'OUTSIDE_CAMPUS_BOUNDARY',
          message: `Cannot place spot outside campus polygon (${lat.toFixed(4)}, ${lon.toFixed(4)}). Spot must be within ${campus.name} bounds! 🗺️`
        });
      }
    }

    const spot = await Spot.create({
      name,
      campus: campus?._id,
      category: category || 'iconic',
      description: description || '',
      location: {
        type: 'Point',
        coordinates: [lon, lat] // GeoJSON standard [lon, lat]
      },
      radiusMeters: radius,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'New campus spot registered successfully! 📍',
      spot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create spot',
      error: error.message
    });
  }
};

/**
 * Admin: Updates an existing campus spot
 */
export const updateSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, description, longitude, latitude, radiusMeters } = req.body;

    const spot = await Spot.findById(id);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    if (name) spot.name = name;
    if (category) spot.category = category;
    if (description !== undefined) spot.description = description;
    if (radiusMeters) spot.radiusMeters = parseInt(radiusMeters, 10);

    if (longitude !== undefined && latitude !== undefined) {
      const lon = parseFloat(longitude);
      const lat = parseFloat(latitude);

      const campus = await Campus.findOne({ isActive: true });
      if (campus && campus.boundary) {
        const isInside = isPointInsideCampus(lon, lat, campus.boundary);
        if (!isInside) {
          return res.status(400).json({
            success: false,
            error: 'OUTSIDE_CAMPUS_BOUNDARY',
            message: `Coordinates are outside campus boundary! 🗺️`
          });
        }
      }

      spot.location.coordinates = [lon, lat];
    }

    await spot.save();

    res.json({
      success: true,
      message: 'Spot updated successfully! 📍',
      spot
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update spot',
      error: error.message
    });
  }
};

/**
 * Admin: Deletes / deactivates a spot
 */
export const deleteSpot = async (req, res) => {
  try {
    const { id } = req.params;
    const spot = await Spot.findById(id);
    if (!spot) {
      return res.status(404).json({ success: false, message: 'Spot not found' });
    }

    await Spot.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Campus spot deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete spot',
      error: error.message
    });
  }
};
