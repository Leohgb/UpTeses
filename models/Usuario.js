const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Usuario = new Schema({
    nome:{
        type:String, 
        required: true
    }, 
    email:{
        type:String,
        required: true
    },
    /* Quando o usuario se cadastrar normalmente no sistema por padrão
    O campo é admin dele vai ser igual a 0 ou seja ele não é admin
    Mas quando o campo é igual a 1 então ele é admin */ 
    eAdmin:{
        type:Number,
        default: 0
    },
    status: {
        type: String, 
        enum: ['Pending', 'Active'],
        default: 'Pending'
      },
      confirmacao: { 
        type: String, 
        unique: true 
    },
    senha:{
        type: String,
        required: true
    }
})

mongoose.model("usuarios", Usuario)