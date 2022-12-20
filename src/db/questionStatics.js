

exports.getQuestionsByProductId = function (productId, options) {
  const page = (options && options.page) || 1;
  const count = (options && options.count) || 5;

  return this.aggregate(
    [
      {
        "$match": {
          "product_id": productId,
          "reported": false
        }
      },
      {
        "$lookup": {
          "from": "answers",
          "localField": "_id",
          "foreignField": "question_id",
          "as": "answers",
          "pipeline": [
            {
              "$project": {
                "id": "$_id",
                "_id": 0,
                "body": 1,
                "date": 1,
                "answerer_name": 1,
                "helpfulness": 1,
                "photos": 1
              }
            },
            {
              "$group": {
                "_id": null,
                "docs": {
                  "$mergeObjects": {
                    "$arrayToObject": [
                      [
                        {
                          "k": {
                            "$toString": "$id"
                          },
                          "v": "$$ROOT"
                        }
                      ]
                    ]
                  }
                }
              }
            },
            {
              "$replaceWith": "$docs"
            }
          ]
        }
      },
      {
        "$project": {
          "question_id": "$_id",
          "_id": 0,
          "question_body": "$body",
          "question_date": "$date_written",
          "asker_name": 1,
          "question_helpfulness": "$helpfulness",
          "reported": 1,
          "answers": {
            "$ifNull": [
              {
                "$arrayElemAt": [
                  "$answers",
                  0
                ]
              },
              {

              }
            ]
          }
        }
      }
    ],
    {
      "allowDiskUse": false
    }
  )
    .catch(err => {
      console.log('Error: getQuestionsByProductId: Failed getting questions for product:', productId);
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
  return this.insertMany(question);
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

exports.getArrayOfUniqueProductIDs = function () {
  return this.distinct('product_id');
};

exports.getHelpfulness = function (id) {
  return this.findById(id).then(doc => Promise.resolve(doc.helpfulness));
};