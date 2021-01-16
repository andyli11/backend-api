const express = require('express');
const multer = require('multer');
const firebase = require('firebase-admin');
const axios = require('axios');
const { db } = require('../../utils/firebase');
const router = express.Router();
const upload = multer();

// Returns the placeId of the nearest road.
const getNearestRoad = async (lat, lon) => {
  try {
    let res = await axios.post(`https://roads.googleapis.com/v1/nearestRoads?key=${process.env.API_KEY}&points=${lat},${lon}`);
    if (res.status !== 200) {
      return null;
    }
    if (!res.data || !res.data.snappedPoints || res.data.snappedPoints.length === 0) {
      return null;
    }
    return res.data.snappedPoints[0].placeId;
  }
  catch (err) {
    return null;
  }
}

const getRoadDetails = async placeId => {
  try {
    let res = await axios.post(`https://maps.googleapis.com/maps/api/place/details/json?key=${process.env.API_KEY}&place_id=${placeId}`);
    if (res.status !== 200) {
      return null;
    }
    // TODO: Check if place is a road.
    return res.data;
  }
  catch (err) {
    return null;
  }
}

const uploadSiteDetails = async (lat, lon, roadDetails) => {
  try {
    // TODO: Strucure object in a better manner.
    let docRef = await db.collection('sites').add({
      location: new firebase.firestore.GeoPoint(lat, lon),
      details: roadDetails
    });
    return docRef.id;  // The ID of the inserted element.
  }
  catch (err) {
    return null;
  }
}

/* GET home page. */
router.post('/', upload.none(), async (req, res, next) => {

  if (!req.body) {
    return res.status(500).json({ result: 'Missing req.body.' });
  }
  if (!req.body.lon || !req.body.lat) {
    return res.status(500).json({ result: 'Missing latitude or longitude.' });
  }

  let { lat, lon } = req.body;

  lat = parseFloat(lat);
  lon = parseFloat(lon);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ result: 'Invalid latitude or longitude.' });
  }
  if (lat < -90 || lat > 90) {
    return res.status(400).json({ result: 'Latitude out of range.' });
  }
  if (lon < -180 || lon > 180) {
    return res.status(400).json({ result: 'Longitude out of range.' });
  }

  // Round to 7 decimal places.
  lat = Math.round(lat * 10000000) / 10000000;
  lon = Math.round(lon * 10000000) / 10000000;

  let promise = new Promise(async (resolve, reject) => {

    let roadId = await getNearestRoad(lat, lon);
    if (!roadId) {
      reject([ 400, 'Couldn\'t get nearest road.' ]);
    }

    let roadDetails = await getRoadDetails(roadId);
    if (!roadDetails) {
      reject([ 400, 'Couldn\'t get road details.' ]);
    }

    let uploadDetails = await uploadSiteDetails(lat, lon, roadDetails);
    if (!uploadDetails) {
      reject([ 400, 'Couldn\'t upload site.' ]);
    }

    resolve(uploadDetails);
  });

  try {
    let siteId = await promise;
    res.status(200).json({ result: { id: siteId } });
  }
  catch (err) {
    return res.status(err[0]).json({ result: err[1] });
  }

});

module.exports = router;
