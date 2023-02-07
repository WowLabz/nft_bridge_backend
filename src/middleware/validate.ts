import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

import logger from '../utils/logger';

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    try{
        schema.parse({
            body: req.body,
            params: req.params,
            query: req.query
        });
        next();
    }catch(error: any){
        logger.error(error);
        res.status(409).send(error.errors)
    }
};

export default validate;
