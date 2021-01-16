const express = require('express');
const { getSites } = require('../../utils/firebase');
const router = express.Router();

router.get('/', async (req, res, next) => {

  let sites = await getSites();
  return res.status(200).json({ result: sites });
});

module.exports = router;
