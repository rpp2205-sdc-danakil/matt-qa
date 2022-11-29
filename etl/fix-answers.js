const db = require('../src/db/db-prod.js');
const promiseMap = require('./promiseLoop.js');

function getQuestion(questionId) {
  return db.Question.findById(questionId);
}

function getAnswers(questionId) {
  return db.Question.findById(questionId, {
    answers: 1
  }, { lean: true }).exec()
  .then(data => {
    if (data && data.answers) {
      return Promise.resolve(data.answers);
    } else {
      return Promise.resolve(null);
    }
  });
}

function fixAnswers(answers) {

  for (const key in answers) {
    const answer = answers[key];
    // console.log('ANSWER:', answer);
    Object.assign(answer, {
      id: answer['_id'] || answer.id,
      date: answer['date_written'] || answer.date
    })
    // answer.id = new Number(answer['_id']);
    // answer.date = answer['date_written'];
    delete answer['question_id'];
    delete answer['_id'];
    delete answer['date_written'];
    // answers[answer.id] = answer;
  }

  // console.log('ANSWERS!', answers);
  return answers;
}

function fixOne(questionId) {
  return getAnswers(questionId)
  .then(answers => {
    if (answers) {
      return Promise.resolve(fixAnswers(answers));
    }
  });
}

function fixAll(questionId, maxId) {
  if (questionId <= maxId) {
    fixOne(questionId)
      .then(answers => {
        if (answers) {
          return db.Question.findByIdAndUpdate(questionId, { answers });
        }
      })
      .then(results => {
        if (questionId % 10000 === 0) {
          console.log('UPDATED:', questionId);
        }
        fixAll(questionId + 1, maxId);
      })
      .catch(err => {
        console.log('ERROR UPDATING QUESTION:', questionId);
        console.log(err);
      });
  } else {
    console.log('DONE!');
  }
}

// fixAll(6, 6);
fixAll(1, 3518963);