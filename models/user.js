const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');


const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
})

UserSchema.plugin(passportLocalMongoose)
//it is automatically going to add on a field for username
//and for password and many other methods so that we can 
//make sure the username is unique and cant be duplicated;


module.exports = mongoose.model('User', UserSchema)