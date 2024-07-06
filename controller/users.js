const userModel = require('../models/user')
const todosModel = require('../models/todo')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {promisify} = require('util')

const formatDate = (date) => {
    const d = new Date(date);
    let month = '' + (d.getMonth() + 1);
    let day = '' + d.getDate();
    let year = d.getFullYear();
    let hours = d.getHours();
    let minutes = d.getMinutes();   
    let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  let strTime = hours + ':' + minutes + ' ' + ampm;

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    if (hours.length < 2) hours = '0' + hours;
    if (minutes.length < 2) minutes = '0' + minutes;

    return [[day, month, year,].join('-'), strTime].join(' at ') 
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find()
        const {username, email, firstName,lastNamer, limit, skip} = req.query
        let filteredUsers = users
        if (username) {
            filteredUsers = filteredUsers?.filter(user => user.username.toLowerCase().includes(username.toLowerCase()))
        }
        if (email) {
            filteredUsers = filteredUsers?.filter(user => user.email.toLowerCase().includes(email.toLowerCase()))
        }
        if (firstName) {
            filteredUsers = filteredUsers?.filter(user => user.firstName.toLowerCase().includes(firstName.toLowerCase()))
        }
        if (lastNamer) {
            filteredUsers = filteredUsers?.filter(user => user.lastName.toLowerCase().includes(lastName.toLowerCase()))
        }
        if (skip) {
            filteredUsers = filteredUsers.slice(parseInt(skip))
        }
        if (limit) {
            filteredUsers = filteredUsers.slice(0, parseInt(limit))
        }
        const formattedUsers = filteredUsers.map(user => {
            const formattedUser = user.toObject();
            formattedUser.dateOfBirth = formatDate(user.dateOfBirth);
            formattedUser.createdAt = formatDate(user.createdAt);
            formattedUser.updatedAt = formatDate(user.updatedAt);
            return formattedUser;
        });

        res.status(200).json(formattedUsers);
    } catch (err) {
        res.status(500).json({message: 'something went wrong', error: err.message})
    }
}
const getUserByToken = async (req, res) => {
    const {token} = req.headers
    if (!token) {
        return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    try {
        const decode = await promisify(jwt.verify)(token, process.env.SECRET)
        const userId= decode.id
        const user = await userModel.findById(userId)
        if (!user) {
            res.status(404).json({message: 'user not found'})
        }
        const formatedUser = user.toObject()
        formatedUser.dateOfBirth = formatDate(user.dateOfBirth)
        formatedUser.createdAt = formatDate(user.createdAt)
        formatedUser.updatedAt = formatDate(user.updatedAt)
        res.status(200).json(formatedUser)
    } catch (err) {
        res.status(500).json({message: 'something went wrong', error: err.message})
    }
}
const getUserTodos = async (req, res) => {
    const { token } = req.headers;

    if (!token) {
        return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }

    try {
        const decoded = await promisify(jwt.verify)(token, process.env.SECRET);
        const userId = decoded.id;

        // Find the user by ID and populate their todos
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find todos associated with the user
        const todos = await todosModel.find({ userId });
        let filteredTodos = todos;
        const formattedTodos = filteredTodos.map(todo => {
            const formattedTodo = todo.toObject();
            formattedTodo.createdAt = formatDate(todo.createdAt);
            formattedTodo.updatedAt = formatDate(todo.updatedAt);
            return formattedTodo;
        });

        res.status(200).json(formattedTodos);
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err.message });
    }
};

const addNewUser = async (req, res) => {
    let userToAdd = req.body;
    if (req.file) {
        const imageName = req.file.filename;
        // Build the full URL for the image
        const imageUrl = `${req.protocol}://${req.get('host')}/media/${imageName}`;
        userToAdd.profilePicture = imageUrl;
    } else {
        // Set default profile picture based on gender
        if (userToAdd.gender === 'male') {
            userToAdd.profilePicture = `${req.protocol}://${req.get('host')}/media/maleUser.png`;
        } else {
            userToAdd.profilePicture = `${req.protocol}://${req.get('host')}/media/femaleUser.png`;
        }
    }
    try {
        const newUser = await userModel.create(userToAdd);
        res.status(200).json({ message: 'User added successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong', error: err });
    }
};


const updateUserByToken = async (req, res) => {
    const {token} = req.headers;
    const {firstName, lastName, email, username, password, dateOfBirth} = req.body;
    if (!token) {
        return res.status(401).json({ message: 'You must be logged in to access this resource' });
    }
    const decode = await promisify(jwt.verify)(token, process.env.SECRET)
        const userId= decode.id

    if (!firstName && !lastName && !email && !username && !password && !dateOfBirth) {
        return res.status(400).json({message: 'No update fields provided'});
    }

    try {
        // Create an update object with only the provided fields
        const updateFields = {};
        if (firstName) updateFields.firstName = firstName;
        if (lastName) updateFields.lastName = lastName;
        if (email) updateFields.email = email;
        if (username) updateFields.username = username;
        if (password) updateFields.password = password;
        if (dateOfBirth) updateFields.dateOfBirth = dateOfBirth;

        const user = await userModel.findByIdAndUpdate(
            userId,
            {$set: updateFields},
            {new: true, runValidators: true}
        );

        if (user) {
            res.status(200).json({message: 'User updated successfully', data: user});
        } else {
            res.status(404).json({message: 'Cannot update a non-existent user'});
        }
    } catch (err) {
        res.status(500).json({message: 'Something went wrong', error: err.message});
    }
};

const deleteUserById = async (req, res) => {
    const {id} = req.params
    try {
        const user = await userModel.findByIdAndDelete(id)
        console.log('user', user)
        if (!user) {
            return res.status(404).json({message: 'user not found'})
        }
        res.status(200).json({message: 'user deleted successfully'})
    } catch (err) {
        res.status(500).json({message: 'something went wrong'})
    }
}

const login = async (req, res) => {
    const {identifier, password} = req.body
    if (!identifier || !password) {
        res.status(400).json({message: 'invalid email or username'})
        return
    }
    try {
        const user = await userModel.findOne({$or: [{email: identifier}, {username: identifier}]})
        // console.log('user', process.env.SECRET)
        if (!user) {
            return res.status(404).json({message: 'user not found'})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({message: 'invalid password'})
        }
        const token = jwt.sign({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            email: user.email
        }, `${process.env.SECRET}`, {expiresIn: '1h'})
        res.status(200).json({message: 'login successful', token})
    } catch (err) {
        res.status(500).json({message: 'something went wrong', error: err.message})
    }
}

const checkUserToken = async (req,res)=>{
    const {token} = req.body
    try{
        if(!token){
            return res.status(401).json({error: 'you must be logged in if no token is provided'})
        }
        await promisify(jwt.verify)(token,process.env.SECRET)
    res.status(200).json({message:'token is valid'})
    }catch(err){
        return res.status(401).json({error: 'you must be logged in'})
    }
}
module.exports = {
    getAllUsers,
    addNewUser,
    updateUserByToken,
    deleteUserById,
    getUserByToken,
    getUserTodos,
    login,
    checkUserToken
}