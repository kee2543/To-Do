import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import env from "dotenv";

const app = express();
const port = 3000;

env.config();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect();

async function getItems() {
  const result = await db.query("SELECT * FROM items");
  var items = result.rows;
  return items;
}

async function getLength() {
  const result = await db.query("SELECT * FROM items");
  var length = result.rowCount;
  return length;
}

let items = [];
var it = await getItems();
for (var i = 0; i < await getLength(); i++) {
  items.push(it[i]);
}

app.get("/", async(req, res) => {
  let items = [];
  var it = await getItems();
  for (var i = 0; i < await getLength(); i++) {
    items.push(it[i]);
  }
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  db.query("INSERT INTO items (title) VALUES ($1);", [item]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;
  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId;
  try {
    await db.query("DELETE FROM items WHERE id = $1", [id]);
  } catch (err) {
    console.log(err);
  }
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
