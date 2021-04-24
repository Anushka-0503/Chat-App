const express = require('express');
const path = require('path')
const http = require('http')
const socketio = require('socket.io');
const { MongoClient } = require('mongodb');
const mongo = new MongoClient('mongodb://127.0.0.1:27017', { useUnifiedTopology: true });
const { formatMessage } = require('./utils/messages.js')
const { userJoin, getUser, userLeave, onlineUsers } = require('./utils/users.js');
const moment = require('moment');
const app = express();
app.use(express.json());
app.use(express.urlencoded());
const bcrypt = require('bcrypt');
const expressEjsLayouts = require('express-ejs-layouts');
// const initialisepassport=require('./passport-config');
// const passport = require('passport');
// initialisepassport(passport)
const users = [];
const server = http.createServer(app);
const io = socketio(server);

//app.set('view-engine', 'ejs')
//app.use(expressEjsLayouts);
app.set('views', path.join(__dirname, 'views')); 
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index.ejs')
})
app.get('/register', (req, res) => {
    res.render('register.ejs')
})
app.post('/register', async (req, res) => {
    try {
        //   console.log(req.body);
        const hashedpassword = await bcrypt.hash(req.body.password, 10)//10 is how secure we want it to be
        const confirmhashedpassword = await bcrypt.hash(req.body.password, 10)//10 is how secure we want it to be

        users.push({
            id: Date.now().toString(),

            name: req.body.username, email: req.body.email,
            password: hashedpassword,
            confirmpassword: confirmhashedpassword,
        })
        const { username, email, password, confirmpassword } = req.body;
        let errors = [];
        if (!username || !email || !password || !confirmpassword) {
            errors.push({ msg: 'Please fill in the required fields' });
            
        }
         if(password != confirmpassword){
     errors.push({msg: 'Passwords do not match'});
      }
            if (password.length < 6) {
                errors.push({ msg: 'Password must be atleast 6 characters' });
            }
        //   console.log(errors);
       //  console.log(errors.length);

if(errors.length > 0){
res.render('register',{
    errors,
    name: 'ANUSHKA',
    email,
    password,
    confirmpassword,
});
}
// else{
//     res.send('pass');
// }
        
        res.redirect('/')
    }
    catch {

        res.redirect('/register')
        // console.log('error');
    }
    //  const {name,email,password,confirmpassword}= req.body;
    //  let errors=[];
    //  //check required fields
    //  if(!name || !email || !password || !confirmpassword){
    //      errors.push({msg: 'Please fill in the required fields'});
    //  }
    //  //check if passwords match
    //  if(password != confirmpassword){
    //      errors.push({msg: 'Passwords do not match'});
    //  }
    console.log(users);


    //check passlength
    // if(password.length < 6){
    //     errors.push({msg: 'Password must be atleast 6 characters'});
    // }
    // if(errors.length >0){
    //     res.render('register',{
    // name,
    // email,
    // password,
    // confirmpassword
    //     });

    // }

    //console.log(req.body);
})
app.use(express.static(path.join(__dirname, 'public')))
const PORT = 3000
server.listen(PORT, () => console.log(`Server running on port:${PORT}`));

mongo.connect(function (err) {
    if (err) return console.log(err);
    console.log('Connected to MongoDB');
    const db = mongo.db('nmitchat');
    let chat = db.collection('chats');

    io.on('connection', socket => {
        // console.log('new connection');

        socket.on('joinChat', username => {
            const user = userJoin(socket.id, username);

            socket.broadcast.emit('serverMsg', formatMessage(`${user.username}`, ' has joined the chat'));

            io.emit('onlineUsers', onlineUsers());

            socket.on('disconnect', () => {
                const user = userLeave(socket.id);
                if (user) {
                    io.emit('serverMsg', formatMessage(`${user.username}`, ' has left the chat'));
                }
                // console.log('disconnect')
                io.emit('onlineUsers', onlineUsers());
            });
        })

        chat.find().limit(100).sort({ _id: 1 }).toArray((err, res) => {
            if (err) {
                throw err;
            }
            // console.log(res);
            socket.emit('message', res);
        })

        socket.on('typing', function (data) {
            socket.broadcast.emit('typing', data)
        })

        socket.on('input', data => {
            let name = data.name;
            let message = data.message;
            let time = moment().format('Do MMM [\at] h:mm a');
            data.time = time;
            // console.log(data);


            if (name == '' || message == '') {
                console.log("idk man");
            }
            else {
                chat.insertOne({ name: name, message: message, time: time }, function (err, r) {
                    io.emit('message', [data]);
                });
            }

        })
    })
})


