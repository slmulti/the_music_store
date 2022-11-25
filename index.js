const express = require("express");
require("dotenv").config(".env");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { expressjwt: expressjwt } = require("express-jwt");
const jwks = require('jwks-rsa');
const app = express();
const { User, CD } = require("./db");
const bodyParser = require("body-parser");
const { Op } = require("sequelize");

const { JWT_SECRET, SALT_COUNT } = process.env;

const { auth } = require("express-openid-connect");
const { requiresAuth } = require("express-openid-connect");

const { AUTH0_SECRET, AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_BASE_URL } =
  process.env;

const jwtCheck = expressjwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://dev-be8w11nearw7ojav.us.auth0.com/.well-known/jwks.json'
  }),
  audience: 'http://localhost:4000',
  issuer: 'https://dev-be8w11nearw7ojav.us.auth0.com/',
  algorithms: ['RS256']
});

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: AUTH0_SECRET,
  baseURL: AUTH0_AUDIENCE,
  clientID: AUTH0_CLIENT_ID,
  issuerBaseURL: AUTH0_BASE_URL,
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

//home page

app.get("/", async (req, res, next) => {
  console.log("Home Page loaded");
  try {
    res.send(
      req.oidc.isAuthenticated()
        ? `<h1>Welcome to THE MUSIC STORE!</h1>
      <p>All of our CDs are available to view here <a href="/cds">Shop</a></p>
      <p>Or, you can view albums by their Genre <a href="/cds/genre/Rock">Rock</a> || <a href="/cds/genre/Metal">Metal</a> || <a href="/cds/genre/Pop">Pop</a> || <a href="/cds/genre/Rap">Rap</a></p>
      <p>It is also possible to search for an album or artist in the URL bar at the top by <b>typing in queries</b>. For example:</p>
      <p><a href="http://localhost:4000/cds/search?album=w">http://localhost:4000/cds/search?album=w</a> will show results for all albums containing a 'w' but will also work if you put the whole album name e.g <a href="http://localhost:4000/cds/search?album=wasting%light">http://localhost:4000/cds/search?album=wasting%light</a></p>
      <p>This works with the Key Values <b>album</b>, <b>artist</b> and <b>genre</b>.</p>
      <p>If you are the owner of this fine establishment then please log in to Create, Update and Delete here <a href="/login">Admin Login</a>.</p>
      <p>...or if you have just starting working for us <a href="/sign-up">Register Here</a>.</p>
      <p><a href="/logout">Logout</a> || <a href="/staff%zone">Staff Zone</a></p>`
        : `<h1>Welcome to THE MUSIC STORE!</h1>
      <p>All of our CDs are available to view here <a href="/cds">Shop</a></p>
      <p>Or, you can view albums by their Genre <a href="/cds/genre/Rock">Rock</a> || <a href="/cds/genre/Metal">Metal</a> || <a href="/cds/genre/Pop">Pop</a> || <a href="/cds/genre/Rap">Rap</a></p>
      <p>It is also possible to search for an album or artist in the URL bar at the top by <b>typing in queries</b>. For example:</p>
      <p><a href="http://localhost:4000/cds/search?album=w">http://localhost:4000/cds/search?album=w</a> will show results for all albums containing a 'w' but will also work if you put the whole album name e.g <a href="http://localhost:4000/cds/search?album=wasting%light">http://localhost:4000/cds/search?album=wasting%light</a></p>
      <p>This works with the Key Values <b>album</b>, <b>artist</b> and <b>genre</b>.</p>
      <p>If you are the owner of this fine establishment then please log in to Create, Update and Delete here <a href="/login">Admin Login</a>.</p>
      <p>...or if you have just starting working for us <a href="/sign-up">Register Here</a>.</p>
      <p><a href="/login">Login</a> || <a href="/staff%zone">Staff Zone</a></p>`
    )
  } catch (error) {
    console.error(error);
    next(error);
  }
});

app.get("/sign-up", (req, res) => {
  res.oidc.login({
    authorizationParams: {
      screen_hint: "signup",
    },
  });
});

app.get("/staff%zone", (req, res, next) => {
  console.log("Staff Zone loaded");
  try {
    res.send(
      req.oidc.isAuthenticated()
        ? '<h1>Logged in</h1> <p><a href="/profile">Staff Profile</a></p> <p><a href="/logout">Logout</a></p>'
        : 'You must be a member of staff to see this page <p><a href="/">Home Page</a></p>'
    );
  } catch (error) {
    console.error(error);
    next(error);
  }

});

app.get("/profile", requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});


// get all CDs

app.get("/cds", async (req, res, next) => {
  const allCDs = await CD.findAll();
  console.log("A request for all the CDs has been made");
  res.json(allCDs);
});

// get CDs by Genre

app.get("/cds/genre/:genre", async (req, res, next) => {
  const findGenre = await CD.findAll({ where: { genre: req.params.genre } });
  console.log(findGenre);
  res.send(findGenre);
});

//get CDs by query searching

app.get("/cds/search", async (req, res, next) => {
  try {
    console.log(req.query);
    const where = {};
    for (const key of ["album", "artist", "genre"]) {
      if (req.query[key]) {
        where[key] = {
          [Op.like]: `%${req.query[key]}%`,
        };
      }
    }
    const cds = await CD.findAll({
      where,
    });
    res.send(cds);
  } catch (error) {
    next(error);
  }
});

// get CDs by id

app.get("/cds/:id", async (req, res, next) => {
  const cd = await CD.findByPk(req.params.id);
  console.log(JSON.stringify(cd));
  res.send(cd);
});

//==========================================
//admin
//==========================================

app.use(jwtCheck);

//create cd

app.post("/cds", jwtCheck, async (req, res, next) => {
  try {
    const { album, artist, genre, price } = req.body;
    const cd = await CD.create({ album, artist, genre, price });
    res.send(cd);
  } catch (error) {
    next(error);
  }
});

//update cd price

app.put("/cds/:id", jwtCheck, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { album, artist, genre, price } = req.body;
    const existingCD = await CD.findByPk(id);
    if (!existingCD) {
      res.status(404).send(`CD with id ${id} not found`);
      return;
    }
    await CD.update(
      {
        album,
        artist,
        genre,
        price,
      },
      { where: { id } }
    );
    res.send(
      `updated CD with id ${id} (${existingCD.album} by ${existingCD.artist}) from ${existingCD.price} to ${price}`
    );
  } catch (error) {
    next(error);
  }
});

//delete cd

app.delete("/cds/:id", jwtCheck, async (req, res, next) => {
  try {
    const { id } = req.params;
    const existingCD = await CD.findByPk(id);
    if (!existingCD) {
      res.status(404).send(`CD with id ${id} not found`);
      return;
    }
    await CD.destroy({ where: { id } });
    res.send(`deleted CD with id ${id}`);
  } catch (error) {
    next(error);
  }
});

//===================================================================================================================
//===================================================================================================================


// error handling middleware, so failed tests receive them
app.use((error, req, res, next) => {
  console.error("SERVER ERROR: ", error);
  if (res.statusCode < 400) res.status(500);
  res.send({ error: error.message, name: error.name, message: error.message });
});

// we export the app, not listening in here, so that we can run tests
module.exports = app;
