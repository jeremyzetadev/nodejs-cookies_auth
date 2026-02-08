import express from 'express';
import cors from 'cors';
const app = express();
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import bcrypt from 'bcrypt'

// always checked where origin or optionals outside origins
app.use(cors())

// [for-json]
// app.use(express.json());
// [for-formsubmit]
app.use(express.urlencoded({extended: true}));

const sessions ={};
const users = [
    {
        name: "testuser",
        // pasword: "hashedPassword"
        password: "$2b$10$BahFKTp13qp/uobH.xWW9.3P/lbUMK3CpO656YdvMHz7sFF1x1jIW"
    }
];

app.get('/',(req,res)=>{
    res.redirect('/welcome');
});

app.get('/welcome', (req,res)=>{
    // __dirname is same as path.resolve()
    res.sendFile(path.join(path.resolve(),"../client/welcome.html"));
    // res.sendFile(path.resolve() + "\\client\\welcome.html")
});

app.get('/index', (req,res)=>{
    // __dirname is same as path.resolve()
    //const p = path.resolve(path.__dirname,"/../client/index.html");
    const p = path.join(path.resolve(),"/../client/index.html");
    //need to find why path.join, __dirname and path.resolve is not working together
    //file is outside the src, use direct path by \\
    // const p = path.resolve() + "\\client\\index.html"
    res.sendFile(p);
});

app.get('/users/welcome', (req,res)=>{
    // __dirname is same as path.resolve()
    res.sendFile(path.join(path.resolve(),"../client/index.html"));
    // res.sendFile(path.resolve() + "\\client\\welcome.html")
});

// add register to have user/pass data
app.post('/users/register', async (req,res)=>{
    //Authentication login can be move to middleware
    try{
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const user = {name: req.body.username, password: hashedPassword}
        users.push(user);
        // to login TODO:show success registered
        console.log("Successfully Registered");
        res.status(201).sendFile(path.join(path.resolve(),"../client/index.html"));
    } catch {
        res.status(500).send()
    }
});

// implement persisting login(via JWT/etc, no need to send cred everytime?)
app.post('/users/login', async(req,res) => {
    //Authentication verify can be move to middleware
    console.log(users);
    console.log(req.body.username);
    const user = users.find(user=>user.name==req.body.username);
    if(user==null)
        return res.status(400).send('Cannot find user');
    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            res.send('Successfully Login');
        }else{
            res.send('Not allowed');
        }
    } catch {
        res.status(500).send()
    }
})

// by using cookies
app.post('/login', async (req,res)=>{

    //[for-json]
    //const {username,password} = req.body; 
    //[for-formsubmit]
    const username = req.body.username;
    const password = req.body.password;
    if(username !== 'admin' || password !== 'admin')
        return res.status(401).send('Invalid username or password');

    console.log(uuidv4());
    const sessionId = uuidv4();
    sessions[sessionId] = {username, userId:1};
    res.set('Set-Cookie', `session=${sessionId}`);
    res.send('success');
});

app.post('/logout', (req,res)=>{
    const sessionId = req.headers.cookie?.split('=')[1];
    delete sessions[sessionId];
    res.set('Set-Cookie','session=; expires=Thus, 01 Jan 1970 00:00:00 GMT')
    res.send('success');
});

// have auth checked here
app.get('/todos',(req,res)=>{
    const sessionId = req.headers.cookie?.split('=')[1];
    const userSession = sessions[sessionId];
    if(!userSession)
        return res.status(401).send('Invalid session');

    const userId = userSession.userId;
    res.send([
        {
            id: 1,
            title: 'Learn Node',
            userId,
        }
    ]);
});

app.listen(3000, ()=>{
    console.log("Server is running on port 3000")
});
