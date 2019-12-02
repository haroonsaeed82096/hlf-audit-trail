import * as path from 'path';
import Client = require('fabric-client');

import config from './config';
import { Organization, getClient, getOrderer, getPeers } from './BlockchainClient';
import {Channel} from "fabric-client";

import Logger from "arthur-lib/lib/general/logging";
const logger = Logger("query-chaincode");

async function getChannel(client: Client, org: Organization): Promise<Channel> {
  let orderer = await getOrderer(client);

  logger.info('Creating a Channel object ..');
  let channel = client.newChannel(config.CHANNEL_NAME);

  logger.info('Specifying the orderer to connect to ..');
  channel.addOrderer(orderer);

  logger.info('Getting the peers ..');
  let peers = await getPeers(client, org);

  peers.map(p => channel.addPeer(p,client.getMspid()));

  logger.info('Initializing the channel ..');
  await channel.initialize();

  return channel;
}

async function query(org: Organization) {
  let client = await getClient(org);
  let channel = await getChannel(client, org);


  logger.info(`Quering the Chaincode on the peers of ${org}  .......................`);
  let response = await channel.queryByChaincode({
    chaincodeId: config.CHAIN_CODE_ID,
    fcn: 'GetActivityByID',
    args: ["A003"],
    txId: client.newTransactionID()
  });

  logger.info(`Peer0 of ${org} has ${response[0].toString('utf8')}   .......................`);
  logger.info(`Peer1 of ${org} has ${response[1].toString('utf8')}   .......................`);
/*
  logger.info(`Quering the Chaincode on the peers of ${org}   .......................`);
  let response2 = await channel.queryByChaincode({
    chaincodeId: config.CHAIN_CODE_ID,
    fcn: 'query',
    args: ["ReportView"],
    txId: client.newTransactionID()
  });

  logger.info(`Peer0 of ${org} has ${response2[0].toString('utf8')}   .......................`);
  logger.info(`Peer1 of ${org} has ${response2[1].toString('utf8')}   .......................`);
  */

}

export async function queryChaincode() {
  logger.info('######################################################  ORG1 ###################');
  await query(Organization.ORG1);
  logger.info('######################################################  ORG2 ###################');
  await query(Organization.ORG2);

}

