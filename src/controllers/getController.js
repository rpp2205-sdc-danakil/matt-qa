const db = require('../db/db-prod.js');

const convertPhotoArray = function (array) {
  return array.map((url, i) => {
    return {
      id: i,
      url: url
    };
  });
}

const convertAnswersArray = function (array) {
  return array.reduce((accumulator, currentValue) => {
    accumulator[currentValue.id] = currentValue
    return accumulator;
  }, {});
}

const parseQuestions = function (array) {
  return array.map((cur, i) => {
    if (cur.answers.length) {
      cur.answers = convertAnswersArray(cur.answers);
    } else {
      cur.answers = {};
    }
    return cur;
  });
}

exports.getQuestions = function (req, res) {
  const productId = Number(req.query.product_id) || Number(req.params.product_id);
  const options = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || Number(req.params.count) || 5
  };
  if (!productId) {
    res.status(400).end();
    return;
  }

  db.Question.getQuestionsByProductId(productId)
    .then(data => {
      const resBody = {
        product_id: String(productId),
        results: parseQuestions(data)
      };
      res.status(200).send(resBody);
    })
    .catch(err => {
      res.status(500).end();
    });
};


exports.getAnswers = (req, res) => {
  const questionId = Number(req.params.question_id);
  const options = {
    page: Number(req.query.page) || 1,
    count: Number(req.query.count) || Number(req.params.count) || 5
  };

  if (!questionId) {
    res.status(400).end();
    return;
  }


  db.Answer.getAnswersByQuestionId(questionId, options)
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
        ...options,
        question: questionId,
        results: answers
      });
    })
    .catch(err => {
      console.log('ERROR: getController: getAnswers', err);
      res.status(500).end();
    });
};