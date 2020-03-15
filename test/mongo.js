const MongoClient = require('mongodb').MongoClient;

const url = 'mongodb://stf_w:FEzDiatOIQfeQjaS@10.224.157.212:3001/stf';
// const url = 'mongodb://10.224.13.133:27017/'

const dbName = 'stf';
 
// Use connect method to connect to the server
MongoClient.connect(url, {
    poolSize: 10
}, function(err, client) {
    console.log(err);
  console.log("Connected successfully to server");
 
  const db = client.db(dbName);
 

  const collection = db.collection('devices');

  function query(index) {
      const tag = `query_${index}`;
      console.time(tag)
    collection.find({}).maxTimeMS(1).limit(10).toArray((err, docs) => {
    //   console.log(docs);
        console.timeEnd(tag);
    })
  }

  for(let i=0;i<30;i++) {
      query(i);
  }
});