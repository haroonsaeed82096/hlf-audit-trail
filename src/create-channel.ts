import * as fs from 'fs';
import * as path from 'path';

import { Organization, getClient, getOrderer } from './BlockchainClient';
import config from './config';
import {ChannelRequest, BroadcastResponse} from "fabric-client";
import Logger from "arthur-lib/lib/general/logging";

const logger = Logger("CreateChannel");
const CHANNEL_1_PATH = 'C:/Users/Haroon/Documents/camelot/internal-components/arthur/src/dom_blockchain/cesonia-network/channel-artifacts/twoorgschannel.tx';
//let bcClient = new  BlockchainClient();

export async function createChannel() {
try {

  logger.info('Getting org1client from create-channel ');
  let org1Client = await getClient(Organization.ORG1);
  logger.info('Getting orderer from create-channel ');
  let orderer = await  getOrderer(org1Client);

  // read in the envelope for the channel config raw bytes
  logger.info('Reading the envelope from manually created channel transaction ..');
  let envelope = fs.readFileSync(path.join(CHANNEL_1_PATH));

  // extract the configuration
  logger.info('Extracting the channel configuration ..');
  let channelConfig = org1Client.extractChannelConfig(envelope);

  logger.info('Signing the extracted channel configuration ..');

  let signature = org1Client.signChannelConfig(channelConfig);

  // prepare the request
  let channelRequest: ChannelRequest = {

    name: config.CHANNEL_NAME,
    config: channelConfig,
    signatures: [signature],
    orderer: orderer,
    txId: org1Client.newTransactionID()
  };
  logger.info('Sending the request to create the channel ..');
  //let Result;
  let response = await org1Client.createChannel(channelRequest);
  logger.info('channel created.........');
  return true;
}
catch(e) {
  logger.error(e);
}
}
