const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello! This is the TinyApp ");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body><b>Hello</b> <b>World</b></body></html>\n");
});

app.get("/urls", (req, res)=> {
  let templateVars = { 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});    

app.get("/urls/:id/update", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    username: req.cookies["username"] 
  };
  res.render("urls_show", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"] 
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    username: req.cookies["username"] 
  }; 
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => { 
  // console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;
  //save it in the database
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  // delete urlDatabase
  delete urlDatabase[req.params.id]
  res.redirect("/urls");
});

//Login Route
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("/urls");
});

//Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  
  return randomString;
}

