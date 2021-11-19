
const express = require('express');
const app = express();
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../schemas/userSchema');
const bcrypt = require('bcrypt');
const session = require('express-session');


app.set('view engine', 'pug');
app.set('views', 'views');


app.use(bodyParser.urlencoded({
    extended: false
}));

router.get('/', (req, res, next) => {
    res.status(200).render('register')
})

router.post('/', async (req, res, next) => {

    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    var username  = req.body.username.trim();
    var email = req.body.email.trim();
    var password  = req.body.password;

    var payload = req.body;

    if(firstName && lastName && username && email && password){

       var user = await User.findOne({
            $or: [
                 {username: username },
                { email: email }
            ]
         })
         .catch((error) =>{
             console.log(error);
             payload.errorMessage = "There was an error connecting to the DB!";             
             res.status(200).render('register', payload);
         });
         
         if(user == null){
            var data = req.body;

            data.password = await bcrypt.hash(password, 10);

            User.create(data)
            .then((user) => {
               req.session.user = user;
               return res.redirect('/')
            })
         }
         else {
             if(email == user.email) {
                 payload.errorMessage = 'There already is an email registered with that email'
             }
             else {
                 payload.errorMessage = 'This username is already in use!';
             }
             res.status(200).render('register', payload);
         }
        
    }
    else{
        payload.errorMessage = 'Make Sure Each Field is complete!'
        res.status(200).render('register', payload)
    }
})

module.exports = router;
