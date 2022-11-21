

exports.getQuestions = (productId, options) => {
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