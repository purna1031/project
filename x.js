const express = require('express')
const app = express();
const port=3000;
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');


var serviceAccount = require("./keee.json");

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.set("view engine","ejs");

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/signin', (req, res) => {
    res.render('signin');
  })
  app.get('/signinsubmit', (req, res) => {
    const email=req.query.email;
    const password=req.query.password;
    db.collection("signup")
                .where("email", "==", email)
                .where("password", "==", password)
                .get()
                .then((docs) => {
                   
                });
  })


  app.get('/signup', (req, res) => {
    res.render('signup');
  })
 app.get('/signupsubmit', (req, res) => {
    const first_name=req.query.first_name;
    const last_name=req.query.last_name;
    const email=req.query.email;
    const password=req.query.password;
   db.collection("signup").add({
    name:first_name+" "+last_name,
    email:email,
    password:password
   }).then(()=>{
    res.send("Signed up successfully...");
   })
  })


app.listen(3000,()=>{
    console.log(`app listening on port ${port}`);
})