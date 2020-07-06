const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.set('view engine', 'ejs');
//must be used to get the body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
let items = [];
let workItems = [];

app.get('/', (req, res) => {
  let today = new Date();

  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  };

  let day = today.toLocaleDateString('en-US', options);
  res.render('list', { listTitle: day, newListItems: items });
});

app.get('/work', (req, res) => {
  res.render('list', { listTitle: 'Work List', newListItems: workItems });
});

app.post('/', (req, res) => {
  let item = req.body.newItem;
  if (req.body.list === 'Work') {
    workItems.push(item);
    res.redirect('/work');
  } else {
    items.push(item);
    res.redirect('/');
  }
});

app.listen(3000, () => console.log('Server started on port 3000'));
