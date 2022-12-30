/*Postagem*/ 
const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categorias")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")

//Pegar apenas a função eAdmin
const {eAdmin}= require("../helpers/eAdmin")

router.get('/', eAdmin,  (req,res) => {
    res.render("admin/index")
})

router.get('/posts', eAdmin, (req,res) =>{
    res.send("Página de posts")
})

router.get('/categorias', eAdmin, async (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/categorias", {categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect("/admin")
    })
})

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = []

     if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome Inválido"})
     }

     if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
         erros.push({texto: "Slug Inválido"})
     }

     if(req.body.nome.length < 2){
        erros.push({texto: "Nome da categoria muito pequeno"})
     }

     if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
     }else{
        //É nessa chave que terá todos os dados do usuário que precisa ser salvo
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
    
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "categoria criada com sucesso!")
            res.redirect("/admin/categorias")
            }).catch((err) => {
            req.flash("error_msg", "Houve erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
     }
})

router.get("/categorias/edit/:id", eAdmin, (req,res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categorias) => {
        res.render("admin/editcategorias", {categorias: categorias})
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/edit", eAdmin, (req,res) => {
    Categoria.findOne({_id: req.body.id}).lean().then((categorias)=>{

        //É nessa chave que terá todos os dados do usuário que precisa ser salvo
        categoria.nome=req.body.nome
        categoria.slug=req.body.slug

        categoria.save().then(() =>{
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) =>{ 
            req.flash("error_msg", "Houve um erro ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})

router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() =>{
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) =>{
        req.flash("error_msg","Houve um erro ao deletar categoria")
        res.redirect("/admin/categorias")
    })
})

router.get("/postagens", eAdmin, (req, res) =>{

    Postagem.find().populate("categoria").sort({data:"desc"}).lean().then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    }).catch((err) =>{
        req.flash("error_msg","Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })
})

router.get("/postagens/add", eAdmin, (req,res) =>{
    Categoria.find().lean().then((categorias) =>{
        res.render("admin/addPostagem",{categorias: categorias})
    }).catch((err) =>{
        req.flash("error_msg","Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", eAdmin,  (req,res) =>{
    var erros = []

    if(req.body.categoria ==""){
        erros.push({textp:"Categoria inválida, registre uma categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addPostagem", {erros: erros})
    }else{
        const novaPostagem ={
            titulo:req.body.titulo,
            descricao: req.body.descricao,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg","Postagem criada com sucesso!")       
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg","Houve um erro durante o salvamento da Postagem!")       
            res.redirect("/admin/postagens")
        })
    }
})


router.get("/postagens/edit/:id", eAdmin, (req,res) =>{
    //Id é o parametro
    //pesquisando para uma Postagem
    Postagem.findOne({_id: req.params.id}).lean().then((Postagem) =>{
        //pesquisando por uma categoria
        Categoria.find().lean().then((categorias) =>{
            //renderizando dados na view
            res.render("admin/editpostagens",{categorias: categorias, Postagem: Postagem})
        }).catch((err)=>{
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=> {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })

})

router.post("/postagem/edit", eAdmin, (req,res) =>{
    
    Postagem.findOne({_id:req.body.id}).then((Postagem) =>{

        Postagem.titulo = req.body.titulo
        Postagem.slug = req.body.slug
        Postagem.descricao = req.body.descricao
        Postagem.categoria = req.body.categoria

        Postagem.save().then(() =>{
            req.flash("success_msg","Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) =>{
            req.flash("error_msg","Erro interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err) =>{
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/deletar/:id", eAdmin, (req,res) =>{
    Postagem.deleteOne({_id: req.params.id}).then(()=>{
        req.flash("success_msg", "Postagem deletada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/admin/postagens")

    })

})

module.exports = router