const express = require('express')
const app = express();
const port=3000;

app.set("view engine","ejs");

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/signin', (req, res) => {
    res.send('Im in home')
  })
  app.get('/signup', (req, res) => {
    res.render('signup');
  })
app.listen(3000,()=>{
    console.log(`app listening on port ${port}`);
})