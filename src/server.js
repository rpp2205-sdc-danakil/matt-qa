require('custom-env').env('default');
const port = process.env.PORT || 3000;
const app = require('./app');

app.listen(port, function () {
  console.log(`SDC question/answer API listening on port ${port}`);
});