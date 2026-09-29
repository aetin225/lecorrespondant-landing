const {createHandler}=require('../lib/demo-handler');
// Loaded only when a configured, valid request needs delivery.
module.exports=createHandler({createTransport:options=>require('nodemailer').createTransport(options)});
