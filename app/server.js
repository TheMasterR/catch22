const express = require("express");
const path = require("path");
const { get, post, del} = require("./conn");
const { getPhotos } = require("./getPhotos");
const config = require("./config");
const app = express();
const moment = require("moment");
const sleep = async ms => new Promise(resolve => setTimeout(resolve, ms));
const { job } = require("./gitlab");

let photoColection;
(async()=>{
  photoColection = await getPhotos();
})()


// express
app.use("/public", express.static(path.join(__dirname, "static")));
app.set("x-powered-by", false);
app.set("view engine", "ejs");
app.set("views", "app/views");
app.get("/random", async (req, res) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.redirect(`/public/images/${photoColection[Math.floor(Math.random() * photoColection.length)]}`,301);
});
app.get("/", async (req, res) => {
  const confirmed = req.query.confirm || false;
  const response = await job(req.hostname, confirmed);
  console.log(response);

  switch (response.status) {
    case 'start':
    case 'pending':
    case 'running':
      res.render("index", {
        data: {
          branch: response.branch,
          date: new Date(response.created_at).setMinutes(new Date(response.created_at).getMinutes() + 8)
        }
      });
      break;
    case 'confirm':
      res.render("index", {
        data: { showAlert: true },
      });
      break;
    default:
      res.render("error", {
        data: {
          error: "404 Not Found"
        }
      });
  }
  res.end();
});

// start server
app.listen(8080);
