const firebase = require("firebase-admin");

const serviceAccount = require("./firebaseKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

let db = firebase.firestore();

module.exports = { db };
