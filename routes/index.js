var express = require('express');
var router = express.Router();

///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});


/* GET home page with all incomplete tasks */
router.get('/', function(req, res, next) {

    req.tasks.find( {completed:false} ).toArray().then( (docs) => {
        res.render('index', {title: 'Incomplete Tasks', tasks: docs})
    }).catch( (err) => {
        next(err);  // to the error handler
    });

});

/* POST new task */
router.post('/add', function(req, res, next){

    if (!req.body || !req.body.text) {
        //no task text info, redirect to home page with flash message
        req.flash('error', 'please enter a task');
        res.redirect('/');
    }

    else {
        // Insert into database. New tasks are assumed to be not completed.
        req.tasks.insertOne({text: req.body.text, completed: false})
            .then(() => {
                res.redirect('/');
            })
            .catch((err) => {
                next(err);   // most likely to be a database error.
            });
    }

});


module.exports = router;
