// Importing external pacakges - CommonJS
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
// var ObjectID = require('mongodb').ObjectID;
const dataAccessLayer = require("./dataAccessLayer");
const { ObjectId, ObjectID } = require("mongodb");
// ObjectId - a constructor for creating an objectId
// that's part of a query

// ObjectID - a static object with utility functions
// like isValid()

dataAccessLayer.connect();

// Creating my Server
const app = express();

// Installing the CORS middleware
// allows us (the server) to respond to
// requests from a different origin (URL)
// than the server.
app.use(cors());

// Installing the body-parser middleware
// Allow us to read JSON from requests
app.use(bodyParser.json());

// Defining our HTTP Resource Methods
// API Endpoints / Routes

// GET ALL PRODUCTS
// GET /api/products
app.get("/api/products", async (request, response) => {
  const products = await dataAccessLayer.findAll();

  response.send(products);
});

// GET A SPECIFIC PRODUCT BY ID
// GET /api/products/:id
app.get("/api/products/:id", async (request, response) => {
  const productId = request.params.id;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  let product;

  // How to handle promise rejection
  // 1.) async / await version
  // try / catch
  try {
    product = await dataAccessLayer.findOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }
  response.send(product);

  // 2.) Promise version
  // dataAccessLayer
  //   .findOne(productQuery)
  //   .then((product) => {
  //     response.send(product);
  //   })
  //   .catch((error) => {
  //     response.send(error);
  //   });
});

// CREATE A NEW PRODUCT
// POST /api/products { name: 'apples', price: 1.99, category: 'produce' }
app.post("/api/products", async (request, response) => {
  // Read the json body from the request
  const body = request.body;

  // Validate the json body to have required properties
  /* Required Properties:
    -name
    -price
    -category
  */
  if (!body.name || !body.price || !body.category) {
    response
      .status(400)
      .send(
        "Bad Request. Validation Error. Missing name, price (and greater than 0), or category!"
      );
    return;
  }

  // Validate data types of properties
  // name => non-empty string
  // price => Greater than 0 Number
  // category => non-empty string
  if (typeof body.name !== "string") {
    response.status(400).send("The name parameter must be of type string");
    return;
  }

  if (typeof body.category !== "string") {
    response.status(400).send("The category parameter must be of type string");
    return;
  }

  if (isNaN(Number(body.price))) {
    response.status(400).send("The price parameter must be of type number");
    return;
  }

  await dataAccessLayer.insertOne(body);

  response.status(201).send();
});

// UPDATE EXISTING PRODUCT BY ID
// PUT /api/products/:id { name: 'apples', price: 4.99, category: 'produce }
app.put("/api/products/:id", async (request, response) => {
  const productId = request.params.id;
  const body = request.body;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  // Validate data types of properties
  // name => non-empty string
  // price => Greater than 0 Number
  // category => non-empty string
  if (body.name && typeof body.name !== "string") {
    response.status(400).send("The name parameter must be of type string");
    return;
  }

  if (body.category && typeof body.category !== "string") {
    response.status(400).send("The category parameter must be of type string");
    return;
  }

  if (body.price && isNaN(Number(body.price))) {
    response.status(400).send("The price parameter must be of type number");
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  try {
    await dataAccessLayer.updateOne(productQuery, body);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }

  response.send();
});

// DELETE EXISTING PRODUCY BY ID
// DELETE /api/products/:id
app.delete("/api/products/:id", async (request, response) => {
  const productId = request.params.id;

  if (!ObjectID.isValid(productId)) {
    response.status(400).send(`ProductID ${productId} is incorrect.`);
    return;
  }

  const productQuery = {
    _id: new ObjectId(productId),
  };

  try {
    await dataAccessLayer.deleteOne(productQuery);
  } catch (error) {
    response.status(404).send(`Product with id ${productId} not found!`);
    return;
  }

  response.send();
});

// Starting my Server
const port = process.env.PORT ? process.env.PORT : 3005;
app.listen(port, () => {
  console.log("Grocery API Server Started!");
});
