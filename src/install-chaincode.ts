import * as path from 'path';
import Client = require('fabric-client');
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';
import config from './config';
import Logger from "arthur-lib/lib/general/logging";
const logger = Logger("InstallChaincode");
let metadata_path = path.resolve(__dirname, '../dom_blockchain/cesonia-network/chaincode/activity/my_indexes');

async function ChaincodeOnPeers(org: Organization) {
  try {

    let client = await getClient(org);
    let orderer = await getOrderer(client);

    logger.info('Creating a Channel object ..');
    let channel = client.newChannel(config.CHANNEL_NAME);

    logger.info('Specifying the orderer to connect to ..');
    channel.addOrderer(orderer);

    logger.info('Getting the peers ..');
    let peers = await getPeers(client, org);

    logger.info('setting go path......');
    process.env.GOPATH = 'C:/go-work';
    //logger.info('meta data path is -----------------------'+metadata_path);
    logger.info('Installing chaincode ......');
    let proposalResponse = await client.installChaincode({
      targets: peers,
      chaincodeType: 'golang',
      chaincodeId: config.CHAIN_CODE_ID,
      chaincodePath: 'github.com/activity',
      chaincodeVersion: 'v0',
      metadataPath: metadata_path,
      //txId: client.newTransactionID(),
      //channelNames: config.CHANNEL_NAME

    });

  } catch (e) {
    logger.error(e);
  }
}
export async function installChaincodeOnPeers() {

  await ChaincodeOnPeers(Organization.ORG1);
  await ChaincodeOnPeers(Organization.ORG2);

}
