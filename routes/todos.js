const express= require('express');
const fs= require('fs')
const {auth}=require('../middleware/auth')
const {getAllTodos,
    getTodoById,
    addNewTodo,
    deleteTodoWithId,
    updateTodoById}=require('../controller/todos')
let router = express.Router();
/*apply the auth middleware over all the routes*/
router.use(auth);

/*pass the auth middleware to certain routes by passing the auth middleware before the callback function*/
// router.get('/', auth,getAllTodos);

//get all todos with optional query parameter title or status
router.get('/',getAllTodos);

//get a todo by id
router.get('/:id', getTodoById)

//add a new todo
router.post('/', addNewTodo)

//delete a todo by id
router.delete('/:id', deleteTodoWithId)

//update a todo by id
router.patch('/:id', updateTodoById);

module.exports = router;