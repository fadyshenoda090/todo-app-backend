const mongoose = require('mongoose');
const crypt = require ('bcryptjs')

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 2,
    },
    lastName:{
        type: String,
        required: true,
        minLength: 3,
    },
    dateOfBirth: {
        type: Date,
        required: true,
        validate: {
            validator: (value) => {
                return value < new Date();
            },
            message: props => `${props.value} is not a valid date of birth`
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (value) => {
                return /^[a-zA-Z0-9.#_]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(value);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    username: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (value) => {
                return /^[a-zA-Z0-9]{8,30}$/.test(value);
            },
            message: props => `${props.value} is not a valid user name`
        }
    },
    profilePicture:{
        type: String,
    },
    password: {
        type: String,
        minLength: 8,
        required: true,
        validate: {
            validator: (value) => {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+=/.|<>,'[\]{";:}])[\w~`!@#$%^&*()_\-+=/.|<>,'[\]{";:}]{9,}$/.test(value);
            },
            message: props => `${props.value} is not a valid password`
        }
    }
}, {timestamps: true});

userSchema.pre('save',async function(next){
    // console.log(this)
    const salt =await crypt.genSalt(10)
    this.password=await crypt.hash(this.password, salt)
})

const userModel = mongoose.model('user', userSchema);
module.exports = userModel;
