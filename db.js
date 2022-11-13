import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const photoSchema = new Schema({
  id: Number,
  answer_id: Number,
  url: String,
});

const answerSchema = new Schema({
  answer_id: Number,
  product_id: Number,
  body: String,
  date: Date,
  answerer_name: String,
  helpfulness: Number,
  reported: Boolean,
  photos: [photoSchema],
});

const questionSchema = new Schema({
  question_id: Number,
  product_id: Number,
  body: String,
  date: Date,
  asker_name: String,
  helpfulness: Number,
  reported: Boolean,
  answers: [answerSchema],
});