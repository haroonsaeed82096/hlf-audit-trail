'use strict';
//for Service Id listings
 let id = 0;
const {
  Contract
} = require('fabric-contract-api');
class Services extends Contract {


async registerPartner(ctx, userId, key, fullName, address,contactNumber,designation,servicesOffered) {

    let partnerData = {
      PartnerId: userId,
      Name: fullName,
      type:'partner',
      Contact:contactNumber,
      Address:address,
      AllocatedServices: [],
      accessKey: key,
      Designation: designation,
      ServicesOffered:servicesOffered
    };
let partnerListingData = {
      PartnerId: userId,
      Name: fullName,
      type:'partner',
      Contact:contactNumber,
      Address:address,
      Designation: designation,
      ServicesOffered:servicesOffered
    };
     //Checking if Designation category Existed or not   
    let partnerCategoryAsBytes = await ctx.stub.getState(designation);
    if (!partnerCategoryAsBytes || partnerCategoryAsBytes.toString().length <= 0) {
      return("This Type of Service not available Right now.. If you misspelled,Choose Rightone From List..")
      }
    let partnerAsBytes = await ctx.stub.getState(userId);
    if (!partnerAsBytes || partnerAsBytes.toString().length <= 0) {
      
      let partnerCategory = JSON.parse(partnerCategoryAsBytes.toString());
      partnerCategory.push(partnerListingData); //pushing to category for listings
      await ctx.stub.putState(userId, Buffer.from(JSON.stringify(partnerData)));
      await ctx.stub.putState(designation, Buffer.from(JSON.stringify(partnerCategory)));
      
console.log("Thanks for Registering with Us..")
return("Thanks for Registering with Us..")

    }
    else {
      return('Username is already taken.!');
    }
  }


async registerAdmin(ctx, userId, key, adminName,contactNumber) {

    let adminData = {
      id:userId,
      name: adminName,
      type: 'admin',
      ContactNumber: contactNumber,
      accessKey: key
    };
    let adminAsBytes = await ctx.stub.getState(userId);
    if (!adminAsBytes || adminAsBytes.toString().length <= 0) {
        let electrician=[];
        let plumber=[];
        let carpenter=[];
        let painter=[];
        let electronicsRepairer=[];
        let interiorDesigner=[];
        let weddingPlanner=[];

        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(adminData)));
        await ctx.stub.putState('Electrician', Buffer.from(JSON.stringify(electrician)));
        await ctx.stub.putState('Plumber', Buffer.from(JSON.stringify(plumber)));
        await ctx.stub.putState('Carpenter', Buffer.from(JSON.stringify(carpenter)));
        await ctx.stub.putState('Painter', Buffer.from(JSON.stringify(painter)));
        await ctx.stub.putState('Electronics Repairer', Buffer.from(JSON.stringify(electronicsRepairer)));
        await ctx.stub.putState('Interior Designer', Buffer.from(JSON.stringify(interiorDesigner)));
        await ctx.stub.putState('Wedding Planner', Buffer.from(JSON.stringify(weddingPlanner)));
        }

    else {
      return('Username is already taken.!');
    }
  }


async addNewService(ctx, userId, key, serviceName) {

    let credentialsAsBytes = await ctx.stub.getState(userId);

    if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
      return('Incorrect adminId..!');
    }

    else{
     let credentials = JSON.parse(credentialsAsBytes);
     if (key != credentials.accessKey) {
        return('Incorrect Access key..!');
      }

      let serviceCategoryAsBytes = await ctx.stub.getState(serviceName);
    if (!serviceCategoryAsBytes || serviceCategoryAsBytes.toString().length <= 0) {
        let newService=serviceName;
        newService=[];
        await ctx.stub.putState(serviceName, Buffer.from(JSON.stringify(newService)));
        console.log("New Service "+serviceName+" Added Succesfully")
        return("New Service "+serviceName+" Added Succesfully")
          }
    else{
      return("This type of Service Already Added to List")
        }
     }
 }
async bookService(ctx, serviceType,name,address,contactNumber) {
    let refId = ++id;
    let serviceData = {
      ServiceType: serviceType,
      RequesterName: name,
      RequesterLocation:address,
      RequesterContact:contactNumber,
      Status:'Requested',
      TrackingId:'C'+refId,
      AllocatedExecutive:'Not Yet Allocated',
      ExecutiveDetails:'Not Yet Allocated'
    };
    

   await ctx.stub.putState('C'+refId, Buffer.from(JSON.stringify(serviceData)));
   return("Success.. You Will get a confirmation from Our Executive on Call. For Reference, Your Service is Requested with an Id of C"+refId)

 }

