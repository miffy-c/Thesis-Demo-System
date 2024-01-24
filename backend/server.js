import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { InputError, AccessError } from './error.js';
import {
    register,
    login,
    save,
    getSPList,
    getSPInfo,
    addReview,
    addKey,
    blindToken,
    unblindToken,
    createRepVC,
    createtokenVC,
    createKeyVC,
} from './service.js'

const app = express();
app.use(express.urlencoded({ extended: true, }));
app.use(express.json({ limit: '50mb', }));

const httpserver = createServer(app); 
app.use(cors());
const socketIO = new Server(httpserver, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:3001"]
    }
});

socketIO.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
    
    socket.on('transaction', (data) => {
        var temp = blindToken(data);
        socket.broadcast.emit("transactionBlinded", temp.blinded);
        socket.emit("transactionToken", temp.token);
      });

    socket.on('token', async (data) => {
        socket.broadcast.emit("unblindedToken", await unblindToken(data.email, data.token));
      });

    socket.on('disconnect', () => {
      console.log('*: A user disconnected');
    });
});

const catchErrors = fn => async (req, res) => {
    try {
      await fn(req, res);
      save();
    } catch (err) {
      if (err instanceof InputError) {
        res.status(400).send({ error: err.message, });
      } else if (err instanceof AccessError) {
        res.status(403).send({ error: err.message, });
      } else {
        console.log(err);
        res.status(500).send({ error: 'A system error ocurred', });
      }
    }
  };


app.post('/auth/login', catchErrors(async (req, res) => {
    const { email, password, } = req.body;
    return res.json(await login(email, password));
}));

app.post('/auth/register', catchErrors(async (req, res) => {
    const { email, password, name, type } = req.body;
    return res.json(await register(email, password, name, type));
}));

app.get('/sp/list', catchErrors(async (req, res) => {
    return res.json(await getSPList());
}));

app.get('/sp/info/:email', catchErrors(async (req, res) => {
    const { email } = req.params;
    return res.json(await getSPInfo(email));
}));

app.post('/user/review', catchErrors(async (req, res) => {
    const { text, token, rating, email, key } = req.body;
    return res.json(await addReview(email, text, rating, token, key));
}));

app.post('/sp/key', catchErrors(async (req, res) => {
    const { email, key } = req.body;
    return res.json(await addKey(email, key));
}));

app.post('/sp/repVC', catchErrors(async (req, res) => {
    const { email } = req.body;
    return res.json(await createRepVC(email));
}));

app.post('/user/tokenVC', catchErrors(async (req, res) => {
    const { email, token } = req.body;
    return res.json(await createtokenVC(email, token));
}));

app.post('/user/keyVC', catchErrors(async (req, res) => {
  const { email, key } = req.body;
  return res.json(await createKeyVC(email, key));
}));


// Run server
app.get('/', (req, res) => res.redirect('/docs'));

const configData = JSON.parse(fs.readFileSync('../frontend/my-app/src/config.json'));
const port = 'BACKEND_PORT' in configData ? configData.BACKEND_PORT : 5000;

httpserver.listen(port, () => {
  console.log(`Backend is now listening on port ${port}!`);
  console.log(`For API docs, navigate to http://localhost:${port}`);
});

export default httpserver;
