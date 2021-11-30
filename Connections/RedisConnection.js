const redis = require('redis')
const REDIS_PORT = 6379
const client = redis.createClient(REDIS_PORT , (err)=>{
  if(err)console.log(err);
  console.log('Redis client connected on Port ' , REDIS_PORT)
});
module.exports = client;