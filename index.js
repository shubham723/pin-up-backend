import express from 'express';
import morgan from 'morgan';
import { router } from './routes/index.js';
import cors from 'cors';
import dotenv from 'dotenv';
import './loaders/index.js';
import { statusCodes } from './helpers/index.js';
import { Server } from 'socket.io';
import { Socket } from './services/socket/index.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// request logger   
app.use(morgan("dev"));

app.use('/uploads/', express.static('uploads/'));

app.get('/health', (req, res) => {
	const data = {
		message: 'Health API Running Succcessfully',
		code: statusCodes.SUCCESS
	}

	res.status(statusCodes.SUCCESS).send(data);
});

app.use('/v1/', router);

const server = app.listen(process.env.PORT, () => console.log(`Server running on port: ${process.env.PORT || 3000} `));

const io = new Server(server, {
	cors: {
		origin: '*'
	}
});
global.io = io;
Socket(io);
