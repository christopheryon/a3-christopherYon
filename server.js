port = 3000
const express = require('express')
const app = express()
app.use(express.json());
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
require('dotenv').config({quiet: true})
const passport = require('passport');
const session_secret = process.env.EXPRESS_SESSION_SECRET
const user = process.env.DB_USER
const pass = process.env.DB_PASSWORD
const url = process.env.DB_URL
const uri = `mongodb+srv://${user}:${pass}@${url}/?retryWrites=true&w=majority&appName=Cluster0`;
const store = new MongoDBStore({
    uri: uri,
    databaseName: 'password_records',
    collection: 'sessions'
});
app.use(session({secret: session_secret, resave: false, saveUninitialized: false, store: store}));
app.use(passport.initialize());
app.use(passport.session({}));
const GitHubStrategy = require('passport-github2').Strategy;
const github_client = process.env.GITHUB_CLIENT_ID
const github_secret = process.env.GITHUB_CLIENT_SECRET

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

passport.use(new GitHubStrategy({
    clientID: github_client, clientSecret: github_secret, callbackURL: "https://a3-christopher-yon.vercel.app/auth/github/callback"
}, function (accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
        // use GitHub profile ID as user ID
        return done(null, profile);
    });
}));
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login')
}
app.get('/', ensureAuthenticated)
const {join} = require("node:path");
app.use(express.static(join(__dirname, 'public')))
const {MongoClient, ServerApiVersion, ObjectId} = require('mongodb');



// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1, strict: true, deprecationErrors: true,
    }
});

const passwordEntries = client.db("password_records").collection("entries")


// calculates the strength of a given password based on the bits of entropy.
// this measure of strength is technically only valid for randomly-generated
// passwords as human-made passwords have their own category of weaknesses
// regardless of the search space, but it's good enough for this assignment
const calculateStrength = (password) => {
    let possibleCharacters = 0;
    const lowercase = /[a-z]/
    const uppercase = /[A-Z]/
    const nums = /\d/
    // all the special characters you can type on a standard US keyboard
    const specials = /[!"#$%&'()*+,\-.\/\\:;<=>?@\[\]^_`{|}~ ]/
    // add to the pool of possible characters for each type of character found in the password
    if (lowercase.test(password)) {
        possibleCharacters += 26
    }
    if (uppercase.test(password)) {
        possibleCharacters += 26
    }
    if (nums.test(password)) {
        possibleCharacters += 10
    }
    if (specials.test(password)) {
        possibleCharacters += 33
    }
    // calculate entropy based on the pool of characters and the length of the password
    const entropy = Math.log2(Math.pow(possibleCharacters, password.length))
    // categorize entropy into strength levels
    // (one could argue for different categorizations, and it also depends on the use case,
    // but this is good as a demonstration/prototype)
    if (entropy < 25) {
        return "Terrible"
    } else if (entropy < 50) {
        return "Weak"
    } else if (entropy < 75) {
        return "Decent"
    } else {
        return "Great!"
    }
}

app.get('/auth/github', passport.authenticate('github', {scope: ['user:email']}));

app.get('/auth/github/callback', passport.authenticate('github', {failureRedirect: '/login'}), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});

app.get('/logout', function (req, res) {
    req.logout(() => {
        res.redirect('/')
    });

});


app.get('/login', (req, res) => {
    res.sendFile(join(__dirname, 'public', 'login.html'));
});
app.get('/passwords', async (req, res) => {
    if (req.user) {
        const entryCursor = await passwordEntries.find({associated_user: req.user.id})
        let response = []
        while (await entryCursor.hasNext()) {
            const current = await entryCursor.next()
            response.push({
                "id": current._id.toString(),
                "website": current.website,
                "username": current.username,
                "password": current.password,
                "strength": current.strength
            })
        }
        res.json(response)
    } else {
        res.statusCode = 400
        res.send("No authenticated user")
    }
})

app.post('/save', async (req, res) => {
    const entry = req.body
    if (entry.id !== -1 && req.user) {
        const query = {_id: new ObjectId(entry.id), associated_user: req.user.id}
        const updateOperation = {
            $set: {
                website: entry.website,
                username: entry.username,
                password: entry.password,
                strength: calculateStrength(entry.password)
            }
        }
        try {
            await passwordEntries.updateOne(query, updateOperation)
            res.send("Edited successfully")
        } catch (error) {
            res.statusCode = 400
            console.log(error)
            res.send("Error editing item: " + error)
        }
    } else {
        if (req.user) {
            const newEntry = {
                associated_user: req.user.id,
                website: entry.website,
                username: entry.username,
                password: entry.password,
                strength: calculateStrength(entry.password)
            }
            await passwordEntries.insertOne(newEntry)
            res.send("Submitted successfully")
        } else {
            res.statusCode = 400
            res.send("No authenticated user")
        }

    }
})

app.post('/delete', async (req, res) => {
    const entry = req.body
    if (req.user) {
        const query = {_id: new ObjectId(entry.id), associated_user: req.user.id}
        try {
            await passwordEntries.deleteOne(query)
            res.send("Deleted successfully")
        } catch (error) {
            res.statusCode = 400
            res.send("Error deleting item: " + error)
        }
    } else {
        res.statusCode = 400
        res.send("No authenticated user")
    }

})
app.get('/user', (req, res) => {
    if (req.user) {
        const user = {username: req.user.username, avatar_url: JSON.parse(req.user._raw).avatar_url}
        res.json(user)
    } else {
        res.statusCode = 400
        res.send("No authenticated user")
    }
})
app.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
})