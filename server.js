const fs = require('fs');
const https = require('https');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const passport = require('passport');
const cookieSession = require('cookie-session')
const { Strategy } = require('passport-google-oauth20');

require('dotenv').config();

function verifyCallBack(accessToken, refreshToken, profile, done) {
    console.log('Google profile', profile);
    done(null, profile);
}

const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    COOKIE_KEY_1: process.env.COOKIE_KEY_1,
    COOKIE_KEY_2: process.env.COOKIE_KEY_2
}

const AUTH_DATA = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET,
}

passport.use(new Strategy(AUTH_DATA, verifyCallBack));

//save the session in the cookie
passport.serializeUser((user, done) => {
    done(null, user.id);
});

//read the session from the cookie
passport.deserializeUser((id, done) => {
    // User.findById(id).then(user => {
    //     done(null, user);
    // })

    done(null, id);
});

const app = express();

app.use(helmet());
app.use(cookieSession({
    name: 'session',
    maxAge: 60 * 60 * 24 * 1000,
    keys: [config.COOKIE_KEY_1, config.COOKIE_KEY_2],
}));
app.use(passport.initialize());
app.use(passport.session());

function checkLoggedIn(req, resp, next) {
    const isLoggedIn = req.isAuthenticated() && req.user;
    if (!isLoggedIn) {
        return resp.status(401).json({
            error: "You must log in",
        })
    }
    next();
}

app.get('/auth/google', passport.authenticate('google', {
    scope: ['email', 'profile'],
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: true,
}), (req, resp) => {
    console.log('Google called us back');
});

app.get('/auth/logout', (req, resp) => {
    req.logout();
    return resp.redirect('/');
});

app.get('/secure', checkLoggedIn, (req, resp) => {
    resp.send("Your secret key is : 7");
})

app.get('/failure', (req, resp) => {
    resp.send("Login failed, try again...");
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