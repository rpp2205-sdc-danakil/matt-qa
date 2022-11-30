require('custom-env').env('default');
const mongoose = require('mongoose');
const db = mongoose.connect(process.env.DB_PROD_URL);
const { Schema, model } = mongoose;

// const photoStatics = require('./photoStatics.js');
const answerStatics = require('./answerStatics.js');
const questionStatics = require('./questionStatics.js');

// const PhotoSchema = new Schema({
//   answer_id: { type: Number, required: true, index: true },
//   url: { type: String, required: true },
// }, {
//   versionKey: false
// });

const answerGetter = function (answer) {
  console.log('ANSWER GETTER:', answer);
  return answer;
}

const AnswerSchema = new Schema({
  _id: Number,
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
  _id: Number,
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

// AnswerSchema.virtual('photos', {
//   ref: 'Photo',
//   localField: '_id',
//   foreignField: 'answer_id',
//   $group: { _id: null, photos: { $addToSet: 'url'}}
// });

// Define the methods
// PhotoSchema.statics = photoStatics;
AnswerSchema.statics = answerStatics;
QuestionSchema.statics = questionStatics;

// Compile the schemas
// const Photo = model('Photo', PhotoSchema);
const Answer = model('Answer', AnswerSchema);
const Question = model('Question', QuestionSchema);

// Photo.createCollection();
Answer.createCollection();
// Question.createCollection();

module.exports = { Answer, Question };