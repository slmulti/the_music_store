const express = require('express');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const { User, CD } = require('./db');

const { JWT_SECRET, SALT_COUNT } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', async (req, res, next) => {
  try {
    res.send(`
      <h1>Welcome to THE MUSIC STORE!</h1>
      <p>All of our CDs are available to view here <a href="/cds">Shop</a></p>
      <p>Cats are available at <a href="/kittens/1">/kittens/:id</a></p>
      <p>Create a new cat at <b><code>POST /kittens</code></b> and delete one at <b><code>DELETE /kittens/:id</code></b></p>
      <p>Log in via POST /login or register via POST /register</p>
    `);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

// get all CDs

app.get('/cds', async (req, res, next) => {
  const allCDs = await CD.findAll()
  // console.log(allCDs)
  res.json(allCDs)
})

// get CDs by Genre >>not working

app.get('/cds/genre/:genre', async (req, res, next) => {
  const findGenre = await CD.findAll({where: {genre: req.params.genre}})
  console.log(findGenre)
  res.send(findGenre)
})

// get CDs by id 

app.get('/cds/:id', async (req,res,next) => {
  const cd = await CD.findByPk(req.params.id)
  console.log(cd)
  res.send(cd)
})

//create cd

app.post('/cds', async (req, res, next) => {
  try {
    const {album, artist, genre, price} = req.body;
    const cd = await CD.create({album, artist, genre, price});
    res.send(cd);
  } catch (error) {
    next(error);
  }
});

//delete cd

app.delete('/cds/:id', async (req, res, next) => {
  try {
    const {id} = req.params;
    const existingCD = await CD.findByPk(id);
    if(!existingCD) {
      res.status(404).send(`CD with id ${id} not found`);
      return;
    }
    await CD.destroy({where: {id}});
    res.send(`deleted CD with id ${id}`);
  } catch (error) {
    next(error);
  }
});

//===================================================================================================================
//===================================================================================================================

// Verifies token with jwt.verify and sets req.user
// TODO - Create authentication middleware
const setUser = (req, res, next) => {
  const auth = req.header('Authorization');
  if (!auth) {
    next();
    return;
  }
  const [_, token] = auth.split(' ');
  try {
    const user = jwt.verify(token, JWT_SECRET);
    req.user = user;
    next();
  } catch (error) {
    console.log(error.message);
    next();
  }
};

// POST /register
// OPTIONAL - takes req.body of {username, password} and creates a new user with the hashed password

// POST /login
// OPTIONAL - takes req.body of {username, password}, finds user by username, and compares the password with the hashed version from the DB
app.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const { id, username } = user;
      const token = jwt.sign({ id, username }, JWT_SECRET);
      res.send({ message: 'Login Successful', token });
      return;
    }
    res.sendStatus(401);
  } catch (error) {}
});

// GET /kittens/:id
// TODO - takes an id and returns the cat with that id
app.get('/kittens/:id', setUser, async (req, res, next) => {
  if (!req.user) {
    console.log('no user');
    res.status(401).send('Currently not logged in.');
    return;
  }
  const cat = await Kitten.findByPk(req.params.id);
  if (req.user.id != cat.ownerId) {
    console.log('no match');
    res.status(401).send('Unauthorized user.');
    return;
  }

  const { age, color, name } = cat;
  res.send({ age, color, name });
});


// POST /kittens
// TODO - takes req.body of {name, age, color} and creates a new cat with the given name, age, and color

// DELETE /kittens/:id
// TODO - takes an id and deletes the cat with that id

// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error('SERVER ERROR: ', error);
  if (res.statusCode < 400) res.status(500);
  res.send({ error: error.message, name: error.name, message: error.message });
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
