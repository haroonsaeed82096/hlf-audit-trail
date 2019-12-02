import * as path from 'path';
import Client = require('fabric-client');

import config from './config';
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';

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

    console.log('Creating a Channel object ..');
    let channel = client.newChannel(config.CHANNEL_NAME);

    console.log('Specifying the orderer to connect to ..');
    channel.addOrderer(orderer);

    console.log('Getting the peers ..');
    let peers = await getPeers(client, org);

    peers.map(p => channel.addPeer(p, client.getMspid()));

    console.log('Initializing the channel ..');
    await channel.initialize();

    console.log('Sending the Instantiate Proposal ..');
    let proposalResponse = await channel.sendInstantiateProposal({
      chaincodeId: config.CHAIN_CODE_ID,
      chaincodeVersion: 'v0',
      fcn: 'InitLedger',
//      args: ["ReportViewTest", "A000", "U000", "HaroonTest"],
      //args: ["a", "100", "b", "200"],
      txId: client.newTransactionID()
    });
    console.log('Instantiate Proposal sent successfully..');


      console.log('Sending the Transaction ..');
      let transactionResponse = await channel.sendTransaction(<Client.TransactionRequest>{
        proposalResponses: proposalResponse[0],
        proposal: proposalResponse[1]
      });
    console.log('Transaction sent....');

  } catch (e) {
    console.error(e);
    console.log('Error in sending Transaction ..');
  }
}
  export async function instantiateChaincodeOnPeers() {

    await instantiateChaincode(Organization.ORG1);
    await instantiateChaincode(Organization.ORG2);
}
