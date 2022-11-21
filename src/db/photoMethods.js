

exports.getPhotos = (answerId, options) => {
  return this.model('Photo').find({ answer_id: answerId }).select('url');
};