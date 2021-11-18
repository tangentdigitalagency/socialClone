
const express = require('express');

const app = express();

const router = express.Router();

const bodyParser = require('body-parser');

app.set('view engine', 'pug');

app.set('views', 'views');

app.use(bodyParser.urlencoded({
    extended: false
}))

router.post('/', (req, res, next) => {

    var payload = {
        pageTitle: 'Register'
    }


    res.status(200).render('register', payload)

})

module.exports = router;
