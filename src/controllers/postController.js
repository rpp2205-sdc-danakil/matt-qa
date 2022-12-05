const db = require('../db/db-prod.js');

exports.postQuestion = (req, res) => {
  const { body, name, email, product_id } = req.body;
  if (!body || !name || !email || !product_id) {
    res.status(400).end();
    return;
  }

  const question = {
    product_id: product_id,
    body: body,
    asker_name: name,
    asker_email: email,
    date_written: Date.now(),
    helpfulness: 0,
    reported: false
  };

  db.Question.maxId()
    .then(lastId => {
      console.log('MAX', lastId);
      question._id = lastId + 1;
      return db.Question.insertNewQuestion(question)
    })
    .then(result => {
      res.status(201).send(question);
    })
    .catch(err => {
      console.log('Error inserting new question', err);
      res.status(500).end();
    });
};

exports.postAnswer = (req, res) => {
  const questionId = req.params.question_id;
  const { body, name, email, photos } = req.body;
  if (!questionId || !body || !name || !email) {
    res.status(400).end();
    return;
  }
  if (!photos) {
    photos = [];
  }

  const answer = {
    question_id: questionId,
    body: body,
    date: Date.now(),
    answerer_name: name,
    answerer_email: email,
    helpfulness: 0,
    reported: false,
    photos: photos
  };

  db.Answer.maxId()
    .then(lastId => {
      console.log('MAX', lastId);
      answer._id = lastId + 1;
      return db.Answer.insertNewAnswer(answer);
    })
    .then(result => {
      res.status(201).send(answer);
    })
    .catch(err => {
      console.log('Error inserting new answer');
      res.status(500).end();
    });
};