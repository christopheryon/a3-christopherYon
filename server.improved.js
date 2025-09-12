const http = require("http"),
    fs = require("fs"),
    // IMPORTANT: you must run `npm install` in the directory for this assignment
    // to install the mime library if you"re testing this on your local machine.
    // However, Glitch will install it automatically by looking in your package.json
    // file.
    mime = require("mime"),
    dir = "public/",
    port = 3000

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
    {"id": 1, "website":"https://google.com", "username": "mycoolusername", "password": "myverystrongpassword", "strength": ""},
    {"id": 2, "website":"https://youtube.com","username": "godofdestruction", "password": "password!", "strength": ""},
    {"id": 3, "website":"https://wpi.edu", "username": "isthistaken", "password": "password1", "strength": ""},
]

let idCounter = 4;

for (const passwordStoreElement of passwordStore) {
    passwordStoreElement.strength = calculateStrength(passwordStoreElement.password)
}


const server = http.createServer(function (request, response) {
    if (request.method === "GET") {
        handleGet(request, response)
    } else if (request.method === "POST") {
        handlePost(request, response)
    }
})


const handleGet = function (request, response) {
    const filename = dir + request.url.slice(1)
    if (request.url === "/") {
        sendFile(response, "public/index.html")
    } else if (request.url === "/passwords") {
        // who needs authentication? :)
        response.writeHead(200, "OK", {"Content-Type": "application/json"})
        response.end(JSON.stringify(passwordStore))
    } else {
        sendFile(response, filename)
    }
}

const handlePost = function (request, response) {
    let dataString = ""
    request.on("data", (data) => {
        dataString += data
    })
    request.on("end", () => {
        if (request.url === "/save") {
            const entry = JSON.parse(dataString)
            if (entry.id > -1) {
                const item = passwordStore.findIndex(value => value.id === entry.id)
                if (item > -1) {
                    const record = passwordStore[item]
                    record.website = entry.website
                    record.username = entry.username
                    record.password = entry.password
                    record.strength = calculateStrength(entry.password)
                    response.writeHead(200, "OK", {"Content-Type": "text/plain"})
                    response.end("Edited successfully")
                } else {
                    response.writeHead(400, "Bad Request", {"Content-Type": "text/plain"})
                    response.end("Item not found")
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
                response.writeHead(200, "OK", {"Content-Type": "text/plain"})
                response.end("Submitted successfully")
            }
        } else if (request.url === "/delete") {
            const entry = JSON.parse(dataString)
            const item = passwordStore.findIndex(value => value.id === entry.id)
            if (item > -1) {
                passwordStore.splice(item, 1)
                response.writeHead(200, "OK", {"Content-Type": "text/plain"})
                response.end("Deleted successfully")
            } else {
                response.writeHead(400, "Bad Request", {"Content-Type": "text/plain"})
                response.end("Item not found")
            }
        } else {
            response.writeHead(400, "Bad Request", {"Content-Type": "text/plain"})
            response.end("Unsupported endpoint")
        }
    })
}

const sendFile = function (response, filename) {
    const type = mime.getType(filename)

    fs.readFile(filename, function (err, content) {

        // if the error = null, then we"ve loaded the file successfully
        if (err === null) {

            // status code: https://httpstatuses.com
            response.writeHeader(200, {"Content-Type": type})
            response.end(content)

        } else {

            // file not found, error code 404
            response.writeHeader(404)
            response.end("404 Error: File Not Found")

        }
    })
}

server.listen(process.env.PORT || port)
