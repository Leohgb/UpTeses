module.exports = {
    eUser: function(req, res, next){
        //Se o usuario está autenticado ele passa
        if(req.isAuthenticated() && req.user.eUser != 1){
            return next()
        }else if(req.isAuthenticated() && req.user.eUser == 1){
            return next()
        }

        req.flash("error_msg", "Você precisa ser um Usuario!")
        res.redirect("/")
    }
}