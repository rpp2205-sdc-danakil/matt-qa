const path = require('path');
const express = require('express');
const app = express();
const compression = require('compression');

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

app.get('/loaderio-a596afe40ce4446469c26baca4f93040', (req, res) => {
  res.status(200).set({
    'Content-type': "application/octet-stream",
    'Content-disposition': "attachment; filename=loaderio-a596afe40ce4446469c26baca4f93040.txt",
  }).send('loaderio-a596afe40ce4446469c26baca4f93040')
});
app.use('/qa/l42k3jh58/test', (req, res) => {
  res.sendFile(path.join(__dirname, '../__test__/loaderio/payload.txt'));
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
}));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(compression());

app.get('/qa/questions', getQuestions);
app.get('/qa/questions/:question_id/answers', getAnswers);

///// routes needed to workaround webapp
app.get('/qa/questions/:product_id/:count', getQuestions);
app.get('/qa/questions/:question_id/answers/:count', getAnswers);
////////

app.post('/qa/questions', postQuestion);
app.post('/qa/questions/:question_id/answers', postAnswer);

app.put('/qa/questions/:question_id/helpful', markQuestionHelpful);
app.put('/qa/answers/:answer_id/helpful', markAnswerHelpful);

app.put('/qa/questions/:question_id/report', reportQuestion);
app.put('/qa/answers/:answer_id/report', reportAnswer);

module.exports = app;