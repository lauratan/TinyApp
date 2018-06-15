const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
// const password = req.params.userID.password;
// const hashedPassword = bcrypt.hashSync(password, 10);

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

let urlDatabase = {
  "b2xVn2": {
    url: "http://www.lighthouselabs.ca",
    userID: "1"
  },
  "9sm5xK": {
    url: "http://www.google.com",
    userID: "2"
  }
};
 
let users = { 
  "1": {
    id: "1", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "2": {
    id: "2", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}
// const hashedPassword = bcrypt.hashSync(users["1"].password, 10);

//Get the userid given email and checks if it equates to the email in database
function getUserByEmail(email){
  for (let user in users){
    if (users[user].email === email){
      return users[user];
    }
  }
  return null;
}

//Generate 6 random characters
function generateRandomString() {
  let randomString = "";
  const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 6; i++)
    randomString += possible.charAt(Math.floor(Math.random() * possible.length));
  
  return randomString;
}

//Check if email already exist in users database
function checkExisting(email){
  for (let key in users){
    if (users[key].email === email){
      return true;
    }
  }
};

function getUrlofUser(userId){
  const userURLs = {};
  for (let shortCode in urlDatabase){
    const urlObj = urlDatabase[shortCode];
    if (userId === urlObj.userID){
      userURLs[shortCode] = urlObj
    } 
  }
  return userURLs;
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

//renders urls_index page where it shows the list of long and short URLs in the database 
app.get("/urls", (req, res)=> {
  const userID = req.cookies["user_id"];
  if (userID){
    let templateVars = { 
      urls: getUrlofUser(userID),
      user: users[userID]
    };
    res.render("urls_index", templateVars);
  }
  else {
    res.redirect("/login");
  }
});    

//Renders urls_show and allows user to update the longURL
app.get("/urls/:id/update", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = { 
    shortURL: req.params.id, 
    urls: urlDatabase,
    user: users[userID]
  };
  if (userID){
    res.render("urls_show", templateVars);
  }
  else {
    res.redirect("/login");
  }
});

//Render urls_new page where users can add a new url
app.get("/urls/new", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = {
    user: users[userID]
  };
  if (userID === undefined){
    return res.redirect("/login");
  }
  else{
    res.render("urls_new", templateVars);
  }
});

app.get("/urls/:id", (req, res) => {
  const userID = req.cookies["user_id"];
  let templateVars = { 
    shortURL: req.params.id, 
    urls: getUrlOfUser(userID),
    user: users[userID]
  }; 
  res.render("urls_show", templateVars);
});

//Redirect to the longURL that was associated with the shortURL
app.get("/u/:shortURL", (req, res) => { 
  // console.log(urlDatabase[req.params.shortURL]);
  let longURL = urlDatabase[req.params.shortURL].url;
  res.redirect(longURL);
});

//Render register page
app.get("/register", (req, res) => {
  res.render("register")
});

//Render log in page
app.get("/login", (req, res) => {
  res.render("log_in")
});

//Adding a new shortURL to the given longURL to the urlDatabase
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL;

  var newUrl = {
    url: longURL,
    userID: req.cookies.user_id
  };
  //save it in the database
  urlDatabase[shortURL] = newUrl;
  res.redirect("/urls");
});

//Updating the longURL associated to the shortURL
app.post("/urls/:id/update", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID) {
    urlDatabase[req.params.id].url = req.body.longURL;
    res.redirect("/urls");
  }
  else {
    res.redirect("/login");
  }
});

//Delete shortURL from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  const userID = req.cookies["user_id"];
  if (userID){
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
  }
  else {
    res.redirect("/login");
  }
});

// const urlDatabase = {
//   "b2xVn2": {
//     url: "http://www.lighthouselabs.ca",
//     userID: "1"
//   },

//Login Endpoint which checks if email exists in database and if it does it also check if the password entered matches the password in database
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  const user = getUserByEmail(email);

  
  if (user){
    //bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)
    if (bcrypt.compareSync(password, user.password)){
      res.cookie('user_id', user.id);
      return res.redirect("/urls");
    }
    return res.status(403).send("Password don't match");
  }
  else {
    return res.status(403).send("Email does not exist");
  }
});


//Logout Route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Post Register Endpoint
app.post("/register", (req, res) => {
  let userID = generateRandomString();
  let email = req.body.email;
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);

  if (email == "" || password == ""){
    res.status(400).send("Please enter email or password");
  }
  else {
    if (checkExisting(email)){
      res.status(400).send("Email already registered");
    }
    else {
      // console.log("userid", userID);
      // console.log("email", email);
      // console.log("password", password);
      users[userID] = { 
        id: userID, 
        email: email, 
        password: hashedPassword
      }
    }
  };
  // console.log(userID);
  res.cookie('user_id', userID);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});
