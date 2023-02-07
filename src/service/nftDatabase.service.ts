import NftModel, { NftDocument } from "../model/nft.model";
import logger from "../utils/logger";

export interface UpdateNftType {
    ethTokenId?: string,
    ethContractAddress?: string,
    polkaCollectionId?: string,
    polkaTokenId?: string,
    metadata?: string
}

export async function storeNftToDatabase(nft: NftDocument | UpdateNftType) {
    try{
        logger.info('store nft to database called with:',JSON.stringify(nft));
        const createdNft = await NftModel.create(nft);
        logger.info(`nft created in database: ${createdNft}`);
        return createdNft;
    }catch(error){
        logger.error(error);
    }
}

export async function getNftFromDatabase(uri: string): Promise<NftDocument | null> {
    try{
        logger.info('get nft from database called!')
        const nft = <NftDocument>await NftModel.findOne({metadata: uri});
        if(nft){
            return nft;
        }else{
            return null;
        }
    }catch(error){
        logger.error(error);
        return null;
    }
}

// export async function updateNftInDatabase(uri: string, nft: NftDocument) {
//     try{
//         logger.info('update nft in database called with: ',JSON.stringify(nft));
//         const updated = await NftModel.findOneAndUpdate({metadata: uri}, nft, { new: true });
//         logger.info('updated nft = ',JSON.stringify(updated));
//     }catch(error){
//         logger.error(error);
//     }
// }

export async function updateNftInDatabase(id: string, nft: UpdateNftType) {
    try{
        logger.info('update nft in the database called with id = ',id,' nft = ',JSON.stringify(nft));
        await NftModel.findByIdAndUpdate(id, nft);
        logger.info('updated the nft');
    }catch(error){
        logger.error('could not update the nft error: ',error);
    }
}
