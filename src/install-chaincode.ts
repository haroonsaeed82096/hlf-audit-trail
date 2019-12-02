import * as path from 'path';
import Client = require('fabric-client');
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';
import config from './config';

let metadata_path = path.resolve(__dirname, '../dom_blockchain/cesonia-network/chaincode/activity/my_indexes');

async function ChaincodeOnPeers(org: Organization) {
  try {

    let client = await getClient(org);
    let orderer = await getOrderer(client);

    console.log('Creating a Channel object ..');
    let channel = client.newChannel(config.CHANNEL_NAME);

    console.log('Specifying the orderer to connect to ..');
    channel.addOrderer(orderer);

    console.log('Getting the peers ..');
    let peers = await getPeers(client, org);

    console.log('setting go path......');
    process.env.GOPATH = 'C:/go-work';
    //console.log('meta data path is -----------------------'+metadata_path);
    console.log('Installing chaincode ......');
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
    console.error(e);
  }
}
export async function installChaincodeOnPeers() {

  await ChaincodeOnPeers(Organization.ORG1);
  await ChaincodeOnPeers(Organization.ORG2);

}
