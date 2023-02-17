import { Request, Response } from 'express';
import { EthToPolkaInput } from '../schema/ethToPolkaSchema';
import { getTokenName, getTokenUri, transferNftBack, transferNftToSelf, getCurentNftOwner } from '../service/ethereum';
import { mintNft, transferNft } from '../service/polkadot';
import logger from '../utils/logger';
import config from 'config';
import { getNftFromDatabase, storeNftToDatabase, updateNftInDatabase, UpdateNftType } from '../service/nftDatabase.service';
import { NftDocument } from '../model/nft.model';



export async function ethToPolkaHander(req: Request<{}, {}, EthToPolkaInput['body']>, res: Response) {
    try{
        const { contractAddress, tokenId, receiver, owner } = req.body;
        logger.info(`eth to polka handler called with contract address: ${contractAddress}, tokenId: $(tokenId), receiver: ${receiver}`);
        const currentOwner = await getCurentNftOwner(contractAddress, tokenId);
        const success = await transferNftToSelf(contractAddress, tokenId);
        const onFailHandler = async () => {
            await transferNftBack(contractAddress, tokenId, currentOwner);
            return res.status(409).send();
        }
    
        if(success){
            const tokenUri = await getTokenUri(contractAddress, tokenId);
            const nftInDatabase = await getNftFromDatabase(tokenUri);
            logger.info('trying to find nft in database result = ',JSON.stringify(nftInDatabase));
            if(nftInDatabase){
                logger.info('nft found in data base!!');
                if(nftInDatabase.polkaCollectionId && nftInDatabase.polkaTokenId){
                    // transfer to the user
                    logger.info('nft in database has polka collection id as well as polka token id');
                    const onSuccessHandler = async () => {
                        if(!nftInDatabase.ethContractAddress || !nftInDatabase.ethTokenId){
                            logger.info('nft in database does not have eth contract address or eth token id');
                            const updateNft: UpdateNftType = {
                                ethContractAddress: contractAddress,
                                ethTokenId: tokenId
                            };
                            logger.info('created updated version of token in database = ',JSON.stringify(updateNft));
                            logger.info('updating nft in database');
                            // updateNftInDatabase(tokenUri, <NftDocument>updateNft);
                            await updateNftInDatabase(nftInDatabase._id, updateNft);
                        }
                        return res.sendStatus(200);
                    }
                    logger.info('transferring nft');
                    await transferNft(nftInDatabase.polkaCollectionId, nftInDatabase.polkaTokenId, receiver, onFailHandler, onSuccessHandler);
                }else{
                    logger.info('nft in database does not have polka collection id or polka token id');
                    const onSuccessHandler = () => {
                        return res.sendStatus(200);
                    }
                    logger.info('minting nft in polkadot');
                    await mintNft(tokenUri, receiver, onFailHandler, onSuccessHandler);
                }
            }else{
                logger.info('nft not found in database');
                const nftForDatabase = {
                    metadata: tokenUri,
                    ethTokenId: tokenId,
                    ethContractAddress: contractAddress,
                    polkaCollectionId: null,
                    polkaTokenId: null
                }
                logger.info('created nft for database = ',JSON.stringify(nftForDatabase));
                const onSuccessHandler = async () => {
                    logger.info('storing nft on the database');
                    await storeNftToDatabase(<NftDocument>nftForDatabase);
                    return res.sendStatus(200);
                }
                logger.info('minting nft in polkadot');
                await mintNft(tokenUri, receiver, onFailHandler, onSuccessHandler);
            }
        }
    }catch(error){
        logger.error(error);
    }
}


export async function ethToPolkaAfterTransferHandler(req: Request<{}, {}, EthToPolkaInput['body']>, res: Response ){
    try{
        logger.info("trying ethToPolka after transfer");
        const contractAddress = req.body.contractAddress;
        const tokenId = req.body.tokenId;
        const owner = req.body.owner;
        logger.info("Fetching current owner of nft");
        const currentOwner = await getCurentNftOwner(contractAddress, tokenId);
        logger.info(`Current Owner Fetch Successful: ${currentOwner}`);
        const ourAddress = config.get<string>("EVM_ADDRESS");
        if(ourAddress === currentOwner){
            logger.info("Trying to fetch token name");
            const tokenName = await getTokenName(contractAddress);
            logger.info(`Token name fetch success: ${tokenName}`);
            const tokenUri = await getTokenUri(contractAddress, tokenId);
            logger.info(`Trying to mint nft in polkadot`);
            logger.info("We are the owner of the token....minting......");
            const onFail = () => {
                transferNftBack(contractAddress, tokenId, owner); // change this owner later
                res.status(409).send();
            }
            const onSuccessHandler = () => {
                res.sendStatus(200);
            }
            await mintNft(tokenName, tokenUri, owner, onFail, onSuccessHandler);
            res.status(200).send();
        }else{
            res.status(401).send();
        }
    }catch(error: any){
        logger.error(error);
        return res.status(409).send(error.errors);
    }
}
