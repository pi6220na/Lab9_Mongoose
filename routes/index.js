var express = require('express');
var ObjectID = require('mongodb').ObjectId;
var router = express.Router();
var Task = require('../models/task');


///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});


/* GET home page with all incomplete tasks */
/*
router.get('/', function(req, res, next) {

    req.tasks.find( {completed:false} ).toArray().then( (docs) => {
        res.render('index', {title: 'ToDo Task Database', tasks: docs})
    }).catch( (err) => {
        next(err);  // to the error handler
    });

});
*/

router.get('/', function(req, res, next) {

  Task.find( {completed: false})
      .then( (docs) => {
          res.render('index', {title: 'Incomplete Tasks', tasks: docs})
      }).catch( (err) => {
          next(err);
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
        /*
        req.tasks.insertOne({text: req.body.text, completed: false})
            .then(() => {
                res.redirect('/');
            })
            .catch((err) => {
                next(err);   // most likely to be a database error.
            });
            */
        new Task( { text: req.body.text, completed: false} ).save()
            .then((newTask) => {
            console.log('The new task created is: ', newTask);
            res.redirect('/');
            })
            .catch((err) => {
                next(err);  // database error?
            });
    }

});


/* POST task done */
router.post('/done', function(req, res, next){

    Task.findOneAndUpdate( {_id: req.body._id}, {$set: {completed: true}} )
        .then((updatedTask) => {
            if (updatedTask) {   // updatedTask is the document *before* the update
                res.redirect('/')  // One thing was updated. Redirect to home
            } else {
                // if no updatedTask, then no matching document was found to update. 404
                res.status(404).send("Error marking task done: not found");
            }
        }).catch((err) => {
        next(err);
    })


    /*
    var _id = req.body._id;

    if (!ObjectID.isValid(_id)) {
        var notFound = Error('Not found');
        notFound.status = 404;
        next(notFound);
    }

    else {
        req.tasks.findOneAndUpdate({_id: ObjectID(_id)}, {$set: {completed: true}})
            .then((result) => {
                // count how many things were updated. Expect to be 1.
                if (result.lastErrorObject.n === 1) {
                    res.redirect('/');
                } else {
                    // The task was not found. Report 404 error.
                    var notFound = Error('Task not found');
                    notFound.status = 404;
                    next(notFound);
                }
            })
            .catch((err) => {
                next(err);        // For database errors, or malformed ObjectIDs.
            });
    }

    */

});


/* POST all tasks done */
router.post('/alldone', function(req, res, next) {

    /*
    req.tasks.updateMany( { completed : false } , { $set : { completed : true}} )
        .then( (result) => {
            res.redirect('/');
        })
        .catch( (err) => {
            next(err);
        })
     */

     Task.updateMany( { completed : false } , { $set : { completed : true} } )
     .then( (result) => {
     console.log("How many documents were modified? ", result.n);
     req.flash('info', 'All tasks marked as done!');
     res.redirect('/');
     })
     .catch( (err) => {
     next(err);
     })

});




/* GET completed tasks */
router.get('/completed', function(req, res, next){

    /*
    req.tasks.find( {completed:true} ).toArray()
        .then( (docs) => {
            res.render('tasks_completed', {title: 'Completed Tasks', tasks: docs });
        }).catch( (err) => {
        next(err);
    });
    */

    Task.find( {completed:true} )
        .then( (docs) => {
            res.render('tasks_completed', { title: 'Completed tasks', tasks: docs });
        }).catch( (err) => {
            next(err);
    });

});

/* POST task delete */
router.post('/delete', function(req, res, next){

    /*
    var _id = req.body._id;

    if (!ObjectID.isValid(_id)) {
        var notFound = Error('Not found');
        notFound.status = 404;
        next(notFound);
    }

    else {
        req.tasks.findOneAndDelete( { _id: ObjectID(_id)} )
            .then((result) => {
                if (result.lastErrorObject.n === 1) {
                    res.redirect('/');
                } else {
                    // The task was not found. Report 404 error.
                    var notFound = Error('Task not found');
                    notFound.status = 404;
                    next(notFound);
                }
            })
            .catch((err) => {
                next(err);
            });
    }
    */


    Task.deleteOne( { _id : req.body._id } )
        .then( (result) => {

            if (result.deletedCount === 1) {  // one task document deleted
                res.redirect('/');

            } else {
                // The task was not found. Report 404 error.
                res.status(404).send('Error deleting task: not found');
            }
        })
        .catch((err) => {

            next(err);   // Will handle invalid ObjectIDs or DB errors.
        });

});


/* GET details about one task */
router.get('/task/:_id', function(req, res, next) {

    /*
    var _id = req.params._id;

    if (!ObjectID.isValid(_id)) {
        var notFound = Error('Not found');
        notFound.status = 404;
        next(notFound);
    }

    else {
        req.tasks.findOne({_id: ObjectID(_id)})
            .then((doc) => {
                if (doc == null) {
                    var notFound = Error('Not found');
                    notFound.status = 404;
                    next(notFound);
                } else {
                    res.render('task', {title: 'Task', task: doc});
                }
            })
            .catch((err) => {
                next(err);
            })
    }
    */


    /* This route matches URLs in the format task/anything
     Note the format of the route path is  /task/:_id
     This matches task/1 and task/2 and task/3...
     Whatever is after /task/ will be available to the route as req.params._id
     For our app, we expect the URLs to be something like task/1234567890abcdedf1234567890
     Where the number is the ObjectId of a task.
     So the req.params._id will be the ObjectId of the task to find
     */

    Task.findOne({_id: req.params._id} )
        .then( (task) => {
            if (task) {
                res.render('task', {title: 'Task', task: task});
            } else {
                res.status(404).send('Task not found');
            }
        })
        .catch((err) => {
            next(err);
        })


});


module.exports = router;
