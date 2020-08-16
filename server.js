const express = require('express');
const PORT = process.env.PORT || 3005;
const app = express();

const db = require('./db/db.json');

// not sure if i need these...
const fs = require("fs");
const path = require('path');

const uniqid = require('uniqid');
// console.log(uniqid());
// console.log(uniqid(), uniqid());

function createNewNote(body, notesData) {
    // console.log(body);
    const newNote = body;
    notesData.push(newNote);

    // writes to our db.json file after we push new object to the array
    // fs.writeFileSync() is the synchronous version of fs.writeFile() and doesn't require a callback.  Its good for writing small files
    fs.writeFileSync(
        // the path.join() method is used to join the value of __dirname, which represents the directory of the file we execute the code in
        path.join(__dirname, '/db/db.json'),
        // saves the JS array data as JSON.  Null argument means we don't want to edit any of our existing data.  The 2 indicates we want to create white space between our values to make it more readable.
        JSON.stringify(notesData, null, 2)
    );

    // return finished code to post route for response
    // return body;

    return newNote;
};

function validateNote(newNote) {
    if (!newNote.title || typeof newNote.title !== "string") {
        return false;
    }
    if (!newNote.text || typeof newNote.text !== "string") {
        return false;
    }
    return true;
};




// parse incoming string or array data
app.use(express.urlencoded({ extended: true }));

// parse incoming JSON data
app.use(express.json());

// tells app (aka: express.js) to use our public folder
app.use(express.static('public'));

app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

app.get('/api/notes', (req, res) => {
    let results = fs.readFileSync('./db/db.json');
    results = JSON.parse(results);
    console.log(results);
    res.json(results);
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.post('/api/notes', (req, res) => {
    let notesData = JSON.parse(fs.readFileSync('./db/db.json'));

    // set id based on what the next index of the array will be
    req.body.id = uniqid();

    // if any data in req.body is incorrect, send 400 error back
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
    } else {
        const newNote = createNewNote(req.body, notesData);
        res.json(newNote);
    }
});

// Deletes a note with specific ID
app.delete('/api/notes/:id', (req, res) => {

    // receive query parameter containing ID of the note to delete
    noteId = req.params.id;
    // console.log(noteId);

    // fs read the entire db.json file
    let notesData = fs.readFileSync('./db/db.json');

    // parse the data to get an array of objects
    notesData = JSON.parse(notesData);

    // filter and delete requested note from array of objects
    notesData = notesData.filter(note => {
        return note.id != noteId;
    });

    // stringify the array of objects so it can be written as JSON
    notesData = JSON.stringify(notesData, null, 2)
    // console.log(notesData);

    // re-write the new db.json data without the deleted note
    fs.writeFileSync('./db/db.json', notesData);

    console.log("Deleted note with ID " + req.params.id);

    // parse and send back to client side
    res.send(JSON.parse(notesData));
});






app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});