import * as fs from 'fs';
import * as path from 'path';
import {CryptoContent, Orderer, Peer} from "fabric-client";
import Client = require('fabric-client');




let KEY_STORE_PATH_ADMIN = './keystore/admin/';
let ORDERER_URL = 'grpcs://localhost:7050';
let ORDERER_TLS_CAROOT_PATH = '/cesonia-network/crypto-config/ordererOrganizations/cesonia.com/orderers/orderer.cesonia.com/tls/ca.crt';
let ORG1_ADMIN_MSP = './../cesonia-network/crypto-config/peerOrganizations/org1.cesonia.com/users/Admin@org1.cesonia.com/msp';
let ORG2_ADMIN_MSP = './../cesonia-network/crypto-config/peerOrganizations/org2.cesonia.com/users/Admin@org2.cesonia.com/msp';

export enum Organization {
  ORG1 = 'org1',
  ORG2 = 'org2'
}

//let MSP_DIR;
var MSP_DIR = {
    org1: ORG1_ADMIN_MSP,
    org2: ORG2_ADMIN_MSP
  };

//let MSP_ID;
let Org1MSP:string = 'Org1MSP';
let Org2MSP:string = 'Org2MSP';
var MSP_ID = {
    org1: Org1MSP,
    org2: Org2MSP
  };
let Org1Admin:string = 'Org1Admin';
let Org2Admin:string = 'Org2Admin';

var ORG_AdminUser = {
  org1: Org1Admin,
  org2: Org2Admin
};

//let PEERS;
var PEERS = {
    org1: {
      peers: [
        {
          url: 'grpcs://localhost:7051' // peer0
        },
        {
          url: 'grpcs://localhost:8051' // peer1
        }
      ]
    },
    org2: {
      peers: [
        {
          url: 'grpcs://localhost:9051' // peer0
        },
        {
          url: 'grpcs://localhost:10051' // peer1
        }
      ]
    }
  };

   export async function getPeers(client: Client, org: Organization): Promise<Client.Peer[]>  {
    let peers: Peer[] = [];
    for (let i = 0; i < 2; i++) {
      let tls_cacert = `./../cesonia-network/crypto-config/peerOrganizations/${org}.cesonia.com/peers/peer${i}.${org}.cesonia.com/tls/ca.crt`;
      //console.log(tls_cacert);
      let data = fs.readFileSync(path.join(__dirname, tls_cacert));
      //console.log(data);

      let p: Peer = client.newPeer(PEERS[org].peers[i].url, {
        'pem': Buffer.from(data).toString(),
        'ssl-target-name-override': `peer${i}.${org}.cesonia.com`
      });
      peers[i] = p;
    }

    return peers;

  }

  export async function getOrderer(client: Client): Promise<Client.Orderer> {
    // build an orderer that will be used to connect to it
    let data = fs.readFileSync(path.join(__dirname, ORDERER_TLS_CAROOT_PATH));
    return client.newOrderer(ORDERER_URL, {
      'pem': Buffer.from(data).toString(),
      'ssl-target-name-override': 'orderer.cesonia.com'
    });
  }

  export async function getClient(org: Organization): Promise<Client> {
    let client = new Client();
    console.log("Setting up the cryptoSuite ..");
    // ## Setup the cryptosuite (we are using the built in default s/w based implementation)
      let cryptoSuite = Client.newCryptoSuite();
      cryptoSuite.setCryptoKeyStore(Client.newCryptoKeyStore({
      path: `${KEY_STORE_PATH_ADMIN}-${org}`
      }));

      client.setCryptoSuite(cryptoSuite);

      console.log('Setting up the keyvalue store ..');

    // ## Setup the default keyvalue store where the state will be stored
      let store = await Client.newDefaultKeyValueStore({
      path: `${KEY_STORE_PATH_ADMIN}${org}`
      });

    client.setStateStore(store);
    console.log('Creating the admin user context ..');

    let ORG_ADMIN_MSP = MSP_DIR[org];
    //console.log('ORG_ADMIN_MSP---------------------Path: '+ORG_ADMIN_MSP);

    let privateKeyFile = fs.readdirSync(__dirname + ORG_ADMIN_MSP + '/keystore')[0];
    //console.log('privateKeyFile---------------------Path: '+privateKeyFile);

    let signed_Cert = fs.readdirSync(__dirname + ORG_ADMIN_MSP + '/signcerts')[0];
    //console.log('signed_Cert---------------------Path: '+signed_Cert);

    // ###  GET THE NECESSRY KEY MATERIAL FOR THE ADMIN OF THE SPECIFIED ORG  ##
    let cryptoContentOrgAdmin: CryptoContent = {
      //privateKey: ORG_ADMIN_MSP + '/keystore/' + privateKeyFile,
      privateKey: path.join(__dirname, ORG_ADMIN_MSP+'/keystore/'+privateKeyFile),
      signedCert: path.join(__dirname, ORG_ADMIN_MSP+'/signcerts/'+signed_Cert)

      //signedCert: ORG_ADMIN_MSP + '/signcerts/Admin@org1.cesonia.com-cert.pem'
    };
//    console.log('privateKey---------------------Path: '+cryptoContentOrgAdmin.privateKey);
//    console.log('signedCert---------------------Path: '+cryptoContentOrgAdmin.signedCert);
//    console.log('Usernames for admins---------------------: '+ORG_AdminUser[org]);
//    console.log('org NAMES ---------------------: '+[org]);


    await client.createUser({

      username: ORG_AdminUser[org],
      mspid:  MSP_ID[org],
      cryptoContent: cryptoContentOrgAdmin,
      skipPersistence: false
    });
//    console.log('after create user ´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´´');
    return client;

  }
