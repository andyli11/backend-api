const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {

  res.json({ true: 'false' })

});

module.exports = router;
