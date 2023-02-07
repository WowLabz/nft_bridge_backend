import { Request, Response } from 'express';
import { NftDocument } from '../model/nft.model';
import { PolkaToEthInput } from '../schema/polkaToEthSchema';
import { mintNft, transferNftBack } from '../service/ethereum';
import { getNftFromDatabase, storeNftToDatabase, updateNftInDatabase, UpdateNftType } from '../service/nftDatabase.service';
import { getToken, getOurAccountId } from '../service/polkadot';
import logger from "../utils/logger";


export async function polkaToEthHandler(req: Request<{}, {}, PolkaToEthInput['body']>, res: Response) {
    try{
        const { owner, collectionId, tokenId } = req.body;
        const tokenDetails = await getToken(collectionId, tokenId);
        const ourAccount = getOurAccountId();
        if(tokenDetails.owner.AccountId === ourAccount) {
            logger.info('getting nft from database');
            const nftInDatabase = await getNftFromDatabase(tokenDetails.metadata);
            logger.info('got nft from database: ',JSON.stringify(nftInDatabase));
            if(nftInDatabase){
                logger.info('nft found in database');
                if(nftInDatabase.ethContractAddress && nftInDatabase.ethTokenId) {
                    // transfer
                    logger.info('database nft has eth contract address as well as eth token id');
                    logger.info('transferring nft back.....');
                    await transferNftBack(nftInDatabase.ethContractAddress, nftInDatabase.ethTokenId, owner);
                    logger.info('nft transffered back!');
                    if(!nftInDatabase.polkaTokenId || !nftInDatabase.polkaCollectionId){
                        logger.info('database nft does not have polka token id or polka collection id');
                        const updateNft: UpdateNftType = {
                            polkaCollectionId: collectionId,
                            polkaTokenId: tokenId
                        };
                        await updateNftInDatabase(nftInDatabase._id, updateNft);
                    }
                    res.sendStatus(200);
                }else{
                    logger.info('database nft does not have eth contract address or eth token id');
                    logger.info('minting nft in eth');
                    await mintNft(owner, tokenDetails.metadata);
                    logger.info('minted nft in eth');
                    if(!nftInDatabase.polkaTokenId || !nftInDatabase.polkaCollectionId){
                        logger.info('database nft does not have polka token id or polka collection id');
                        const updateNft: UpdateNftType = {
                            polkaCollectionId: collectionId,
                            polkaTokenId: tokenId
                        };
                        await updateNftInDatabase(nftInDatabase._id, updateNft);
                    }
                    res.sendStatus(200);
                }
            }else{
                logger.info('nft not found in the database');
                const nftForDatabase = {
                    metadata: tokenDetails.metadata,
                    polkaCollectionId: collectionId,
                    polkaTokenId: tokenId,
                    ethTokenId: null,
                    ethContractAddress: null
                };
                logger.info('created nft for the database: ',JSON.stringify(nftForDatabase));
                logger.info('minting nft.....');
                await mintNft(owner, tokenDetails.metadata);
                logger.info('storing nft to database.....');
                await storeNftToDatabase(<NftDocument>nftForDatabase);
                res.sendStatus(200);
            }
        }
    }catch(error){
        return res.status(409).send();
    }
}

