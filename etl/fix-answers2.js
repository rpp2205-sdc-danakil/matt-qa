const db = require('../src/db/db-prod.js');
const promiseMap = require('./promiseLoop.js');

function getQuestion(questionId) {
  return db.Question.findById(questionId);
}

function getAnswers(questionId) {
  return db.Question.findById(questionId, {
    answers: 1
  }).exec()
    .then(data => {
      if (data && data.answers) {
        return Promise.resolve(data.answers);
      } else {
        return Promise.resolve(null);
      }
    });
}

function getAnswerArray(answers, questionId) {
  for (const key in answers) {
    const answer = answers[key];
    // console.log('ANSWER:', answer);
    Object.assign(answer, {
      _id: answer.id,
      question_id: questionId,
    });
    delete answer.id;
  }

  // console.log('ANSWERS!', answers);
  return Object.values(answers);
}

function fixOne(questionId) {
  return getAnswers(questionId)
    .then(answers => {
      // console.log('DB ANSWERS', answers)
      if (answers) {
        answers = getAnswerArray(answers, questionId);
        return Promise.resolve(answers);
      }
    });
}

function fixAll(questionId, maxId) {
  if (questionId <= maxId) {
    fixOne(questionId)
      .then(answers => {
        if (answers && answers.length) {
          return db.Answer.insertMany(answers);
        }
      })
      .then(results => {
        if (questionId % 10000 === 0) {
          console.log('Inserted:', questionId);
        }
        // console.log('INSERT RESULTS:', results);
        fixAll(questionId + 1, maxId);
      })
      .catch(err => {
        console.log('ERROR INSERTING ANSWERS FOR QUESTION:', questionId);
        console.log(err);
      });
  } else {
    console.log('DONE!');
  }
}

// fixAll(6, 6);
fixAll(1, 3518963);