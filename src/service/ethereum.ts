import Web3 from 'web3';
import Provider from '@truffle/hdwallet-provider';
import { AbiItem } from 'web3-utils';
import config from 'config';
import logger from '../utils/logger';

const ethereumProvider = config.get<string>("ETH_NODE_ADDRESS");
const privateKey = config.get<string>("EVM_PRIVATE_KEY");
const bridgeAbi = config.get<AbiItem>("EVM_BRIDGE_CONTRACT_ABI");
const bridgeNftAbi = config.get<AbiItem>("EVM_NFT_BRIDGE_CONTRACT_ABI");
// const provider = new Provider(privateKey, ethereumProvider);
// const web3 = new Web3(ethereumProvider);
// const web3 = new Web3(<any>provider);
const ethBridgeContractAddress = config.get<string>("ETH_BRIDGE_CONTRACT_ADDRESS");
const ethNftContractAddress = config.get<string>("ETH_NFT_CONTRACT_ADDRESS");


export async function transferNftToSelf(contractAddress: string, tokenId: number | string): Promise<boolean> {
    logger.info("transfer nft to self called! with values contractAddress: ",contractAddress," and token id : ",tokenId);
     console.log("transfer nft to self called! with values contractAddress: ",contractAddress," and token id : ",tokenId);
    const provider = new Provider(privateKey,ethereumProvider);
    const web3 = new Web3(<any>provider);
    const address = config.get<string>("EVM_ADDRESS");
    // const privateKey = config.get<string>("EVM_PRIVATE_KEY");
    const contract = new web3.eth.Contract(bridgeAbi, ethBridgeContractAddress);
    // const tx = contract.methods.transferSelf(contractAddress,tokenId);
    // const gas = await tx.estimateGas({
    //     from: address,
    // });
    // const gas = await tx.estimateGas({from: address});
    // const gas = 1000000;
    // const gasPrice = await web3.eth.getGasPrice();
    // const data = tx.encodeABI();
    // const nonce = await web3.eth.getTransactionCount(address);
    // const signedTx = await web3.eth.accounts.signTransaction({
    //     to: contractAddress,
    //     data,
    //     gas,
    //     gasPrice,
    //     nonce
    // }, privateKey);
    // const signedTx = await web3.eth.accounts.signTransaction({
    //     data,
    //     gas
    // }, privateKey);
    // const rawTransaction: string = signedTx.rawTransaction ? signedTx.rawTransaction : "";
    // logger.info(`raw transaction: ${rawTransaction}`);
    // await web3.eth.sendSignedTransaction(rawTransaction);
    // logger.info(result);
    // check if we are the owner of the nft
    try{
        const result = await contract.methods.transferSelf(contractAddress, tokenId).send({from: address});
        const transferSuccess = await contract.methods.checkOurOwnership(contractAddress, tokenId);
        return transferSuccess;
    }catch(error){
        logger.error("failed to transfer the nft");
        logger.error('error: ',error);
        console.log('error : ',error);
        return false;
    }

}

export async function transferNftBack(contractAddress: string, tokenId: number | string, owner: string): Promise<boolean> {
    const provider = new Provider(privateKey, ethereumProvider);
    const web3 = new Web3(<any>provider);
    const address = config.get<string>("EVM_ADDRESS");
    const contract = new web3.eth.Contract(bridgeNftAbi, ethNftContractAddress);

    try{
        const result = await contract.methods.transferBack(contractAddress, tokenId, owner).send({from: address});
        return true;
    }catch(error){
        return false;
    }
    // const tx = contract.methods.transferBack(contractAddress,tokenId, owner);
    // const gas = await tx.estimateGas({from: address});
    // const gasPrice = await web3.eth.getGasPrice();
    // const data = tx.encodeABI();
    // const nonce = await web3.eth.getTransactionCount(address);
    // const signedTx = await web3.eth.accounts.signTransaction({
    //     to: contractAddress,
    //     data,
    //     gas,
    //     gasPrice,
    //     nonce
    // }, privateKey);
    // const rawTransaction: string = signedTx.rawTransaction ? signedTx.rawTransaction : "";
    // const result = await web3.eth.sendSignedTransaction(rawTransaction);
    // logger.info(result);
}

export async function getTokenName(contractAddress: string): Promise<string> {
    const web3 = new Web3(ethereumProvider);
    const address = config.get<string>("EVM_ADDRESS");
    const contract = new web3.eth.Contract(bridgeAbi, ethBridgeContractAddress);
    const result = await contract.methods.getName(contractAddress).call();
    return typeof result === "string" ? result : "";
}

export async function getTokenUri(contractAddress: string, tokenId: number | string): Promise<string> {
    const web3 = new Web3(ethereumProvider);
    const contract = new web3.eth.Contract(bridgeAbi, ethBridgeContractAddress);
    const result = await contract.methods.getUri(contractAddress,tokenId).call();
    return typeof result === "string" ? result : "";
}

export async function getCurentNftOwner(contractAddress: string, tokenId: string | number): Promise<string> {
    logger.info(`get current nft owner called with token id: ${tokenId}`)
    const web3 = new Web3(ethereumProvider);
    const contract = new web3.eth.Contract(bridgeAbi, ethBridgeContractAddress);
    const result = await contract.methods.getOwner(contractAddress, tokenId).call();
    return result;
}

export async function mintNft(owner: string, uri: string): Promise<boolean> {
    const provider = new Provider(privateKey, ethereumProvider);
    const web3 = new Web3(<any>provider);
    const address = config.get<string>("EVM_ADDRESS");
    const contract = new web3.eth.Contract(bridgeNftAbi, ethNftContractAddress);
    try{
        const result = await contract.methods.safeMint(owner, uri).send({from: address });
        return true;
    }catch(error){
        logger.error(error);
        return false;
    }

}
