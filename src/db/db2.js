require('custom-env').env('default');
const mongoose = require('mongoose');
const db2 = mongoose.createConnection(process.env.DB2_URL);

const { Schema, model } = mongoose;

const QuestionSchema = new Schema({
  _id: Number,
  product_id: { type: Number, required: true, index: true },
  body: String,
  date_written: { type: Date, default: Date.now },
  asker_name: String,
  asker_email: String,
  helpfulness: Number,
  reported: Boolean,
  answers: Object
}, {
  versionKey: false,
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

const Question = model('Question-new', QuestionSchema);

Question.createCollection();

module.exports = { Question };