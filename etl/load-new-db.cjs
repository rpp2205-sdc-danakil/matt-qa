const db = require('../src/db/db.js');
const db2 = require('../src/db/db2.js');
const promiseMap = require('./promiseLoop.js');
// console.log('LOADED MAP', typeof promiseMap);

function getQuestion(questionId) {
  return db.Question.findById(questionId);
}

function getAnswer(answerId) {
  return db.Answer.findById(answerId);
}

function getAnswers(questionId) {
  return db.Answer.find({ question_id: Number(questionId) });
}

function getAnswersObject(questionId) {
  return getAnswers(questionId)
    .then((answers) => {
      const answersObj = {};

      for (let answer of answers) {
        answersObj[answer.id] = answer;
      }

      return Promise.resolve(answersObj);
    });
}

function getPhotosArray(answerId) {
  // console.log('ID:', answerId);
  let answer_id;
  try {
    answer_id = Number(answerId);
  } catch (error) {
    // console.log(`Failed to cast '${answerId}' to a number type`);
    return Promise.reject(new Error(`getPhotoArray: Failed to cast '${answerId}' to a number type`));
  }
  if (!answer_id || answer_id === NaN) {
    return Promise.reject(new Error(`getPhotoArray: Failed to cast '${answerId}' to a number type`));
  }
  // console.log('Processing answer_id:', answerId);
  return db.Photo.find({ answer_id })
    .then(photoDocs => {
      return Promise.resolve(photoDocs.map(item => item.url));
    });
}

function insertChunk(chunk) {
  return db2.Question.insertMany(chunk)
    .catch(error => {
      console.log(error);
    });
}

function joinOne(questionId) {
  let _question;
  let _answers;

  return getQuestion(questionId)
    .then(question => {
      _question = question;
      // console.log(_question);
      return getAnswersObject(questionId);
    })
    .then(answersObj => {
      _answers = answersObj;
      _question.answers = _answers;
      return promiseMap(getPhotosArray, (() => {
        const answerIds = Object.keys(_answers);
        // console.log('IDS:', answerIds);
        if (!answerIds.length) {
          return () => null;
        }
        let i = 0;
        let ran = false;

        return (err, result) => {
          if (!ran) {
            ran = true;
            return answerIds[i];
          }
          if (err) {
            console.log(err);
          } else {
            _answers[answerIds[i]].photos = result;
          }

          i++;
          // console.log('RETURNING ID:',answerIds[i]);
          return answerIds[i] ? answerIds[i] : null;
        }
      })());
    })
    .then(() => {
      cache.push(_question);
    })
    .catch(error => {
      console.error('Error getting question', questionId);
      console.log(error);
    })
}

//////////////////////////////////////////

let cache = [];
let id = 1;

function joinAll(questionId, maxId) {
  if (questionId > maxId) {
    insertChunk(cache)
      .then(() => {
        console.log('DONE');
      });
  } else if (cache.length >= 10000) {
    console.log(`INSERTING CHUNK...\t(${id})`);
    insertChunk(cache)
      .then(() => {
        cache = [];
        joinAll(questionId, maxId);
      });
  } else {
    joinOne(questionId)
      .then(() => {
        id++;
        joinAll(questionId + 1, maxId);
      });
  }
}

console.clear();
joinAll(1, 3518963);
// joinAll(1, 10);
//setTimeout(process.exit, 10000);