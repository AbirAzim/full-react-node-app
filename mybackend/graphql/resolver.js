const bcrypt = require('bcrypt');

const validator = require('validator');

const User = require('../models/user');

module.exports = {
    createUser : async function( { userInput } , req ) {

        const errors = [];

        //add validation
        if(!validator.isEmail(userInput.email)){
            errors.push({message : 'email is invalid ! '}); 
        }

        if(validator.isEmpty(userInput.password) || !validator.isLength(userInput.password , { min : 5})){
            errors.push({ message : 'Password too short use strong one !'})
        }

        if(errors.length > 0){
            const error = new Error('invalid input');
            error.data = errors;
            error.code = 422;
            throw error;
        }

        //check for existing user
        const existingUser = await User.findOne({email : userInput.email});

        //if user found with that email throw an error
        if(existingUser){
            const error = new Error('Email Already Exists !');
            throw error;
        }

        //make paasword encrypted
        const hashedPassword = await bcrypt.hash(userInput.password , 12 );

        const user = new User({
            email : userInput.email,
            name : userInput.name,
            password : hashedPassword
        })

        const createdUser = await user.save();

        return {...createdUser._doc , _id: createdUser._id.toString()}
    }
}