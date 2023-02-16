import { WsProvider, ApiPromise, Keyring } from '@polkadot/api';
import { KeyringPair } from '@polkadot/keyring/types'
import { ExtrinsicStatus, EventRecord } from '@polkadot/types/interfaces';
import { SubmittableExtrinsic } from '@polkadot/api-base/types';
import { ApiTypes } from '@polkadot/api/types';

import config from 'config';
import logger from '../utils/logger';

const SEED = config.get<string>("POLKA_SEED");
const ADDRESS = config.get<string>("SUBSTRATE_WSS");
const COLLECTION_ID = config.get<number>("COLLECTION_ID");

interface Owner{
    AccountId: string
}
interface PolkadotNft{
    owner: Owner,
    nftName: string,
    description: string,
    metadata: string
}

export async function mintNft(name: string, metadata: string, owner: string, onFail: Function, onSuccess: Function){
    try{
        const wsProvider = new WsProvider(ADDRESS);
        const api = await ApiPromise.create({provider: wsProvider});
        const keyring = new Keyring({type: 'sr25519'});

        // wait till api is ready
        await api.isReady;
        const keyPair = keyring.addFromUri(SEED);

        const transaction = api.tx.metahomeNft.mintNft(owner, COLLECTION_ID, null, null, metadata, true, name, "Transferred from ethereum");
        await handleSignedTransaction(transaction, keyPair, onFail, onSuccess);
    }catch(error){
        logger.info('Failed to mint nft due to error: ',error);
        onFail();
    }
}

export async function transferNft(collectionId: string|number, tokenId: string|number, owner: string, onFail: Function, onSuccess: Function) {
    try{
        const wsProvider = new WsProvider(ADDRESS);
        const api = await ApiPromise.create({provider: wsProvider});
        const keyring = new Keyring({type: 'sr25519'});

        await api.isReady;
        const keyPair = keyring.addFromUri(SEED);

        const newOwner = {
            AccountId: owner
        };
        const transaction = api.tx.metahomeNft.send(collectionId, tokenId, newOwner);
        await handleSignedTransaction(transaction, keyPair, onFail, onSuccess);
    }catch(error){
        logger.error('failed to transfer nft due to error:',error);
        onFail();
    }
}

export async function getNextTokenId(): Promise<string|number> {
    const wsProvider = new WsProvider(ADDRESS);
    const api = await ApiPromise.create({provider: wsProvider});

    await api.isReady;

    const tokenIdHex = await api.query.metahomeNft.nextNftId(COLLECTION_ID);
    logger.info('next token id in polkadot = ',tokenIdHex);
    const tokenIdHuman = <string|number>tokenIdHex.toHuman();
    return tokenIdHuman;
}

export async function getToken(collectionId: number | string, tokenId: number | string) : Promise<PolkadotNft> {
    const wsProvider = new WsProvider(ADDRESS);
    const api = await ApiPromise.create({provider: wsProvider});
    await api.isReady;
    const tokenReceived = await api.query.metahomeNft.nfts(collectionId, tokenId);
    logger.info(`Token received: ${tokenReceived}`);
    const tokenHuman = <any>tokenReceived.toHuman();
    const owner = tokenHuman.owner;
    logger.info(`owner: ${JSON.stringify(owner)}`);
    const token = <PolkadotNft>tokenHuman;
    logger.info(token.owner.AccountId);
    return token;
}


export function getOurAccountId(): string {
    const keyring = new Keyring({type: 'sr25519'});
    const keypair = keyring.addFromUri(SEED);
    const address = keypair.address;
    return address;
}

const handleSignedTransaction = async (transaction: SubmittableExtrinsic<ApiTypes>, keyPair: KeyringPair, onFail: Function, onSuccess: Function) => {
  try {
    await transaction.signAndSend(keyPair,({ events = [], status }) => {
        transactionEventHandler(events, status, onFail, onSuccess);
    });
  } catch (error) {
      logger.error(error);
      onFail();
  }
};

const transactionEventHandler = (events: EventRecord[], status: ExtrinsicStatus, onFail: Function, onSuccess: Function) => {
    logger.info("Transaction event handler called!");
    if(status.isInBlock){
        events.forEach(({event: {data, method, section }, phase}) => {
            if(method === 'ExtrinsicFailed'){
                onFail();
            }else if(method === 'ExtrinsicSuccess'){
                logger.info("Extrinsic Success!");
                onSuccess();
            }
        })
    }else if(status.isFinalized){
        logger.info("Extrinsic Finalized!");
    }
}
