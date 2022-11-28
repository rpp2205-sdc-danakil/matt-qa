
exports.getAnswers = function (questionId, options) {
  const page = options.page || 1;
  const count = options.count || 5;

  return this.find({ question_id: questionId, reported: false }, {
    id: '$_id',
    body: 1,
    date: 1,
    answerer_name: 1,
    answerer_email: 0,
    helpfulness: 1,
    photos: 1
  }, {
    skip: (page - 1) * count,
    limit: count
  })
    .exec();
}