import { expect, jest, test } from '@jest/globals';
const app = require('../src/app');
const request = require('supertest');
const db = require('../src/db/db-prod');



const getRandomIntInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};
const getRandomPositiveInt = (max) => {
  return Math.floor(Math.random() * max);
};


describe('Q&A API Testing', () => {

  let randomQuestionId, randomProductId, randomAnswerId;

  beforeAll((done) => {
    db.Question.getSample()
      .then(sample => {
        randomProductId = sample[0].product_id;
        console.log("Loaded random product ID:", randomProductId);
        // return Promise.resolve();
        return db.Answer.getSample();
      })
      .then(sample => {
        randomQuestionId = sample[0].question_id;
        randomAnswerId = sample[0]._id;
        console.log("Loaded random question ID:", randomQuestionId);
        done();
      });
  }, 20000);

  afterAll((done) => {
    db.disconnect();
    // app.close();
    done();
  });


  describe("'GET' endpoints", () => {
    it('Should get questions', () => {
      return request(app)
        .get('/qa/questions/')
        .query({ product_id: randomProductId })
        .then(response => {
          expect(response.statusCode).toBe(200);
        });
    }, 10000);

    it('Should get answers', () => {
      return request(app)
        .get(`/qa/questions/${randomQuestionId}/answers`)
        .then(response => {
          expect(response.statusCode).toBe(200);
        });
    }, 10000);
  });

  describe("'PUT' endpoints", () => {
    describe("Helpfulness", () => {

      it("Should increment a question's helpfulness", () => {
        return request(app)
          .put(`/qa/questions/${randomQuestionId}/helpful`)
          .then(response => {
            expect(response.statusCode).toBe(204);
          });
      });

      it("Should increment a answer's helpfulness", () => {
        return request(app)
          .put(`/qa/answers/${randomAnswerId}/helpful`)
          .then(response => {
            expect(response.statusCode).toBe(204);
          });
      });
    });

    describe("Reportedness", () => {

      // afterAll(() => {
      //   db.Question.findByIdAndUpdate(randomQuestionId, { report})
      // });

      it("Should set a question as reported", () => {
        return request(app)
          .put(`/qa/questions/${randomQuestionId}/report`)
          .then(response => {
            expect(response.statusCode).toBe(204);
          });
      });

      it("Should set an answer as reported", () => {
        return request(app)
          .put(`/qa/answers/${randomAnswerId}/report`)
          .then(response => {
            expect(response.statusCode).toBe(204);
          });
      });
    });
  });

  describe("'POST' endpoints", () => {
    let testQuestionId, testAnswerId;
    const testQuestion = {
      body: 'This is a test question',
      name: 'tester',
      email: 'test@test.com',
      product_id: '999999999'
    };
    const testAnswer = {
      body: 'This is a test question',
      name: 'tester',
      email: 'test@test.com',
      photos: [ 'https://this-is-a-test.url' ]
    };

    it('Should insert a new question', () => {
      return request(app)
        .post('/qa/questions')
        .send(testQuestion)
        .then(response => {
          testQuestionId = response.body._id;
          expect(response.statusCode).toBe(201);
        });
    });

    it('Should insert a new answer', () => {
      return request(app)
        .post(`/qa/questions/999999999/answers`)
        .send(testAnswer)
        .then(response => {
          testAnswerId = response.body._id;
          expect(response.statusCode).toBe(201);
        });
    });
  });
});

