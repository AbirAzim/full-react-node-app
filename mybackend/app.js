const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const graphqlHttp = require('express-graphql');

const graphqlSchema = require('./graphql/schema');
const graphqlResolver = require('./graphql/resolver');

const app = express();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images"),
  filename: (req, file, cb) => cb(null, new Date().getTime() + "-" + file.originalname)
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpg" || file.mimetype === "image/jpeg" || file.mimetype === "image/png") { cb(null, true); }
  else { cb(null, false); }
}

(async function () {
  app.use(express.json());

  app.use(multer({ storage, fileFilter }).single("image"));

  app.use('/images', express.static(path.join(__dirname, "images")));

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    next();
  })

  app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolver
  }))

  app.use((error, req, res, next) => {
    console.log(error);

    const { statusCode, message, data } = { ...error };

    return res.status(statusCode || 500).json({ error: message, data });
  });

  await mongoose.connect('mongodb+srv://root:iwilldoit@cluster0-rchqq.mongodb.net/project2?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

  app.listen(8080);

})();

