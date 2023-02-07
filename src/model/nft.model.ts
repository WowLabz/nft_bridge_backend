import mongoose from 'mongoose';

export interface NftDocument extends mongoose.Document {
    metadata: string,
    ethTokenId: string | null,
    ethContractAddress: string | null,
    polkaCollectionId: string | null,
    polkaTokenId: string | null
}

const nftSchema = new mongoose.Schema({
    metadata: {
        type: String,
        required: true,
        unique: true
    },
    ethTokenId: {
        type: String,
    },
    ethContractAddress: {
        type: String
    },
    polkaCollectionId: {
        type: String
    },
    polkaTokenId: {
        type: String
    }
});

const NftModel = mongoose.model('NFT', nftSchema);

export default NftModel;
