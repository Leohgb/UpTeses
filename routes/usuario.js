const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Usuario")
const Postagem = mongoose.model("postagens")
const Usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")
require("../models/Categorias")
const Categoria = mongoose.model("categorias")
const {eUser}= require("../helpers/eUser")
const multer = require('multer')
const multerConfig = require('../config/multer')
const cloudinary = require("../config/cloudinary")
const config = require("../config/nodemailer_auth.config");
const jwt = require("jsonwebtoken");
const nodemailer = require("../config/nodemailer.config")
const eAdmin = require('../helpers/eAdmin')

router.get("/registro", (req, res) =>{
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) =>{
    var erros = []

    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome ==null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.email || typeof req.body.email == undefined || req.body.email ==null){
        erros.push({texto: "E-mail inválido"})
    }
    
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha ==null){
        erros.push({texto: "Senha inválido"})
    }
    
    if(req.body.senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }

    if(req.body.senha != req.body.senha2){
        erros.push({texto:"As senhas são diferentes, tente novamente!"})
    }

    if(erros.length > 0){

        res.render("usuarios/registro", {erros: erros})
    }else{
        //verificando se email já não está cadastrado no banco de dados
        Usuario.findOne({email: req.body.email}).then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail no nosso sistema")
                res.redirect("/usuarios/registro")
            }else{
                const token = jwt.sign({email: req.body.email}, config.secret)

                    //encriptar mensagem em hash
                    const salt = bcrypt.genSaltSync(10);
                    const hash = bcrypt.hashSync(req.body.senha, salt);

                    const UserData = {
                    nome : req.body.nome,
                    email : req.body.email,
                    senha : hash,
                    confirmacao: token,
                }

                new Usuario(UserData).save().then((err) => {
                    nodemailer.sendConfirmationEmail(
                        UserData.nome,
                        UserData.email,
                        UserData.confirmacao
                  )  
                    req.flash('success_msg', 'Confira seu Email e confirme')
                    res.redirect('/usuarios/registro')
                }).catch((err) => {
                    console.log(err)
                    req.flash('error_msg', 'Erro ao cadastrar o usuario')
                    res.redirect("/usuarios/registro")
                })
            }
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect("/")
        })

    }

})

router.get("/postagens", eUser, (req, res) =>{
   
    Postagem.find({usuarios: req.user.email}).populate("categoria").sort({data:"desc"}).lean().then((postagens) => {
        res.render("usuarios/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash("error_msg","Houve um erro ao listar as postagens")
        res.redirect("/postagens")
     })
})  

router.get("/postagens/edit/:id", (req,res) =>{
    //Id é o parametro
    //pesquisando para um Postagem
    Postagem.findOne({_id: req.params.id}).lean().then((Postagem) =>{
        //pesquisando por uma categoria
        Categoria.find().lean().then((categorias) =>{
            //renderizando dados na view
            res.render("usuarios/editpostagens",{categorias: categorias, Postagem: Postagem})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/usuarios/editpostagens")
        })
    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/usuarios/postagens")
    })

})

Emailconfirm = (req,res) =>{
    Usuario.findOne({confirmacao: req.params.confirmacao}).then((usuario) => {

        console.log(req.params.confirmacao)
        usuario.status = "Active"

        usuario.save(function (err) {
            if(err){
                req.flash("error_msg","Houve um erro ao Confirmar")
                res.redirect("/usuarios/login") 
            }
            else{
                req.flash('success_msg', 'Confirmado')
                res.redirect("/usuarios/login")
            }
        });
}).catch((err) => {
    console.log(err)
    req.flash("error_msg","Houve um erro ao Confirmar")
    res.redirect("/usuarios/login")})
}


router.get("/registro/:confirmacao", Emailconfirm)

router.post("/postagem/edit", (req,res) =>{
    
    Postagem.findOne({_id:req.body.id}).then((Postagem) =>{

        Postagem.titulo = req.body.titulo
        Postagem.slug = req.body.slug
        Postagem.descricao = req.body.descricao
        Postagem.categoria = req.body.categoria
        Postagem.usuarios =  req.user.email

        Postagem.save().then(() =>{
            req.flash("success_msg","Postagem editada com sucesso!")
            res.redirect("/usuarios/postagens")
        }).catch((err) =>{
            req.flash("error_msg","Erro interno")
            res.redirect("/usuarios/postagens")
        })

    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/usuarios/postagens")
    })

})

router.get("/login", (req,res) => {
    res.render("usuarios/login")
})

router.post("/login", (req, res, next) =>{
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: "/usuarios/login",
        failureFlash: true
    })(req, res, next)
})

router.get("/logout", (req, res, next) =>{
    req.logout((err) => {
        req.flash('success_msg', "Deslogado com sucesso!")
        res.redirect("/")
    })
})

router.post("/addpostagem", eUser, multer(multerConfig).single('documentacao'), async (req,res) =>{
    var erros = []

    if(req.body.categoria ==""){
        erros.push({textp:"Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("usuarios/addpostagem", {erros: erros})
    }else{

    try{
        const documento = await cloudinary.uploader.upload(req.file.path, {use_filename: true, unique_filename: true})
          .catch(function(err){
            if (err){
                req.flash("error_msg","Arquivo Inválido, adicione um PDF!")       
                res.redirect("/addpostagem")} 
          });

          const novaPostagem ={  
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            documentacao:{
                id: documento.public_id,
                name: req.file.originalname,
                size: req.file.size,
                key: req.file.filename,
                url: documento.url,
                },
            slug: req.body.slug,
            usuarios:  req.user.email,
        }
                         
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg","Postagem criada com sucesso!")       
            res.redirect("/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg","Houve um erro durante o salvamento da Postagem!")       
            res.redirect("/postagens")
        })
    }catch(err){
        req.flash("error_msg","Arquivo Inválido, adicione um PDF!")       
        res.redirect("/addpostagem")
    } 
        
    }
})

router.get("/postagens/deletar/:id", eUser, async(req,res) =>{
    let postagem = await Postagem.findById(req.params.id);
    Postagem.deleteOne({_id: req.params.id}).then(async()=>{
        await cloudinary.uploader.destroy(postagem.documentacao.id).then(result=>console.log(result));
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/postagens")

    })
})
/*Fim usuario*/


module.exports = router
