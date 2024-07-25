// Carregando modulos
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const morgan = require("morgan");
const app = express();
const admin = require("./routes/admin");
const path = require("path");
const mongoose = require("mongoose");
const session = require("express-session");
const MemoryStore = require('memorystore')(session);
const flash = require("connect-flash");
require("./models/Postagem");
const Postagem = mongoose.model("postagens");
require("./models/Categorias");
const Categoria = mongoose.model("categorias");
const usuarios = require("./routes/usuario");
const passport = require("passport");
const { eUser } = require("./helpers/eUser");
var url = require('url');

require("./config/auth")(passport)

app.use(express.json());
//express lidar com requisições no padrão urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// Configurações
app.use(session({
    cookie: { maxAge: 86400000 },
    store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
    }),
    secret: "upTeses",
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

app.use(flash())
//Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    //variavel vai armazenar dos dados do usuario autenticado
    res.locals.user = req.user || null;
    next()
})
//Body Parser 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//handlebars
app.engine('handlebars', handlebars.engine({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
//Mongoose 
const database = module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
    try {
        //Conetar ao mongodb atlas 
        mongoose.connect(`${process.env.MONGODB_URI}`).then(() => {
            console.log("Conectado ao mongo")
        }).catch((err) => {

            console.log("Erro ao se conectar: " + err)
        }
        )
    } catch (err) {
        console.log("Erro ao se conectar: " + err)

    }
}

database();

//Public

//criando um helper para limitar o numero de postagens
//na pagina principal
app.use(express.static(path.join(__dirname, "/public")))
var hbs = handlebars.create({
    helpers: {
        limit: function (arr, limit) {
            if (!Array.isArray(arr)) { return []; }
            return arr.slice(0, limit);
        }
    }
});
app.engine('handlebars', hbs.engine);


//caminho absoluto para a pasta public

//Rotas
app.get('/', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })

})

app.get("/Postagem/:slug", (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((Postagem) => {
        if (Postagem) {
            res.render("Postagem/index", { Postagem: Postagem })
        } else {
            req.flash("error_msg", "Essa Postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
    })
})

app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

/*Postagens*/
app.get("/addpostagem", eUser, (req, res) => {

    Categoria.find().lean().then((categorias) => {
        res.render("usuarios/addpostagem", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/")
    })
})

app.get("/Postagens", (req, res) => {

    Postagem.find().populate("categoria").sort({ data: "desc" }).lean().then((postagens) => {
        res.render("postagens/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/")
    })
})

app.get('/Postagens/resultados', (req, res) => {
    //sistema de busca por texto
    const query = req.query.pesquisa;

    const cursor = Postagem.find({ titulo: { $regex: query, $options: 'i' } }).lean().sort({ data: "desc" }).then((postagens) => {
        res.render("postagens/resultados", { postagens: postagens })
    });
})
/*fim postagens*/

app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar as categorias")
        res.redirect("/")
    })
})


app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {

            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {

                res.render("categorias/postagens", { postagens: postagens, categoria: categoria })
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao lisstar os posts!")
                res.redirect("/")
            })

        } else {
            req.flash("error_msg", "Esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página")
        res.redirect("/")
    })
})

/*Postagem*/

/*fim de Postagem*/
app.use('/usuarios', usuarios)
app.use('/admin', admin)
//Outros
const PORT = process.env.PORT || 8081
app.listen(PORT, () => {
    console.log("Servidor rodando! ")
})