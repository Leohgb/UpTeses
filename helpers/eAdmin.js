module.exports = {
    eAdmin: function(req, res, next){
        //Se o usuario está autenticado ele passa
        if(req.isAuthenticated() && req.user.eAdmin == 1){
            return next()
        }

        req.flash("error_msg", "Você precisa ser um Admin!")
        res.redirect("/")
    }
}