const db = require('../src/db/db-prod.js');
const fs = require('fs');

let ids;

db.Question.distinct('product_id')
  .then(array => {
    console.log('Array length: ', array.length);
    ids = array.slice(array.length * 0.88);
    fs.writeFile('product_ids.js', JSON.stringify(ids), () => {
      console.log('COMPLETED WRITING FILE');
    });
    let check = ids[0];
    for (let id of ids) {
      if (id !== check) {
        console.log('NOT SEQUENTIAL AT:', id);
        break;
      }
      check++;
    }
    console.log('DONE CHECKING');
    process.exit();
  });

