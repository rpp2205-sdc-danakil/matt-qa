const db = require('../db/db-prod.js');

exports.getQuestions = function (req, res) {
  /* GET /qa/questions/:product_id */

  // check for req.params.product_id
  // catch and deal with invalid product_id before and after db request
  // set options with page and count variables
  // call db method
  // refactor the data
  // send it
  // console.log('METHODS', db.Question.getQuestions);
  const productId = Number(req.query.product_id);
  const options = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 5
  };

  if (!productId) {
    res.status(400).end();
    return;
  }

  db.Question.getQuestions(productId, options)
    .then(questions => {
      // console.log('GOT DATA! ', questions);
      const response = {};
      response.product_id = String(productId);
      response.results = questions;
      for (const question of questions) {
        if (question.answers) {
          for (const id in question.answers) {
            const answer = question.answers[id];

            if (answer.reported) {
              delete question.answers[id];
            } else {
              delete answer.answerer_email;
            }
          }
        }
      }
      res.status(200).send(response);
    })
    .catch(err => {
      console.log('ERROR: getQuestions', err);
      res.status(500).end();
    });
};

exports.getAnswers = (req, res) => {

};