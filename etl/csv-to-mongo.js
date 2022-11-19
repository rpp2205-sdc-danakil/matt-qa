// const myArgs = process.argv.slice(2);
const envFile = process.argv[2] ? process.argv[2] : '';
require('custom-env').env(envFile);
if (!process.env.COLLECTION_NAME) {
  console.error('ERROR: env file not loaded.');
  process.exit();
}
const fs = require('fs');
const es = require('event-stream');
const path = require('path');

/******* CONFIGURABLES (set in env file) ************************/
const Collection = require('../db.js')[process.env.COLLECTION_NAME];
const csvPath = path.resolve(__dirname, process.env.CSV_PATH);
const failedPath = path.resolve(__dirname, process.env.FAILED_PATH);

const startDelay = process.env.START_DELAY;
const errorDelay = process.env.ERROR_DELAY;
const chunkDelay = process.env.CHUNK_DELAY;
const chunkMaxSize = process.env.CHUNK_MAX_SIZE;

const docTemplate = {};
for (let i = 0; i < process.env.NUM_COLS; i++) {
  const col = process.env['COL' + i];
  if (col !== 'null') {
    docTemplate[col] = i;
  }
}
Object.freeze(docTemplate);
/****************************************************************/

let chunk = [];

let itemCount = -1;
let failedCount = 0;

const timesInsert = [];
const timesParse = [];

const numberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

const logFailedData = (data) => {
  console.warn('LOGGING: ', data);
  fs.appendFile(failedPath, JSON.stringify(data) + '\n', err => {
    if (err) {
      console.error('logging failed data has failed..');
    }
  });
};

const logAverageTimes = () => {
  const toFixed = (num) => {
    return num.toFixed(3);
  }

  let totalParseItems = 0;
  let totalParseTime = 0;
  let totalInsertItems = 0;
  let totalInsertTime = 0;

  for (const [items, time] of timesParse) {
    totalParseItems += items;
    totalParseTime += time;
  }
  for (const [items, time] of timesInsert) {
    totalInsertItems += items;
    totalInsertTime += time;
  }

  console.info('Average time to PARSE 10,000 items: ', toFixed((totalParseTime / totalParseItems) * 10000), 'ms');
  console.info('Average time to INSERT 10,000 items: ', toFixed((totalInsertTime / totalInsertItems) * 10000), 'ms');
}

const parseDocument = (line) => {
  const doc = {};
  for (let key in docTemplate) {
    doc[key] = line[docTemplate[key]];
  }
  return doc;
};

const runTransformAndLoad = () => {
  console.info('Starting T & L ...');

  const doInsert = (cb) => {
    const timeStart = Date.now();
    Collection.insertMany(chunk)
    .then((res) => {
      const time = (Date.now() - timeStart);
      console.info(`${chunk.length} items inserted in`, (time / 1000).toFixed(3), 's');
      timesInsert.push([chunk.length, time]);
      chunk = [];
      setTimeout(cb, chunkDelay);
    })
    .catch(err => {
      console.error('Error inserting into collection..', err);
    });
    const memUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    process.stdout.write(`Inserting chunk... (item: ${numberWithCommas(itemCount)} | fail: ${failedCount} | mem: ${memUsed.toFixed(1)} MB)\t--> `);
  };

  let timeChunkParse = Date.now();
  console.time('Total time to import CSV (including delays)');
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

      chunk.push(doc);
      if (chunk.length < chunkMaxSize) {
        s.resume();
      } else {
        timesParse.push([chunk.length, Date.now() - timeChunkParse]);
        doInsert(() => {
          timeChunkParse = Date.now();
          s.resume();
        });
      }
    })
      .on('error', function (err) {
        console.log('Error while reading file.', err);
      })
      .on('end', function () {
        if (chunk.length) {
          timesParse.push([chunk.length, Date.now() - timeChunkParse]);
          doInsert(() => {
            console.log();
            console.timeEnd('Total time to import CSV (including delays)');
            logAverageTimes();
            process.exit();
          });
        } else {
          console.log();
          console.timeEnd('Total time to import CSV (including delays)');
          logAverageTimes();
          process.exit();
        }
      })
    );
}

console.clear();
console.info('LOADED! ', 'waiting', (startDelay / 1000).toFixed(1), 'sec ...');
console.info(JSON.stringify({ chunkMaxSize, chunkDelay, errorDelay }));
setTimeout(runTransformAndLoad, startDelay);