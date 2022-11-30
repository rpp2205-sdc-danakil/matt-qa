const db = require('../db/db-prod.js');

exports.markQuestionHelpful = (req, res) => {
  const questionId = req.params.question_id;
  if (!questionId) {
    res.status(400).end();
    return;
  }

  db.Question.markHelpful(questionId)
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      res.status(500).end();
    });
};

exports.markAnswerHelpful = (req, res) => {
  const answerId = req.params.answer_id;
  if (!answerId) {
    res.status(400).end();
    return;
  }

  db.Answer.markHelpful(answerId)
    .then(() => {
      res.status(204).end();
    })
    .catch(() => {
      res.status(500).end();
    });
};

exports.reportQuestion = (req, res) => {
  const questionId = req.params.question_id;
  if (!questionId) {
    res.status(400).end();
    return;
  }

  db.Question.markReported(questionId)
    .then(() => {
      res.status(204).end()
    })
    .catch(() => {
      res.status(500).end();
    });
};

exports.reportAnswer = (req, res) => {
  const answerId = req.params.answer_id;
  if (!answerId) {
    res.status(400).end();
    return;
  }

  db.Answer.markReported(answerId)
    .then(() => {
      res.status(204).end()
    })
    .catch(() => {
      res.status(500).end();
    });
};