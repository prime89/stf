const mongoose = require('@byted-service/mongoose');

console.time('total')
console.time('connection')
// 使用 consul 协议建立连接
mongoose.connect('mongodb://stf_w:FEzDiatOIQfeQjaS@10.224.157.212:3001/stf', {
  // 通过 consul 字段可以传递 consul 的配置
  // 传递任何 mongoose 支持的参数
  useNewUrlParser: true,
  bufferMaxEntries: 0,  /* B */
  autoReconnect: true,
  poolSize: 1000,
});

console.log(mongoose.connections.length);

const schema = new mongoose.Schema({ serial: String });

function query(index) {
    console.time(`query_${index}`)
    console.time(`firstDoc_${index}`)
    const Device = mongoose.model('Device', schema);
    const cursor = Device.find({}).select('serial provider owner').maxTimeMS(50000).lean().limit(800).cursor();
    
    const docs = [];

    let isFirst = true;
    cursor.on('data', (doc) => {
        if (isFirst) {
            isFirst = false;
            console.timeEnd(`firstDoc_${index}`);
        }
        
        docs.push(doc);
    });
    return new Promise((r) => {
        cursor.on('end', () => {
            console.log(docs.length);
            console.timeEnd(`query_${index}`);
            r(true);
        })
    })


    // cursor.next().then(doc => {
    //     if (doc) {
    //         docs.push(doc)
    //         return cursor.next();
    //     }
    //     cursor.close();
    //     return docs;
    // }).then((docs) => {
    //     console.log(docs.length);
    //     console.timeEnd(`query_${index}`);
    // });
}

const arr = mongoose.connections.map((connection) => {
    return new Promise((resolve) => {
        connection.on('open', () => {
            console.log('opened==')
            resolve(true);
        });

        connection.on('disconnected', () => {
            console.log('disconnect===')
        })
    });
})

Promise.all(arr).then(() => {
    console.log('opened')
    console.timeEnd('connection')


    const queries = [];
    for(let i =0;i<10;i++) {
        queries.push(query(i))
    }
    Promise.all(queries).then(() => {
        console.timeEnd('total')

        console.log(mongoose.connections.length)
    })
})



// console.time('query');
// Device.find({}, {maxTimeMS: 10}).then((res) => {
//     console.timeEnd('query');
//     console.log(res)
// })
