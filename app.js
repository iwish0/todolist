var express=require('express');
var exphbs=require('express-handlebars'); 
var logger=require('morgan');
var ent=require('ent'); 
var app=express();
var http= require('http').Server(app); 
var io=require('socket.io')(http);
var todolist=[];
var index;


app.engine('.hbs', exphbs({defaultLayout: 'main',extname: '.hbs'})); 
app.set('view engine', '.hbs');
app.use(express.static('public'))
.use(logger('combined'));


// 3 façon d'emettre un événement coté serveur
// socket.emit() => j'écoute
// socket.broadcast.emit() => Tous les utilisateur connectés écoutent hormis moi
// io.emit() => Tous les utilisateurs écoutes, moi inclu
io.on('connection',function(socket){
		
	socket.on('pseudo',function(pseudo,array){
		socket.pseudo=pseudo;
		socket.broadcast.emit('new_client',pseudo);
		console.log(todolist);
		console.log(todolist.length);
		if(todolist.length>0){
			socket.emit('giveTodolist',todolist);
		}
	});	
	socket.on('message',function(input){
		input=ent.encode(input);
		todolist.push(input);
		index=todolist.length-1
		// Emits an event to all connected clients.
		io.emit('newMessage',input,index);
		
	});
	socket.on('deleteTask',function(index){
		todolist.splice(index,1);
		io.emit('giveTodolist',todolist);
	});
	socket.on('disconnect',function(pseudo){
		socket.broadcast.emit('departure',socket.pseudo);
	});
});

app.get('/',function(req,res){
	res.render('todolist');
});


http.listen(8000,function(){
	console.log('Connexion ok avec le serveur HTTTP!');
});
