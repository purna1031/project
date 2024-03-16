const express = require('express');
const request = require('request');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // Import bcryptjs
const port = 3000;
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

const serviceAccount = require("./keee.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//LANDING PAGE

app.get('/', (req, res) => {
  res.render('landing');
});


//SIGNUP

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/signupsubmit', async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  try {
    // Generate a salt and hash the password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt round

    // Check if email already exists in the database
    const existingUser = await db.collection("signup").where('email', '==', email).get();
    if (!existingUser.empty) {
      return res.render('error')
    } else {
      // Save user data to the database
      await db.collection("signup").add({
        name: first_name + " " + last_name,
        email: email,
        password: hashedPassword
      });
      res.render("signupsuc");
    }
  } catch (error) {
    console.error('Error signing up user:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});


//SIGN IN


app.get('/signin', (req, res) => {
  res.render('signin');
});

app.post('/signinsubmit', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const querySnapshot = await db.collection("signup").where("email", "==", email).get();
    if (querySnapshot.empty) {
      return res.send("No account found with this email");
    }

    const userDoc = querySnapshot.docs[0].data();
    const storedHashedPassword = userDoc.password;

    // Compare entered password with stored hashed password using bcrypt
    const passwordMatch = await bcrypt.compare(password, storedHashedPassword);

    if (passwordMatch) {
      res.render('homm', { message: "", company: "", price: "", change: "", high: "", low: "", yearhigh: "", yearlow: "" });
    } else {
      res.send("Incorrect password");
    }
  } catch (error) {
    console.error('Error signing in user:', error);
    res.status(500).send('An error occurred while signing in');
  }
});

//Fetching data from the api

app.get('/data', (req, res) => {
  request('https://financialmodelingprep.com/api/v3/quote/' + req.query.symbol.toUpperCase() + '?apikey=fec34fb8774a9a22eba9dab2b98b6f2f', (error, response, body) => {
    const data = JSON.parse(body);
    if (data.length) {
      const name =  (data[0].name).toString();
      const price = (data[0].price).toString();
      const change =  (data[0].change).toString() + "%";
      const high =  (data[0].dayHigh).toString();
      const low = (data[0].dayLow).toString();
      const year_High = (data[0].yearHigh).toString();
      const year_Low = (data[0].yearLow).toString();
      res.render("homm", { message: "", company: name, price: price, change: change, high: high, low: low, yearhigh: year_High, yearlow: year_Low });
    } else {
      res.render("homm", { message: "Please enter the correct symbol of the stock..", company: "", price: "", change: "", high: "", low: "", yearhigh: "", yearlow: "" });
    }
  });
});


app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
