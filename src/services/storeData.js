const {Firestore} = require("@google-cloud/firestore");  
 
async function storeData(id, data) {
  const db = new Firestore();
 
  const predictCollection = db.collection('predictions');
  return predictCollection.doc(id).set(data);
}

const getData = async () => {
  const db = new Firestore();
  const snapshotPredictions = await db.collection('predictions').get();
  const histories = snapshotPredictions.docs.map((doc) => ({
      id: doc.id,
      history: doc.data()
  }));
  return histories;
}
 
module.exports = { storeData , getData };