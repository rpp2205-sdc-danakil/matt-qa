import http from "k6/http";
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const questionErrorRate = new Rate('Get Questions errors');
const answerErrorRate = new Rate('Get Answers errors');
const QuestionTrend = new Trend('Get Questions');
const AnswerTrend = new Trend('Get Answers');

// const numIDs = productIDs.length;

export const options = {
  // stages: [
  //   { duration: "2m", target: 100 }, // below normal load
  //   { duration: "5m", target: 100 },
  //   { duration: "2m", target: 200 }, // normal load
  //   { duration: "5m", target: 200 },
  //   { duration: "2m", target: 300 }, // around the breaking point
  //   { duration: "5m", target: 300 },
  //   { duration: "2m", target: 400 }, // beyond the breaking point
  //   { duration: "5m", target: 400 },
  //   { duration: "10m", target: 0 }, // scale down. Recovery stage.
  // ],
  stages: [
    { duration: "2m", target: 100 },
    { duration: "3m", target: 600 },
    { duration: "5m", target: 600 },
    { duration: "2m", target: 0 }
  ]
};

const getRandomPositiveInt = (max) => {
  return Math.floor(Math.random() * max);
};
const getRandomIntInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const getRandomProductId = function() {
  return getRandomIntInclusive(880000, 1000011);
};
const getRandomQuestionId = function() {
  return getRandomIntInclusive(3096688, 3518963);
};

export default function () {
  // make sure this is not production url
  // const BASE_URL = "http://127.0.0.1:3000";
  // const ENDPOINT = "/qa/questions";
  const urlQuestions = `http://127.0.0.1:3000/qa/questions/?product_id=${getRandomProductId()}`;
  // const urlAnswers = `http://127.0.0.1:3000/qa/questions/${getRandomQuestionId()}/answers`;
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
    // product_id: getRandomProductId()
  };

  const requests = {
    'Get Questions': {
      method: 'GET',
      url: urlQuestions,
      params: params
    },
    // 'Get Answers': {
    //   method: 'GET',
    //   url: urlAnswers,
    //   params: params
    // }
  };

  const responses = http.batch(requests);
  const questionResp = responses['Get Questions'];
  // const answerResp = responses['Get Answers'];

  check(questionResp, {
    'status is 200': (r) => r.status === 200,
  }) || questionErrorRate.add(1);

  QuestionTrend.add(questionResp.timings.duration);

  // check(answerResp, {
  //   'status is 200': (r) => r.status === 200,
  // }) || answerErrorRate.add(1);

  // AnswerTrend.add(answerResp.timings.duration);

  sleep(0.5);
};