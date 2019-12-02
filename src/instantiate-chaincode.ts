import * as path from 'path';
import Client = require('fabric-client');

import config from './config';
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';
import Logger from "arthur-lib/lib/general/logging";
const logger = Logger("Instantiate-cc");
let Org1MSP:string = 'Org1MSP';
let Org2MSP:string = 'Org2MSP';
var MSP_ID = {
  org1: Org1MSP,
  org2: Org2MSP
};

async function instantiateChaincode(org: Organization) {
  try {
    let client = await getClient(org);
    let orderer = await getOrderer(client);

    logger.info('Creating a Channel object ..');
    let channel = client.newChannel(config.CHANNEL_NAME);

    logger.info('Specifying the orderer to connect to ..');
    channel.addOrderer(orderer);

    logger.info('Getting the peers ..');
    let peers = await getPeers(client, org);

    peers.map(p => channel.addPeer(p, client.getMspid()));

    logger.info('Initializing the channel ..');
    await channel.initialize();

    logger.info('Sending the Instantiate Proposal ..');
    let proposalResponse = await channel.sendInstantiateProposal({
      chaincodeId: config.CHAIN_CODE_ID,
      chaincodeVersion: 'v0',
      fcn: 'InitLedger',
//      args: ["ReportViewTest", "A000", "U000", "HaroonTest"],
      //args: ["a", "100", "b", "200"],
      txId: client.newTransactionID()
    });
    logger.info('Instantiate Proposal sent successfully..');


      logger.info('Sending the Transaction ..');
      let transactionResponse = await channel.sendTransaction(<Client.TransactionRequest>{
        proposalResponses: proposalResponse[0],
        proposal: proposalResponse[1]
      });
    logger.info('Transaction sent....');

  } catch (e) {
    logger.error(e);
    logger.info('Error in sending Transaction ..');
  }
}
  export async function instantiateChaincodeOnPeers() {

    await instantiateChaincode(Organization.ORG1);
    await instantiateChaincode(Organization.ORG2);
}
