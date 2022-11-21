require('custom-env').env('default');
const express = require('express');
const app = express();
const compression = require('compression');
const port = process.env.PORT || 3000;

const helmet = require('helmet');
const cors = require('cors');

const {
  getQuestions,
  getAnswers } = require('./controllers/getController.js');
const {
  postQuestion,
  postAnswer } = require('./controllers/postController.js');
const {
  markQuestionHelpful,
  markAnswerHelpful,
  reportAnswer,
  reportQuestion } = require('./controllers/putController.js');

if (process.env.NODE_ENV === 'development') {
  // require morgan if in development mode
  // setting morgan to dev: https://www.npmjs.com/package/morgan#dev
  app.use(require('morgan')('dev'));
}

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

app.get('/qa/questions/:product_id', getQuestions);

app.get('/qa/questions/:question_id/answers', getAnswers);

app.post('/qa/questions', postQuestion);

app.post('/qa/questions/:question_id/answers', postAnswer);

app.put('/qa/questions/:question_id/helpful', markQuestionHelpful);

app.put('/qa/answers/:answer_id/helpful', markAnswerHelpful);

app.put('/qa/answers/:answer_id/report', reportAnswer);

app.put('/qa/questions/:question_id/report', reportQuestion);


app.listen(port, function () {
  console.log(`SDC question/answer API listening on port ${port}`);
});