import {Express, Request, Response } from 'express';

import logger from './utils/logger';
import validate from './middleware/validate';
import { ethToPolkaSchema } from './schema/ethToPolkaSchema';
import { ethToPolkaAfterTransferHandler, ethToPolkaHander } from './controller/ethToPolka.controller';
import { polkaToEthSchema } from './schema/polkaToEthSchema';
import { polkaToEthHandler } from './controller/polkaToEthController';

const routes = (app: Express) => {
    app.get('/', (req: Request, res: Response) => {
        logger.info("/ called!");
        res.sendStatus(200);
    });

    app.post('/ethereum-to-polkadot', validate(ethToPolkaSchema), ethToPolkaHander );
    app.post('/ethereum-to-polkadot-after-transfer', validate(ethToPolkaSchema), ethToPolkaAfterTransferHandler);

    app.post('/polkadot-to-ethereum', validate(polkaToEthSchema), polkaToEthHandler);
}

export default routes;
