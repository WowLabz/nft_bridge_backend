import dotenv from 'dotenv';

import * as abiJson from './abi.json';
// import { abi } from '../config/abi.json';
// import abi from './abi.json';

// dotenv.config();

// const abiJsonFile = './abi.json';
// const contractJson = (fs.readFileSync('./abi.json')).toString();
// const abiJsonFileParsed = JSON.parse(contractJson);

dotenv.config();

export default {
    PORT: 8331,
    ETH_BRIDGE_CONTRACT_ADDRESS: '0x2A2bd5C235fdFC7081a55c9064A9545527DBf887',
    ETH_NFT_CONTRACT_ADDRESS: '0x71f07958a45965a38F0090E968b5230eD6caDfD7',
    ETH_NODE_ADDRESS: 'https://polygon-mumbai.g.alchemy.com/v2/5gvxdiPQMpVWvyYQ1CBjz7vllUuYAXtm',
    POLYGON_BRIDGE_CONTRACT_ADDRESS: '',
    POLYGON_NFT_CONTRACT_ADDRESS: '',
    POLYGON_NODE_ADDRESS: '',
    EVM_BRIDGE_CONTRACT_ABI: abiJson.bridgeAbi,
    EVM_NFT_BRIDGE_CONTRACT_ABI: abiJson.bridgeNftApi,
    EVM_ADDRESS: '0x04fF0EE4eD4D6b16f53e0ab81337101461d70F6D',
    EVM_PRIVATE_KEY: process.env.EVM_PRIVATE_KEY,
    SUBSTRATE_WSS: 'wss://social_li_n1.wowlabz.com/',
    POLKA_SEED: process.env.POLKA_SEED,
    COLLECTION_ID: 1,
    dbUri: "mongodb://nftbridge_admin:nftbridge_pwd@nftbridge-mongo/nftbridge-backend"
}
