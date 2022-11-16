const fs = require('fs');
const es = require('event-stream');
const path = require('path');

/******* CONFIGURABLES **********************************/
const Collection = require('../db.js').Question;
const csvPath = path.resolve(__dirname, 'questions.csv');
const failedPath = path.resolve(__dirname, 'questions.failed.txt');

const startDelay = 5000;
const errorDelay = 2000;
const chunkDelay = 0;
const chunkMaxSize = 10000;

const parseDocument = (line) => {
  //  0 |     1    |  2 |     3      |    4     |     5     |    6   |   7  |
  //  id,product_id,body,date_written,asker_name,asker_email,reported,helpful
  const obj = {
    _id: line[0],
    product_id: line[1],
    body: line[2],
    date_written: line[3],
    asker_name: line[4],
    asker_email: line[5],
    reported: Boolean(line[6]),
    helpful: line[7]
  };
  return obj;
};
/*******************************************************/

let chunk = [];

let itemCount = 0;
let failedCount = 0;


const logFailedData = (data) => {
  console.warn('LOGGING: ', data);
  fs.appendFile(failedPath, JSON.stringify(data) + '\n', err => {
    if (err) {
      console.error('logging failed data has failed..');
    }
  });
}

const runTransformAndLoad = () => {
  console.info('Starting T & L ...');

  var s = fs.createReadStream(csvPath)
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
      s.pause();
      if (itemCount < 1) {
        itemCount++;
        s.resume();
        return;
      }
      itemCount++;

      let doc;
      try {
        line = `[${line}]`;
        doc = parseDocument(JSON.parse(line));
      } catch (err) {
        failedCount++;
        console.warn('FAILED parsing line: ', line);
        setTimeout(s.resume, errorDelay);
        return;
      }
      // console.log('PARSED LINE: ', parsed)
      if (chunk.length < chunkMaxSize) {
        chunk.push(doc);
        s.resume();
      } else {
        Collection.insertMany(chunk)
          .then((res) => {
            let memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
            console.info('Inserted chunk...', `(items: ${itemCount} | failed: ${failedCount} | mem usage: ${memUsed.toFixed(1)} MB)`);
            chunk = [];
            setTimeout(s.resume, chunkDelay);
          })
          .catch(err => {
            console.error('Error inserting into collection..', err);
          });
      }
    })
      .on('error', function (err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function () {
        console.log('Read entire file.')
        process.exit();
      })
    );
}

console.clear();
console.info('LOADED,', 'waiting', (startDelay / 1000).toFixed(1), 'sec');
console.info(JSON.stringify({ chunkMaxSize, chunkDelay, errorDelay }));
setTimeout(runTransformAndLoad, startDelay);