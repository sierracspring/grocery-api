//importing external packages - commonJS

const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

//creating server
const app = express();

//installing the body-parser middleware
//allow us to  read JSON from requests
app.use(bodyParser.json());

//read in JSON file (mock database)
let products = [];

try {
  products = JSON.parse(fs.readFileSync("products.json")).products;
} catch (error) {
  console.log("No existing file.");
}

//defining out HTTP resource methods
//API endpoints
//routes

//GET ALL PRODUCTS
// GET / api/ products
app.get("/api/products", (request, response) => {
  response.send(products);
});

//get a specific product by ID
// get /api/products/:id
app.get("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const product = products.find((p) => {
    if (productId === p.id) {
      return true;
    }
  });
  // if product = undefine => fale
  // !undefined = !false => true
  if (!product) {
    response.send(`Product with id ${productId} not found!`);
    return;
  }

  response.send(product);
});

//create a new product
//post /api/product { id: 123, name: 'apples', price: 1.99}
app.post("/api/products", (request, response) => {
  // read the json body from the request
  const body = request.body;
  console.log(body);
  //validate the json body to have required properties
  /* required properties
    -id
    -name
    -price
    */
  if (!body.id || !body.name || !body.price) {
    response.send("Bad Request. Validation Error. Missing id, name, or price");
    return;
  }

  //add the new product to our existing products array
  products.push(body);
  //commit the new products array to the database (json file)
  const jsonPayload = {
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(products).products);

  response.send();
});

// update existing product by id

// DELETE EXISTING PRODUCT BY ID
app.delete("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const productIndex = products.findIndex((p) => {
    return productId === p.id;
  });

  if (productIndex === -1) {
    response.send(`Product with ID ${productId} not found!`);
    return;
  }

  products.splice(productIndex, 1);

  const jsonPayload = {
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(jsonPayload));
  response.send();
});
// DELETE / api / products/ :id
app.put("/api/products/:id", (request, response) => {
  const productId = Number(request.params.id);

  const product = products.find((p) => {
    return productId === p.id;
  });

  if (!product) {
    response.send(`Product with id ${productId} not found!`);
    return;
  }

  const body = request.body;

  if (body.name) {
    product.name = body.name;
  }

  if (body.price) {
    product.price = body.price;
  }

  const jsonPayload = {
    products: products,
  };
  fs.writeFileSync("products.json", JSON.stringify(jsonPayload));

  response.send();
});

//TODO:

//Starting my server
const port = process.env.PORT ? process.env.PORT : 3000;
app.listen(port, () => {
  console.log("Grocery API Server Started!");
});
