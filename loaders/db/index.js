import mongoose from "mongoose";
import { privateKey } from '../../config/privateKeys.js'

mongoose.connect(privateKey.DB_STRING_DEV,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)

const connection = mongoose.connection

connection.once('open', () => console.log('Database connection established'))
connection.on('error', () => console.log('Error'))

export { connection };

