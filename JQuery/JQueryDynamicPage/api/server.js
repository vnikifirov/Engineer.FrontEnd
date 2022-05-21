const express = require('../node_modules/express');
const boudyParser = require('../node_modules/body-parser');
const fs = require('fs')

const app = express();
const port = process.env.port || 3000;

const fileName = '../data/order-list.json';

app.use(boudyParser.urlencoded({ extended: true }));
app.use(boudyParser.json());

// GET: localhost:[PORT] setup a start page.
app.use(express.static('../', { index: 'index.html' }));

var listOrders = [];

// GET: localhost:[PORT]/api/get-orders
app.get("/api/get-orders", (req, res) => {
    // Get data from a file
    var data = getListOreder(fileName);

    // Clear an array
    listOrders.length = 0;

    // Fill the array with elemnts from a json file
    data.forEach(function(element) {
        listOrders.push(element);
    }, this);

    // Send json to the user
    res.json(listOrders);
});

// This function to read data from file
const getListOreder = function(fileName) {
    var data;

    try {
        data = JSON.parse(fs.readFileSync(fileName));
    } catch (error) {
        console.error(error);
    }

    return data;
}

// Start server
app.listen(port, function() {
    console.log(`Server is running on port: ${port}!`);
});