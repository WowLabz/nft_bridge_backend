import config from 'config';
import mongoose from 'mongoose';
import logger from './logger';


export default async function connect() {
    try{
        const dbUri = config.get<string>('dbUri');
        mongoose.set('strictQuery', false);
        await mongoose.connect(dbUri);
        logger.info("Database Connected!")
    }catch(error){
        logger.error(error);
    }
}
