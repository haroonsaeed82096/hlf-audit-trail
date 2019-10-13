'use strict';
const shim = require('fabric-shim');
const util = require('util');

let Chaincode = class {

    async Init(stub) {
    console.info('=========== Instantiated Private chaincode ===========');
    return shim.success();
  }

  
  async Invoke(stub) {
    let ret = stub.getFunctionAndParameters();
    console.info(ret);

    let method = this[ret.fcn];
    if (!method) {
      console.error('no function of name:' + ret.fcn + ' found');
      throw new Error('Received unknown function ' + ret.fcn + ' invocation');
    }
    try {
      let payload = await method(stub, ret.params);
      return shim.success(payload);
    } catch (err) {
      console.log(err);
      return shim.error(err);
    }
  }

  async queryLogs(stub, args) {
    if (args.length != 2) {
      throw new Error('Incorrect number of arguments. Expecting CarNumber ex: CAR01');
    }
    
    
    let activityAsBytes = await stub.getPrivateData(args[0],args[1]); 
    if (!activityAsBytes || activityAsBytes.toString().length <= 0) {
      throw new Error('Product does not exist: ');
    }
    console.log(activityAsBytes.toString());
    return activityAsBytes;
  }

  

  async addLog(stub, args) {
    console.info('============= START : Adding User Activity Logs===========');
    if (args.length != 5) {
      throw new Error('Incorrect number of arguments. Expecting 5');
    }

    var UserActivity = {
      docType: 'activities',
      UserID: args[1],
      name: args[2],
      activityName: args[3],
      ActivityID: args[4]
    };

    
    await stub.putPrivateData(args[0],args[1], Buffer.from(JSON.stringify(UserActivity)));
    console.info('============= END : Private Product Added===========');
  }
};

shim.start(new Chaincode());
