const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        minLength: 3,
        required: true,
    },
    status: {
        type: String,
        minLength: 4,
        maxLength: 12,
        default: "to-do",
        enum: ['to-do', 'in progress', 'done']
    },
    priority:{
        type: String,
        minLength: 3,
        maxLength: 12,
        default: "low",
        enum: ['low', 'medium', 'high']
    },
    userId:{
        required:true,
        type: mongoose.SchemaTypes.ObjectId,
        ref:'user',
    },
}, {timestamps: true})
let todosModel = mongoose.model('todo', todoSchema)
module.exports = todosModel