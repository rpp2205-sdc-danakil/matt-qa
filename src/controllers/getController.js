const db = require('../db/db-prod.js');

const convertPhotoArray = function (array) {
  return array.map((url, i) => {
    return {
      id: i,
      url: url
    };
  });
}

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
      console.log('ERROR: getController: getQuestions', err);
      res.status(500).end();
    });
};


exports.getAnswers = (req, res) => {
  const questionId = Number(req.params.question_id);
  const options = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 5
  };

  if (!questionId) {
    res.status(400).end();
    return;
  }


  db.Answer.getAnswers(questionId, options)
    .then(answerList => {
      let answers;
      if (answerList.length) {
        answers = answerList.map((answer) => {
          return {
            ...answer,
            photos: convertPhotoArray(answer.photos)
          };
          // answerList[i].photos = convertPhotoArray(answerList[i].photos);
          // delete answer.id;
        });
      }
      res.status(200).send({
        question: questionId,
        page: options.page,
        count: options.count,
        results: answers
      });
    })
    .catch(err => {
      console.log('ERROR: getController: getAnswers', err);
      res.status(500).end();
    });
};