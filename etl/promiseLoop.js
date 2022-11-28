function promiseMap(mapFn, director) {
  /**
   *  PARAMETERS:
   *    mapFn: the promisified function that gets called with the return value of the director
   *    director: a syncronous function that receives the reults of the mapFn promise and returns the next input value for the mapFn.
   *      Needs to return null at some point to break out of the loop.
   *      e.g.:   director.call(null, error, value);
   *
   */

  const runOne = (val) => {
    return mapFn(val);
  }

  const runAll = (val) => {
    let task = director(null, val);
    if (task !== null) {
      return runOne(task)
        .then(value => {
          return runAll(value);
        })
        .catch(error => {
          director(error, null);
        });
    }
  }

  return runAll(null);
}

module.exports = promiseMap;

// const waitSeconds = (sec) => {
//   return new Promise((resolve) => { setTimeout(resolve, sec * 1000) });
// }

// let runs = 0;
// const dir = (err, value) => {
//   if (err) {
//     console.log(err);
//   }
//   if (runs > 8) {
//     console.log('DONE..');
//     return null;
//   } else {
//     runs++;
//     console.log(`Run number: ${runs}`);
//   }
//   return runs;
// }

// promiseMap(waitSeconds, dir)
//   .then(() => {
//     console.log('Promise map is done!');
//   });