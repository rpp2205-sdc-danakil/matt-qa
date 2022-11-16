import { Question } from '../db.js';
import nReadlines from 'n-readlines';

const delayBeforeStart = 3000;
const filePath = '/Users/matt/hackreactor/projects/sdc/matt-qa/etl/questions.csv';
const chunkMaxSize = 5000;
let chunk = [];
const questionsLines = new nReadlines('/Users/matt/hackreactor/projects/sdc/matt-qa/etl/questions.csv');
console.log('LOADED FILE..');

let line = questionsLines.next();
let itemCount = 0;

const parseLine = (line) => {
  line = line.toString('utf8').split(',');
  //  0 |     1    |  2 |     3      |    4     |     5     |    6   |   7  |
  //  id,product_id,body,date_written,asker_name,asker_email,reported,helpful
  const obj = {
    _id: parseInt(line[0]),
    product_id: line[1],
    body: line[2].replace(/"/g, ''),
    date_written: line[3],
    asker_name: line[4].replace(/"/g, ''),
    asker_email: line[5].replace(/"/g, ''),
    reported: Boolean(line[6]),
    helpful: line[7]
  };

  return obj;
};
console.log('columns: ', parseLine(line));

const makeChunk = (nextLine) => {
  //  nextLine should be the readline 'next' fn
  const chunk = [];
  let line;

  while (line = nextLine() && chunk.length < chunkMaxSize) {
    const parsed = parseLine(line);
    chunk.push(parsed);
  }

  return chunk;
};

const insertChunk = (chunk) => {
  return Question.insertMany(chunk)
    .then(response => {
      itemCount += chunk.length;
      console.log('Inserted chunk...  ', '(', itemCount, ')');
    })
    .catch(err => console.warn('Error during insert: ', err));
}

const runTransformAndLoad = () => {
  console.log('Starting T & L ...');
  try {
    const chunk = makeChunk(questionsLines.next);
    insertChunk(chunk);
  } catch (err) {
    console.error(err);
  }
}

setTimeout(runTransformAndLoad, delayBeforeStart);