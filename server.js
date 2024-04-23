const express = require('express');
const path = require('path');

const app = express();

app.get('/secure', (req, resp) => {
    resp.send("Your secret key is : 7");
})

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(3000, () => {
    console.log("Running on port : 3000");
})