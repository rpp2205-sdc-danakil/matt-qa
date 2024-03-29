
exports.getAnswersByQuestionId = function (questionId, options) {
  const page = (options && options.page) || 1;
  const count = (options && options.count) || 5;

  // return this.find({ question_id: questionId, reported: false }, {
  //   answer_id: '$_id',
  //   _id: 0,
  //   body: 1,
  //   date: 1,
  //   answerer_name: 1,
  //   helpfulness: 1,
  //   photos: 1
  // }, {
  //   skip: (page - 1) * count,
  //   limit: count,
  //   lean: true
  // })
  //   .exec();

  return this.aggregate([
    { $match: { question_id: questionId, reported: false } },
    {
      $project: {
        answer_id: '$_id',
        _id: 0,
        body: 1,
        date: 1,
        answerer_name: 1,
        helpfulness: 1,
        photos: 1
      }
    }
  ])
    .catch(err => {
      console.log('Error: getAnswersByQuestionId: Failed getting answers for question:', questionId);
      return Promise.reject(err);
    });
};

exports.getAnswersForQuestions = function (questionId, options) {
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
    limit: count,
    lean: true
  })
    .exec();
};

exports.markHelpful = function (answerId) {
  return this.findByIdAndUpdate(answerId, {
    $inc: { helpfulness: 1 }
  });
};

exports.markReported = function (answerId) {
  return this.findByIdAndUpdate(answerId, {
    reported: true
  });
};

exports.insertNewAnswer = function (answer) {
  return this.insertMany(answer);
};

exports.maxId = function () {
  return this.find({}).sort({ _id: -1 }).limit(1)
    .then(lastDoc => {
      return Promise.resolve(lastDoc[0]._id);
    });
};

exports.getSample = function (size = 1) {
  return this.aggregate([
    { $sample: { size } }
  ]);
};

exports.getArrayOfUniqueQuestionIDs = function () {
  return this.distinct('question_id');
};

exports.getHelpfulness = function (id) {
  return this.findById(id).then(doc => Promise.resolve(doc.helpfulness));
};