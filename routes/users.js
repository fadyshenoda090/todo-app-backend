const express = require('express')
const {
    getAllUsers,
    getUserByToken,
    getUserTodos,
    addNewUser,
    updateUserByToken,
    deleteUserById,
    login,
    checkUserToken
} = require('../controller/users')
const { auth } = require('../middleware/auth')
let router = express.Router()
const upload = require('../multerConfig')

//get all users with optional query parameter name, email, username
router.get('/', getAllUsers)

//get a user by id
router.get('/:id', getUserByToken)

//get todos of a specific user
router.get('/:token/todos',auth,getUserTodos)

//checkToken
router.post('/checkToken',checkUserToken)

//add a new user
router.post('/',upload.single('profilePicture'), addNewUser)

//update a user by id
router.patch('/:id', updateUserByToken)

//delete a user by id
router.delete('/:id', deleteUserById)

//login route
router.post('/login',login)
module.exports = router