

exports.getQuestions = function (productId, options) {
  const page = options.page || 1;
  const count = options.count || 5;
  // get questions for a certain product ID based on page and count
  // get all answers for each question and insert them as an array into each question object
  // get all photos for each answer and insert them as an array into each answer object

  return this.find({ product_id: productId, reported: false }, {
    question_id: '$_id',
    _id: 0,
    question_body: '$body',
    question_date: '$date_written',
    asker_name: 1,
    question_helpfulness: '$helpfulness',
    reported: 1,
    answers: 1
  }, {
    skip: (page - 1) * count,
    limit: count
  })
    .exec();
};

exports.getAnswers = function (questionId, options) {
  const page = options.page || 1;
  const count = options.count || 5;
  // get questions for a certain product ID based on page and count
  // get all answers for each question and insert them as an array into each question object
  // get all photos for each answer and insert them as an array into each answer object

  return this.find({ _id: questionId }, {
    answers: 1
  }, {
    skip: (page - 1) * count,
    limit: count
  });
}