import mongoose from 'mongoose';
const db = mongoose.connect('mongodb://127.0.0.1:27017/sdc');
const { Schema, model } = mongoose;

const PhotoSchema = new Schema({
  answer_id: Number,
  url: String,
});

const AnswerSchema = new Schema({
  product_id: { type: Number, required: true },
  body: String,
  date: { type: Date, default: Date.now },
  answerer_name: String,
  helpfulness: Number,
  reported: Boolean,
}, {
  toJSON: { virtuals: true }, // So `res.json()` and other `JSON.stringify()` functions include virtuals
  toObject: { virtuals: true } // So `console.log()` and other functions that use `toObject()` include virtuals
});

const QuestionSchema = new Schema({
  _id: Number,
  product_id: { type: Number, required: true },
  body: String,
  date_written: { type: Date, default: Date.now },
  asker_name: String,
  asker_email: String,
  helpfulness: Number,
  reported: Boolean,
}, {
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

AnswerSchema.virtual('photos', {
  ref: 'Photo',
  localField: '_id',
  foreignField: 'answer_id'
});

// Define the methods
PhotoSchema.methods.getPhotos = (answerId, options) => {
  return this.model('Photo').find({ answer_id: answerId }).select('url');
};

QuestionSchema.methods.getQuestions = (productId, options) => {
  const page = options.page || 1;
  const count = options.count || 5;
  // get questions for a certain product ID based on page and count
  // get all answers for each question and insert them as an array into each question object
  // get all photos for each answer and insert them as an array into each answer object

  return this.find({ product_id: productId })
  .skip((page - 1) * count)
  .limit(count)
  .populate('Answer')
  .populate('Photo')
  .exec();
};


// Compile the schemas
const Photo = model('Photo', PhotoSchema);
const Answer = model('Answer', AnswerSchema);
const Question = model('Question', QuestionSchema);

await Photo.createCollection();
await Answer.createCollection();
await Question.createCollection();

export { Photo, Answer, Question };