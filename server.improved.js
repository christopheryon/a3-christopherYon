port = 3000
const express = require('express')
const app = express()
app.use(express.static('public'))
app.use(express.json());

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

const passwordStore = [
    {
        "id": 1,
        "website": "https://google.com",
        "username": "mycoolusername",
        "password": "myverystrongpassword",
        "strength": ""
    },
    {
        "id": 2,
        "website": "https://youtube.com",
        "username": "godofdestruction",
        "password": "password!",
        "strength": ""
    },
    {"id": 3, "website": "https://wpi.edu", "username": "isthistaken", "password": "password1", "strength": ""},
]

let idCounter = 4;

for (const passwordStoreElement of passwordStore) {
    passwordStoreElement.strength = calculateStrength(passwordStoreElement.password)
}

app.get('/passwords', (req, res) => {
    res.json(passwordStore)
})

app.post('/save', (req, res) => {
    const entry = req.body
    if (entry.id > -1) {
        const item = passwordStore.findIndex(value => value.id === entry.id)
        if (item > -1) {
            const record = passwordStore[item]
            record.website = entry.website
            record.username = entry.username
            record.password = entry.password
            record.strength = calculateStrength(entry.password)
            res.send("Edited successfully")
        } else {
            res.statusCode = 400
            res.send("Item not found")
        }
    } else {
        passwordStore.push({
            id: idCounter,
            website: entry.website,
            username: entry.username,
            password: entry.password,
            strength: calculateStrength(entry.password)
        })
        idCounter++
        res.send("Submitted successfully")
    }
})

app.post('/delete', (req, res) => {
    const entry = req.body
    const item = passwordStore.findIndex(value => value.id === entry.id)
    if (item > -1) {
        passwordStore.splice(item, 1)
        res.send("Deleted successfully")
    } else {
        res.statusCode = 400
        res.send("Item not found")
    }
})

app.listen(port, () => {
    console.log(`Express server listening on port ${port}`)
})