
const express = require('express');
const middleware = require('./middleware')
const path = require('path')
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require('./database');
const session = require('express-session');



const server = app.listen(port, () => console.log('server listening on port ', + port));

app.set('view engine', 'pug');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({ 
    secret: 'test',
    resave: true,
    saveUninitialized: false
}))

// Set Routes
const loginRoute = require('./routes/loginRoutes');
const registerRoute = require('./routes/registerRoutes');
const logOutRoute = require('./routes/logout');
const postRoute = require('./routes/postRoutes');


//APi Routes
const postApiRoute = require('./routes/api/posts');

// Page Handlers
app.use('/login', loginRoute)
app.use('/register', registerRoute)
app.use('/logout', logOutRoute)
app.use('/posts',  middleware.requireLogin, postRoute)
// API Handler
app.use('/api/posts', postApiRoute)

app.get('/', middleware.requireLogin, (req, res, next) => {

    var payload = {
        pageTitle: 'Home',
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user),
    }

    res.status(200).render('home', payload)

})
