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

  const productId = Number(req.query.product_id);
  const options = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || 5
  };
  if (!productId) {
    res.status(400).end();
    return;
  }

  db.Question.getQuestionsByProductId(productId)
    .then(data => {
      res.status(200).send(data);
    })
    .catch(err => {
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