const mongoose = require('mongoose');

const connection = mongoose.createConnection('mongodb://stf_w:FEzDiatOIQfeQjaS@10.224.157.212:3001/stf',  {poolSize: 10});
// const connection = mongoose.createConnection('mongodb://@10.224.13.133:27017/stf', {poolSize: 10});

const Device = connection.model('Device', new mongoose.Schema({
    serial: String,
}));

function query(index) {
    console.time(`query_${index}`)
    Device.find({}).exec().then((doc) => {
        console.log(doc.length)
        console.timeEnd(`query_${index}`);
    })
}

for(let i =0;i<10;i++) {
    query(i);
}