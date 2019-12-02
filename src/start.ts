//import {getClient, getPeers} from "./BlockchainClient";
import {createChannel} from "./create-channel";
import {JoinChannel} from "./join-channel";
import {installChaincodeOnPeers} from "./install-chaincode";
import {instantiateChaincodeOnPeers} from "./instantiate-chaincode";
import {queryChaincode} from "./query-chaincode";

export enum Organization {
  ORG1 = 'org1',
  ORG2 = 'org2'
}


async    function delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
    }
        console.log('create channel ----->>>>>>');
        createChannel().then(async value => {
          console.log('Join channel ----->>>>>>>>>');
          await delay(3000);
          await JoinChannel();

        }).then(async value => {
          console.log('Install chaincode on peers ----->>>>>>>>>');
          await delay(3000);
          await  installChaincodeOnPeers();

        }).then(async value => {
          console.log('Instantiate chaincode on peers ----->>>>>>>>>');
          await delay(3000);
          await instantiateChaincodeOnPeers();

        }).then(async value => {
          console.log('Querying the chaincode ----->>>>>>>>>');
          await delay(3000);
          await queryChaincode();

        }).catch((reason: any) => {
          console.log(reason);
          console.log('here is the catching');

        });
