const express = require('express');
const { getSites } = require('../../utils/firebase');
const router = express.Router();

// Enable CORS.
router.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

router.get('/', async (req, res, next) => {

  let sites = await getSites();
  return res.status(200).json({ result: sites });
});

module.exports = router;
