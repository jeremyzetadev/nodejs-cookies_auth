import express from 'express';
import cors from 'cors';
const app = express();
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import * as bodyParser from 'body-parser';

// always checked where origin or optionals outside origins
app.use(cors())

// [for-json]
// app.use(express.json());
// [for-formsubmit]
app.use(express.urlencoded({extended: true}));

const sessions ={};

app.get('/',(req,res)=>{
    res.redirect('/welcome');
});

app.get('/welcome', (req,res)=>{
    // __dirname is same as path.resolve()
    //res.sendFile(path.join(path.resolve(),"../client/welcome.html"));
    res.sendFile(path.resolve() + "\\client\\welcome.html")
});

app.get('/index', (req,res)=>{
    // __dirname is same as path.resolve()
    //const p = path.resolve(path.__dirname,"/../client/index.html");
    //const p = path.join(path.resolve(),"/../client/index.html");
    //need to find why path.join, __dirname and path.resolve is not working together
    //file is outside the src, use direct path by \\
    const p = path.resolve() + "\\client\\index.html"
    res.sendFile(p);
});

app.post('/login', (req,res)=>{
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