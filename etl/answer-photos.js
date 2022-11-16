import { Photo } from '../db.js';
import nReadlines from 'n-readlines';
const answerPhotosLines = new nReadlines('/Users/matt/hackreactor/projects/sdc/matt-qa/etl/answers_photos.csv');

const chunkMaxSize = 5000;
let chunk = [];

let line = answerPhotosLines.next();
let lineNumber = 1;
let linesInChunk = 0;
console.log('columns: ', line.toString('utf8'));
const parseLine = (line) => {
  const obj = {};

  obj.answer_id = line[1];
  obj.url = line[2];

  return obj;
};

console.log('LOADING FILE..');
const insertChunk = () => {
  while (line = answerPhotosLines.next()) {
    line = line.toString('utf8').split(',');
    line[2] = line[2].replace(/"/g, '');
    chunk.push(parseLine(line));
    lineNumber++;
    linesInChunk++;
    if (linesInChunk >= chunkMaxSize) {
      linesInChunk = 0;
      Photo.insertMany(chunk)
        .then(response => {
          insertChunk();
          console.log('Inserted chunk...  ', '(', lineNumber, ')');
        })
        .catch(err => console.warn('Error during insert: ', err));
      chunk = [];
      break;
    }
  }
  if (!line) {
    console.log('DONE LOADING.');
    process.exit();
  }
}

insertChunk();