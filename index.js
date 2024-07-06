const todosRouter = require('./routes/todos');
const usersRouter = require('./routes/users');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path = require('path');

app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// Custom middleware
app.use((req, res, next) => {
    next();
});

// Serve static files
app.use('/media', express.static(path.join(__dirname, 'media')));

// Define routes
app.use('/todos', todosRouter);
app.use('/users', usersRouter);

// Not found middleware
app.use('*', (req, res) => {
    // console.log(req);
    res.status(404).json({ error: 'not found no routes available' });
});

// Error handler middleware
app.use((err, req, res, next) => {
    // console.log('Error stack:', err.stack);
    console.log('Error message:', err.message);
    res.status(500).json({ message: 'something went wrong', error: err.message });
});

// Connect to MongoDB
mongoose.connect('mongodb+srv://fadyshenoda0o0:1ztm1i9nJbIqotQF@cluster0.xbc7vh1.mongodb.net/').then(
    () => console.log('connected to the todos Database')
).catch(
    err => console.log('error while connecting to the DB', err)
);

/* Run the server over the network */
// app.listen(3000, '192.168.1.4', () => {
//     console.log('server started on http://192.168.1.4:3000');
// });

/* Run the server on localhost */
app.listen(3000, () => {
    console.log('server started on port 3000');
});
