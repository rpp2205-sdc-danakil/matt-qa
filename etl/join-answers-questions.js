const db = require('../src/db/db.js');

function getAnswers(id) {
  return db.Answer.find({ question_id: id }, {
    _id: 0,
    id: '$_id',
    body: 1,
    date: '$date_written',
    answerer_name: 1,
    helpfulness: 1,
    photos: 1
  });
}

function updateQuestion(id, update) {
  return db.Question.findByIdAndUpdate(id, update);
}

function getAnswersObject(id) {
  return getAnswers(id)
    .then((answers) => {
      const answersObj = {};

      for (let answer of answers) {
        answersObj[answer.id] = answer;
      }

      return Promise.resolve(answersObj);
    });
}

function joinOne(id) {
  return getAnswersObject(id)
    .then(answersObj => {
      return updateQuestion(id, { answers: answersObj });
    })
}

function joinAll(id, max) {
  if (!id || !max) {
    throw new Error('invalid id or max params');
  }
  joinOne(id).then(() => {
    if (id % 10000 === 0) {
      // console.log(`Updated ID: ${id}\t|\tmem: ${process.memoryUsage().heapUsed / 1024 / 1024} ...`);
      console.log(`Updated ID: ${id}`);
    }
    if (id < max) {
      joinAll(id + 1, max);
    } else {
      console.log('DONE!!!');
    }
  });
}

// maxAnswerId = 3518963
joinAll(1, 10);