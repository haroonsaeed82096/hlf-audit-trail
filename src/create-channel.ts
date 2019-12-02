import * as fs from 'fs';
import * as path from 'path';

import { Organization, getClient, getOrderer } from './BlockchainClient';
import config from './config';
import {ChannelRequest, BroadcastResponse} from "fabric-client";

const CHANNEL_1_PATH = 'C:/Users/Haroon/Documents/camelot/internal-components/arthur/src/dom_blockchain/cesonia-network/channel-artifacts/twoorgschannel.tx';
//let bcClient = new  BlockchainClient();

export async function createChannel() {
try {

  console.log('Getting org1client from create-channel ');
  let org1Client = await getClient(Organization.ORG1);
  console.log('Getting orderer from create-channel ');
  let orderer = await  getOrderer(org1Client);

  // read in the envelope for the channel config raw bytes
  console.log('Reading the envelope from manually created channel transaction ..');
  let envelope = fs.readFileSync(path.join(CHANNEL_1_PATH));

  // extract the configuration
  console.log('Extracting the channel configuration ..');
  let channelConfig = org1Client.extractChannelConfig(envelope);

  console.log('Signing the extracted channel configuration ..');

  let signature = org1Client.signChannelConfig(channelConfig);

  // prepare the request
  let channelRequest: ChannelRequest = {

    name: config.CHANNEL_NAME,
    config: channelConfig,
    signatures: [signature],
    orderer: orderer,
    txId: org1Client.newTransactionID()
  };
  console.log('Sending the request to create the channel ..');
  //let Result;
  let response = await org1Client.createChannel(channelRequest);
  console.log('channel created.........');
  return true;
}
catch(e) {
  console.error(e);
}
}
