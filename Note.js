const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/notesApp', { useNewUrlParser: true, useUnifiedTopology: true });

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});


const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Register
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.send('User registered');
});

// Login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).send('User not found');
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');
    const token = jwt.sign({ id: user._id }, 'your_jwt_secret');
    res.json({ token });
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).send('Access denied');
    try {
        const verified = jwt.verify(token, 'your_jwt_secret');
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).send('Invalid token');
    }
};


const Note = require('./models/Note');

// Create a new note
app.post('/notes', verifyToken, async (req, res) => {
    const { title, content, tags, color } = req.body;
    const note = new Note({ title, content, tags, color, userId: req.user.id });
    await note.save();
    res.send('Note created');
});

// Get all notes for a user
app.get('/notes', verifyToken, async (req, res) => {
    const notes = await Note.find({ userId: req.user.id });
    res.json(notes);
});

// Search notes
app.get('/notes/search', verifyToken, async (req, res) => {
    const { query } = req.query;
    const notes = await Note.find({
        userId: req.user.id,
        $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } },
            { tags: { $regex: query, $options: 'i' } }
        ]
    });
    res.json(notes);
});

// Archive a note
app.put('/notes/:id/archive', verifyToken, async (req, res) => {
    await Note.findByIdAndUpdate(req.params.id, { archived: true });
    res.send('Note archived');
});

// Trash a note
app.put('/notes/:id/trash', verifyToken, async (req, res) => {
    await Note.findByIdAndUpdate(req.params.id, { trashed: true });
    res.send('Note trashed');
});

// Get trashed notes
app.get('/notes/trashed', verifyToken, async (req, res) => {
    const notes = await Note.find({ userId: req.user.id, trashed: true, trashDate: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) } });
    res.json(notes);
});