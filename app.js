let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
let bcrypt = require("bcrypt");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "userData.db");

let db = null;

let initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

//API 1

app.post("/register", async (request, response) => {
  let { username, name, password, gender, location } = request.body;
  let hashedPassword = await bcrypt.hash(request.body.password, 10);

  let usernameQuery = `SELECT username FROM user WHERE 
    username = ${username};`;
  let dbUser = await db.get(usernameQuery);

  if (dbUser === undefined) {
    if (len(request.body.password) < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      let query = `INSERT INTO user(username, name, password, gender, location)
        VALUES(${username},${name},${hashedPassword},${gender},${location});`;
      let result = await db.run(query);
      response.status(200);
      response.send("User created successfully");
    }
  } else {
    response.status(400);
    response.send("User already exists");
  }
});

//API 2

app.post("/login", async (request, response) => {
  let { username, password } = request.body;
  let query = `SELECT username FROM user WHERE username = ${username};`;
  let dbUser = await db.get(query);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    let correctPassword = bcrypt.compare(password.dbUser.password);
    if (correctPassword === true) {
      response.status(200);
      response.send("Login success");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.put("/change-password", async (request, response) => {
  let { username, oldPassword, newPassword } = request.body;
  let hashedPassword = await bcrypt.hash(request.body.oldPassword, 10);

  let query = `SELECT password FROM 
    user WHERE username = ${username};`;

  let result = await db.get(query);

  if (result === hashedPassword) {
    if (len(request.body.oldPassword) < 5) {
      response.status(400);
      response.send("Password is too short");
    } else {
      response.status(200);
      response.send("Password updated");
    }
  } else {
    response.send(400);
    response.send("Invalid current password");
  }
});

module.exports = app;