async allocateService(ctx, adminId, key, serviceId,partnerId) {

    let credentialsAsBytes = await ctx.stub.getState(adminId);

    if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
      return('Incorrect adminId..!');
    }
    else {
      let credentials = JSON.parse(credentialsAsBytes);
      if (key != credentials.accessKey) {
        return('Incorrect Access key..!');
      }
      if (credentials.type!='admin') {
        return('You are Not Authorized To Allocate Service..!');
      }
      let partnerAsBytes = await ctx.stub.getState(partnerId);
      if (!partnerAsBytes || partnerAsBytes.toString().length <= 0) {
        return('Service Executive With This Id Not Existed..!');
      }
       //Checking if ServiceId is existed or not
    
      let serviceAsBytes = await ctx.stub.getState(serviceId);
      if (!serviceAsBytes || serviceAsBytes.toString().length <= 0) {
        return('Service With This Id Not Existed..!');
      }
      let partner = JSON.parse(partnerAsBytes);
      
      let service = JSON.parse(serviceAsBytes);
      if (service.Status !='Requested') {
        return('Service With this Id is Not Active..');
      }
      service.AllocatedExecutive = partnerId;
      service.ExecutiveDetails = partner.Contact;
      
      partner.AllocatedServices.push(serviceId);
      await ctx.stub.putState(partnerId, Buffer.from(JSON.stringify(partner)));

      await ctx.stub.putState(serviceId, Buffer.from(JSON.stringify(service)));
      console.log("Service Allocaled To Executive Successfully..")
      return("Service Allocaled To Executive Successfully..")
    }
  }
async updateServiceStatus(ctx, partnerId, key, serviceId,status) {

    let credentialsAsBytes = await ctx.stub.getState(partnerId);

    if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
      return('Incorrect PartnerId..!');
    }
    else {
      let credentials = JSON.parse(credentialsAsBytes);
      if (key != credentials.accessKey) {
        return('Incorrect Access key..!');
      }
      let serviceAsBytes = await ctx.stub.getState(serviceId);
      if (!serviceAsBytes || serviceAsBytes.toString().length <= 0) {
        return('Service With This Id Not Existed..!');
      }
      let service=JSON.parse(serviceAsBytes);
      if (partnerId!= service.AllocatedExecutive) {
        return('Not Authorized. Only Allocated Service Person Can Update..');
      }
      service.Status=status;
     
      await ctx.stub.putState(serviceId, Buffer.from(JSON.stringify(service)));
      console.log("Service Status Updated..")
      return("Service Status Updated..")
    }

  }

async myAccount(ctx, userId, accessKey) {


    let credentialsAsBytes = await ctx.stub.getState(userId);

    if (!credentialsAsBytes || credentialsAsBytes.toString().length <= 0) {
      return('Incorrect UserId or Not Authorized..!');
    }
    else {
      let credentials = JSON.parse(credentialsAsBytes);
      if (accessKey != credentials.accessKey) {
        return('Incorrect Access key..!');
      }
      let data = await ctx.stub.getState(userId);
      let jsonData = JSON.parse(data.toString());
      return JSON.stringify(jsonData);
    }
  
  }

async search(ctx, queryId) {


    let queryAsBytes = await ctx.stub.getState(queryId);

    if (!queryAsBytes || queryAsBytes.toString().length <= 0) {
      return('No Results for This Search..!');
    }
    let jsonData = JSON.parse(queryAsBytes.toString());
    let queryType=jsonData.type;
    if (typeof queryType!=="undefined") {
      return('Access Denied..!');
      }
    else {
     
      return JSON.stringify(jsonData);
    }
  }

async queryAllServiceRequests(ctx) {
    const startKey = 'C1';
    const endKey = 'C999';

    const iterator = await ctx.stub.getStateByRange(startKey, endKey);

    const allResults = [];
    while (true) {
      const res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        console.log(res.value.value.toString('utf8'));

        const Key = res.value.key;
        let Record;
        try {
          Record = JSON.parse(res.value.value.toString('utf8'));
        }
        catch (err) {
          console.log(err);
          Record = res.value.value.toString('utf8');
        }
        allResults.push({
          Key,
          Record
        });
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return JSON.stringify(allResults);
      }
    }
  }


}


module.exports =Services;
