
const fs = require('fs');

const numValues = 200000;
const [prodMin, prodMax] = [900010, 1000011];
const [quesMin, quesMax] = [3167067, 3518963] ;

const getRand = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const payload = { keys: ['productid', 'questionid'] }
const values = [];

for (var n = 0; n < numValues; n++) {
  let value = [ getRand(prodMin, prodMax), getRand(quesMin, quesMax) ];
  values.push(value);
}

payload.values = values;

fs.writeFile('payload.txt', JSON.stringify(payload), () => {
  console.log('COMPLETED WRITING FILE');
});