import express from "express";
import bodyParser from "body-parser";
import pg from "pg"; 
import dotenv from 'dotenv';
dotenv.config();



//server setup 
const app = express();
const port = 3000;

//DB setup 
const db = new pg.Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PW,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false
  }
});
db.connect();

//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//global variables
var books = [];
var flag = true; 

//routes 
app.get("/", async (req, res) => {
  try {
     if (flag) {
      const result = await db.query("SELECT * FROM book");
      books = result.rows;
      //console.log(books);
     }
    res.render("index.ejs", {
      books: books
    });
    flag = true;
  } catch (err) {
      console.log(err);
    }
   
  });

  app.get("/addBook", async (req, res) => {
    res.render("addBook.ejs");
    });

  app.post("/addBook", async (req, res) => {
    try {
      await db.query("INSERT INTO book (name, author,summary,isbn) VALUES ($1, $2, $3, $4)", [req.body.bookName, req.body.authorName, req.body.bookSummary, req.body.isbn]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });
  app.post("/editBook/:id", async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM book WHERE id = $1", [req.params.id]);
      const book = result.rows[0];
       res.render("editBook.ejs", {
       book:book
      });
    } catch (err) {
      console.log(err);
    }

    });

  app.post("/editBook", async (req, res) => {
    try {
      //console.log(req.body.bookId);
      //console.log(req.body.bookName);
      await db.query("UPDATE book SET name = $1, author = $2, summary = $3, isbn = $4 WHERE id = $5;", [req.body.bookName, req.body.authorName, req.body.bookSummary, req.body.isbn,req.body.bookId]);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  });

  app.post("/search", async (req, res) => {
    try {
      flag = false;
      const result = await db.query("SELECT * FROM book WHERE name LIKE $1 || '%'", [req.body.searchInput]);
      books = result.rows;
      console.log(books);
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }

  });

  app.post("/view/:id", async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM book WHERE id = $1", [req.params.id]);
      const book = result.rows[0];
      res.render("view.ejs", {
       book:book
      });
    } catch (err) {
      console.log(err);
    }
    });


  app.post("/delete", async (req, res) => {
   const bookId = await req.body.bookId;
   db.query("DELETE FROM book WHERE id = $1", [req.body.bookId]);
   console.log(bookId);
   res.redirect("/");
  });
  

//connect to server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  

