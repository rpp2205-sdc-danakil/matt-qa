

exports.getQuestionsByProductId = function (productId, options) {
  const page = (options && options.page)|| 1;
  const count = (options && options.count) || 5;
  // get questions for a certain product ID based on page and count
  // get all answers for each question and insert them as an array into each question object
  // get all photos for each answer and insert them as an array into each answer object

  return this.aggregate(
    [
      {
        "$match": {
          "product_id": productId,
          "reported": false
        }
      },
      {
        "$project": {
          "question_id": "$_id",
          "_id": 0.0,
          "question_body": "$body",
          "question_date": "$date_written",
          "asker_name": 1.0,
          "question_helpfulness": "$helpfulness",
          "reported": 1.0
        }
      },
      {
        "$lookup": {
          "from": "answers",
          "localField": "question_id",
          "foreignField": "question_id",
          "as": "answers",
          "pipeline": [
            {
              "$project": {
                "id": "$_id",
                "_id": 0.0,
                "body": 1.0,
                "date": 1.0,
                "answerer_name": 1.0,
                "helpfulness": 1.0,
                "photos": 1.0
              }
            }
          ]
        }
      }
    ],
    {
      "allowDiskUse": false
    }
  )
    // .then(data => {
    //   return Promise.resolve(data);
    // })
    .catch(err => {
      console.log('Error: getQuestionById: Failed getting question for product:', productId);
      return Promise.reject(err);
    });

};

exports.markHelpful = function (questionId) {
  return this.findByIdAndUpdate(questionId, {
    $inc: { helpfulness: 1 }
  });
};

exports.markReported = function (questionId) {
  return this.findByIdAndUpdate(questionId, {
    reported: true
  });
};

exports.insertNewQuestion = function (question) {
  return this.find({}).sort({ _id: -1 }).limit(1)
    .then(lastDoc => {
      question._id = lastDoc._id + 1;
      return this.insertMany(question);
    });
}