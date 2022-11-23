const db = require('../src/db/db.js');

// iterate through answers
// findByIdAndUpdate answer
// find photos for the current answer
// append photos array to the answer
// save answer

function getAnswer(id) {
  return db.Answer.findById(id);
}

function getPhotosArray(id) {
  return db.Photo.find({ answer_id: id })
    .then(photoDocs => {
      const array = [];
      if (photoDocs.length) {
        for (let photo of photoDocs) {
          array.push(photo.url);
        }
      }
      return Promise.resolve(array);
    });
}

function updateAnswer(id, update) {
  return db.Answer.findByIdAndUpdate(id, update, { returnDocument: 'after' });
}

function joinOne(id) {
  return getPhotosArray(id)
    .then(photosArray => {
      return updateAnswer(id, { photos: photosArray });
    });
    // .then(doc => {
    //   console.log('UPDATED!', doc);
    // });
}

function joinAll(id, max) {
  joinOne(id).then(() => {
    if (id % 10000 === 0) {
      // console.log(`Updated ID: ${id}\t|\tmem: ${process.memoryUsage().heapUsed / 1024 / 1024} ...`);
      console.log(`Updated ID: ${id}`);
    }
    if (id < max) {
      joinAll(id + 1, max);
    } else {
      console.log('DONE!!!');
    }
  });
}

// maxAnswerId = 6879306
joinAll(1, 6879306);