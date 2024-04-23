const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const { error } = require('console');

const app = express();

app.use(helmet());

function checkLoggedIn(res, resp, next) {
    const isLoggedIn = true;
    if (!isLoggedIn) {
        return res.statusCode(401).json({
            error: "You must log in",
        })
    }
    next();
}

app.get('/secure', checkLoggedIn, (req, resp) => {
    resp.send("Your secret key is : 7");
})

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'public', 'index.html'));
});

https.createServer({
    key: fs.readFileSync('key.pem'),
    cert: fs.readFileSync('cert.pem'),
}, app).listen(3000, () => {
    console.log("Running on port : 3000");
})