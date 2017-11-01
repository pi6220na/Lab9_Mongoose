/**
 * Created by pi6220na on 11/1/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//define your schema
var taskSchema = new Schema( {
    text: String,
    completed: Boolean
});

// compile taskSchema into Mongoose model object
var Task = mongoose.model('Task', taskSchema);

// export the Task so our other code can use it
module.exports = Task;
