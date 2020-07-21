const express = require('express');
const bodyParser = require('body-parser');
const _ = require('lodash');
//require mongoose
const mongoose = require('mongoose');
//require module in current directory
//const date = require(__dirname + '/date.js');

const app = express();

app.set('view engine', 'ejs');
//must be used to get the body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// connect to and create this db
mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
});
//Schema
const itemsSchema = {
  name: String,
};
//models are capitalized and passsed a singular name
const Item = mongoose.model('Item', itemsSchema);

//create new default documents
const item1 = new Item({
  name: 'Welcome to your TodoList',
});
const item2 = new Item({
  name: 'Hit the + button to add a new item',
});
const item3 = new Item({
  name: '<-- Check this to delete an item',
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model('List', listSchema);

app.get('/', (req, res) => {
  //const day = date.getDate();
  //Find items
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      //insert many items using our model
      Item.insertMany(defaultItems, function (err) {
        if (!err) {
          console.log('New Items inserted');
        }
      });
      res.redirect('/');
    } else {
      res.render('list', { listTitle: 'Today', newListItems: foundItems });
    }
  });
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName,
  });
  if (listName === 'Today') {
    item.save();
    res.redirect('/');
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect('/' + listName);
    });
  }
});

app.post('/delete', (req, res) => {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === 'Today') {
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if (!err) {
        console.log('Successful deletion');
        res.redirect('/');
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemID } } },
      function (err, foundList) {
        if (!err) {
          console.log('Successful deletion');
          res.redirect('/' + listName);
        }
      }
    );
  }
});

app.get('/:customListName', (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect('/' + customListName);
      } else {
        res.render('list', {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(3000, () => console.log('Server started on port 3000'));
