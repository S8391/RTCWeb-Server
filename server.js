const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const userRoutes = require('./routes/api/users');

const app = express();

// Database connection
mongoose.connect('mongodb://localhost/myDatabase', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to the database.'))
.catch((error) => console.error('Failed to connect to the database:', error));

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Use authentication routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}.`));
