var express = require('express');
const {
  db
} = require('../utils/firebase');
var router = express.Router();

/* GET home page. */
router.get('/', async function (req, res, next) {
  let promise = new Promise((resolve, reject) => {
    db.collection("test").get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
      });
    });
    resolve();
  });

  await promise.then(() => {
    res.json({
      response: true
    });
  });

});

module.exports = router;