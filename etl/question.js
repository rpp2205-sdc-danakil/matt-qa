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
const chunkMaxSize = 50000;

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

let itemCount = -1;
let failedCount = 0;

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

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

  const doInsert = (cb) => {
    Collection.insertMany(chunk)
      .then((res) => {
        chunk = [];
        setTimeout(cb, chunkDelay);
      })
      .catch(err => {
        console.error('Error inserting into collection..', err);
      });
    let memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    console.info('Inserting chunk...', `(items: ${numberWithCommas(itemCount)} | failed: ${failedCount} | mem usage: ${memUsed.toFixed(1)} MB)`);
  };

  var s = fs.createReadStream(csvPath)
    .pipe(es.split())
    .pipe(es.mapSync(function (line) {
      s.pause();
      if (itemCount === -1) {
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
      chunk.push(doc);
      if (chunk.length < chunkMaxSize) {
        s.resume();
      } else {
        doInsert(s.resume);
      }
    })
      .on('error', function (err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function () {
        if (chunk.length) {
          doInsert(process.exit);
        }
        console.log('Read entire file.');
      })
    );
}

console.clear();
console.info('LOADED,', 'waiting', (startDelay / 1000).toFixed(1), 'sec');
console.info(JSON.stringify({ chunkMaxSize, chunkDelay, errorDelay }));
setTimeout(runTransformAndLoad, startDelay);