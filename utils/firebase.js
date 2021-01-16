const firebase = require("firebase-admin");

const serviceAccount = require("./firebaseKey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});

let db = firebase.firestore();

const getSites = async () => {
  let list = [];
  await db.collection('sites').get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
  });
  return list;
}

module.exports = { db, getSites };
