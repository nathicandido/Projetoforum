
var http = require("http");
var express = require("express");
var ejs = require ("ejs");
var mongoose = require("mongoose");
var bodyparser = require("body-parser");
var session = require("express-session");

var app = express();
app.set("view engine", "ejs");
app.use(bodyparser());
app.use("/images",express.static("views/images"));
app.use(session({
    secret: 'segredo'
}));
mongoose.connect("mongodb://localhost/ForumDB");

//Esquema ------------------------------------------------------------------------

var schemaPost = new mongoose.Schema({
    Titulo: "String",
    Corpo: "String",
    Categoria: "String",
    Imagem: "String"
});

var modelPost = mongoose.model("Posts",schemaPost);

var schemaUsuario = new mongoose.Schema({
    Login: "String",
    Senha: "String",
    Nome: "String",
    email: "String"
});

var modelUsuario = mongoose.model("Usuarios", schemaUsuario);



//----------------------------------------------------------------------------------

var server = http.createServer(app);

app.get("/home", function(req, resp){
    resp.render("Home", {posts: []});
});
app.get("/contatos", function (req,resp ) {
    resp.render("contatos");
});

//---------------------------------------------
app.get("/cadastro", function(req,resp){
    resp.render("cadastro", {mensagem: ""});
});
app.get("/login", function(req,resp){
    resp.render("contatos", {mensagem: ""});
});
app.post("/cadastro", function(req,resp){

    var usuario = new modelUsuario({
        Login: req.body.Login,
        Senha: req.body.Senha,
        Nome: req.body.Nome,
        email: req.body.email
    });
    usuario.save(function(err, obj){
        if(err){
            console.log("Ferrou!");
        }else{
            console.log("Show!");
        }
    });
});
app.post("/login", function (req,resp) {
    modelUsuario.find({Login: req.body.Login, Senha: req.body.Senha}, function (err, obj) {
        if(obj.length == undefined) {
            req.session.logado = true;
            resp.redirect("/cadastro");
        } else {
            console.log("nao ok");
        }

    });
});
//----------------------------------------------

app.get("/novo", function(req, resp) {
    resp.render("NovoPost", {msg: ""});
});

app.post("/novo", function(req, resp){

    var novo = new modelPost({
        Titulo: req.body.Titulo,
        Corpo: req.body.Corpo,
        Categoria: req.body.Categoria
    });

    novo.save(function(err, obj){

        if(err){
            resp.render("NovoPost", {msg: "Problemas no Cadastro"});
        }else {
            resp.render("NovoPost", {msg: "Cadastro com Sucesso!"});
        }

    });
});

app.get("/contato", function(req, resp){
    resp.render("contatos");
});
server.listen(8080);
console.log('O Servidor está ONLINE!');