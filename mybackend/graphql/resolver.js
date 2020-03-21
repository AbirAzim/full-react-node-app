const bcrypt = require('bcrypt');

const validator = require('validator');

const User = require('../models/user');

const jwt = require('jsonwebtoken');

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
    },

    login  : async function({email , password}) {
        const user = await User.findOne({email : email});

        if(!user){
            const error = new Error('User Not Found !');
            error.code = 401;
            throw error;
        }

        const isPasswordMatch = await bcrypt.compare(password , user.password);

        if(!isPasswordMatch){
            const error = new Error('Password Not Matching !');
            error.code = 401;
            throw error;
        }

        const token = jwt.sign({
            userId : user._id.toString(),
            email : user.email
        }, 'mysecretmessage' , { expiresIn : '2h'})

        return { token , userId : user._id.toString() }
    }
}