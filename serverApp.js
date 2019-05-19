var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var fileUpload = require('express-fileupload');
var app = express();
var session = require('express-session');

app.set("view engine", "ejs");
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/upload'));
app.use('/img_produtos', express.static('upload'));
app.use(express.static(__dirname + '/public/images'));
app.use(bodyParser());
app.use(fileUpload());
app.use(express.static("imagens"));
app.use(session({
    secret: 'caverna'
}));


/*Servidor: */
var servidor = http.createServer(app);
servidor.listen(8080);
/* Caminho para iniciar banco: C:\Program Files\MongoDB\Server\3.2\bin */
mongoose.connect("mongodb://localhost/MeuBanco");
/* Usuário abaixo: */
var usuarioSchema = new mongoose.Schema({
    login: 'String',
    senha: 'String'
});
var usuarioModel = mongoose.model('Usuario', usuarioSchema);
usuarioModel.remove({login: "admin", senha: "admin"});

var a = new usuarioModel({
    login: "admin",
    senha: "admin"
});

/* Produto abaixo: */
var produtoSchema = new mongoose.Schema({
    nome: 'String',
    preco: 'String',
    nome_imagem: 'String'
});
var produtoModel = mongoose.model('Produto', produtoSchema);
/* Routes */
app.get("/", function(req,resp){
    var produtos = produtoModel.find(function(err,obj){
        resp.render("index", {produtos: obj});
    });
});
app.get("/login", function(req,resp){
    resp.render("login") ;
});
app.get("/about", function(req,resp){
    resp.render("About") ;
});
app.get("/contact", function(req,resp){
    resp.render("Contato") ;
});
app.get("/adminControl", function (req,resp) {
        var usuarios = usuarioModel.find(function(err,obj){
        resp.render("adminControl", {usuarios: obj});
    });
});
app.get("/cadastra", function(req, resp){
    resp.render("cadastrar");
});
app.get("/acessoCadastro", function(req, resp){
    if(req.session.logado == true) {
        resp.render("acessoCadastro");
    }
    else{
        resp.render("login");
    }
});
app.post("/cadastra", function(req,resp){
    var usuario = new usuarioModel({
        login: req.body.login,
        senha: req.body.senha
    });

    usuarioModel.findOne({login: usuario.login}, function (err, obj) {
        if(obj==null) {
            usuario.save(function (err, obj) {
                if (err) {
                    resp.render("respCadastro", {mensagem: "Erro no cadastro! Tente novamente e cheque seus dados!"})
                } else {
                    resp.render("respCadastro", {mensagem: "Cadastrado com sucesso! Boas compras!"})
                }
            });
        }else{
            resp.render("respCadastro", {mensagem: "Erro no cadastro! Esse login já existe!"})
        }
    });

});
app.post("/login", function(req,resp){
    var usuario = new usuarioModel({
        login: req.body.login,
        senha: req.body.senha
    });

    usuarioModel.findOne({login: usuario.login, senha: usuario.senha}, function (err, obj) {
        if(obj==null) {

            if (err) {
                resp.render("respCadastro", {mensagem: "Tente novamente e cheque seus dados!"})
            } else {
                resp.render("respCadastro", {mensagem: "Erro, login não efetuado!"})
            }
        }
        
        
            
        else{
            req.session.logado = true;
            
            
            resp.render("acessoCadastro", {mensagem: "Login efetuado com sucesso, aproveite e boas compras!"})
        }
    });

});
app.post("/nomeProduto", function (req, resp) {
    var produto = new produtoModel({
        nome: req.body.nome,
        preco: req.body.preco,
        nome_imagem: req.files.arquivo.name
    });


    var arq = req.files.arquivo;
    arq.mv('upload/'+req.files.arquivo.name, function(){
        console.log("Upload feito!");
    });


    produtoModel.findOne({nome: produto.nome, preco: produto.preco}, function (err, obj) {
        if(obj==null) {
            produto.save(function (err, obj) {
                if (err) {
                    resp.render("respCadastro", {mensagem: "Erro no cadastro do produto!"})
                } else {
                    resp.render("respCadastro", {mensagem: "Cadastrado com sucesso! Boas vendas!"})
                }
            });
        }else{
            resp.render("respCadastro", {mensagem: "Erro no cadastro! Esse produto já existe!"})
        }
    });

});
