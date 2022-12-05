require('custom-env').env('default');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const db = mongoose.connect(process.env.DB_PROD_URL);
const { Schema, model } = mongoose;

const answerStatics = require('./answerStatics.js');
const questionStatics = require('./questionStatics.js');


const answerGetter = function (answer) {
  console.log('ANSWER GETTER:', answer);
  return answer;
}

const AnswerSchema = new Schema({
  _id: ObjectId,
  question_id: { type: Number, required: true, index: true },
  body: String,
  date: { type: Date, default: Date.now },
  answerer_name: String,
  answerer_email: String,
  helpfulness: Number,
  reported: Boolean,
  photos: [String]
}, {
  versionKey: false,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

const QuestionSchema = new Schema({
  _id: ObjectId,
  product_id: { type: Number, required: true, index: true },
  body: String,
  date_written: { type: Date, default: Date.now },
  asker_name: String,
  asker_email: String,
  helpfulness: Number,
  reported: Boolean
}, {
  versionKey: false,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

// Define the virtuals
QuestionSchema.virtual('answers', {
  ref: 'Answer',
  localField: '_id',
  foreignField: 'question_id',
  match: { reported: false }
});

// Define the methodss
AnswerSchema.statics = answerStatics;
QuestionSchema.statics = questionStatics;

// Compile the schemas
const Answer = model('Answer', AnswerSchema);
const Question = model('Question', QuestionSchema);

Answer.createCollection();
Question.createCollection();

//////////////////////////////////////////////////

const disconnect = function () {
  return mongoose.connection.close();
}

//////////////////////////////////////////////////

module.exports = { Answer, Question, disconnect };