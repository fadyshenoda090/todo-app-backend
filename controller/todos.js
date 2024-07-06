const fs = require('fs');
const todosModel = require('../models/todo');

const formatDate= (date) => {
    let d = new Date()
    let day = String(d.getDate()).padStart(2, '0')
    let month = String(d.getMonth() + 1).padStart(2, '0')
    let year = d.getFullYear()
    return `${day}/${month}/${year}`
}

//get all todos with optional query parameter title
const getAllTodos = async (req, res) => {
    try {
        const todos = await todosModel.find().populate('userId','name');
        const {title, limit, skip, status} = req.query;
        let filteredTodos = todos;
        if (title) {
            filteredTodos = filteredTodos?.filter(todo => todo.title.toLowerCase().includes(title.toLowerCase()));
        }
        if (status) {
            filteredTodos = filteredTodos?.filter(todo => todo.status.toLowerCase() === status.toLowerCase());
            if (filteredTodos.length === 0) {
                return res.status(404).json({message: 'No todos with this status'});
            }
        }
        if (skip) {
            filteredTodos = filteredTodos.slice(parseInt(skip));
        }
        if (limit) {
            filteredTodos = filteredTodos.slice(0, parseInt(limit));
        }
        const formattedTodos = filteredTodos.map(todo => {
            const formattedTodo = todo.toObject();
            formattedTodo.createdAt = formatDate(todo.createdAt);
            formattedTodo.updatedAt = formatDate(todo.updatedAt);
            return formattedTodo;
        });
        res.status(200).json(formattedTodos);
    } catch (err) {
        res.status(500).json({error: err.message})
    }
}

//get a todo by id
const getTodoById = async (req, res) => {
    const id = req.params.id;
    try {
        const todo = await todosModel.findById(id);
        if (todo) {
            res.json(todo);
        } else {
            res.status(404).json({message: 'Todo not found'});
        }
    } catch (err) {
        res.status(500).json({message: "error while getting todo"});
    }
};

//add a new todo
const addNewTodo = async (req, res) => {
    let todoToAdd = req.body;
    todoToAdd.userId = req.id;
    try {
        const newTodo = await todosModel.create(todoToAdd);
        res.status(201).json({message: 'todo added successfully', data: newTodo})
    } catch (err) {
        res.status(400).json({error: err.message})
    }
}

//delete a todo by id
const deleteTodoWithId = async (req, res) => {
    // const todos = JSON.parse(fs.readFileSync('todos.json', 'utf-8'))
    const id = req.params.id
    try {
        await todosModel.deleteOne({_id: id})
        res.status(200).json({message: 'todo deleted successfully' })
    } catch (err) {
        res.status(500).json({message: 'error while deleting todo'})
    }
}

//update a todo by id
const updateTodoById = async (req, res) => {
    // const todos = JSON.parse(fs.readFileSync('todos.json', 'utf-8'));
    const id = req.params.id;
    const title = req.body.title;
    const status = req.body.status;
    const priority = req.body.priority;
    try {
        await todosModel.updateOne({_id: id}, {title, status, priority})
        res.status(200).json({message: 'todo updated successfully'})
    } catch (err) {
        res.status(500).json({message: 'error while updating todo'})
    }
}
module.exports = {
    getAllTodos,
    getTodoById,
    addNewTodo,
    deleteTodoWithId,
    updateTodoById
}