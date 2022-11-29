
exports.getAnswers = function (questionId, options) {
  const page = options.page || 1;
  const count = options.count || 5;

  return this.find({ question_id: questionId, reported: false }, {
    id: '$_id',
    _id: 0,
    body: 1,
    date: 1,
    answerer_name: 1,
    reported: 1,
    helpfulness: 1,
    photos: 1
  }, {
    skip: (page - 1) * count,
    limit: count
  })
    .exec();
}