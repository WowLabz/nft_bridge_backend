import express from 'express';
import config from 'config';
import cors from 'cors';

import logger from './utils/logger';
import routes from './routes';
import connect from './utils/connect';


const app = express();

app.use(express.json());
app.use(cors());

const PORT = config.get<number>('PORT');

app.listen(PORT, async () => {
    logger.info(`Server started at port ${PORT}`);
    await connect();
    routes(app);
})
