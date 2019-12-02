
import Client = require('fabric-client');
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';
import Logger from "arthur-lib/lib/general/logging";
const logger = Logger("JoinChannel");
//import { Organization, getClient, getOrderer, getPeers } from './client';

import config from './config';



 async function joinOrgPeersToChannel(org: Organization) {
   try {

     let client = await getClient(org);
     let orderer = await getOrderer(client);

     logger.info('Creating a Channel object ..');
     let channel = client.newChannel(config.CHANNEL_NAME);

     logger.info('Specifying the orderer to connect to ..');
     channel.addOrderer(orderer);

     logger.info('Getting the genesis block for the channel ..');
     let genesis_block = await channel.getGenesisBlock({
       txId: client.newTransactionID()
     });

     logger.info('Getting the peers ..');
     let peers = await getPeers(client, org);

     let proposalResponse = await channel.joinChannel({
       txId: client.newTransactionID(),
       block: genesis_block,
       targets: peers
     });
   } catch (e) {
     logger.error(e);
   }
 }
   export async function JoinChannel() {

     await joinOrgPeersToChannel(Organization.ORG1);
     await joinOrgPeersToChannel(Organization.ORG2);

   }
