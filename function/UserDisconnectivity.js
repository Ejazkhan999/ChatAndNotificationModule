const client = require('../Connections/RedisConnection')
const axios = require('axios');

  SearchAndDisconnectUser = (socketId)=>{
    console.log('serach and disconnect User function called !')
    return new Promise((resolve, reject) => {
      try {
        socketdata = "Socket"+socketId
     let data = client.get(socketdata , (err , data)=>{
          if(err) console.log('error ' , err)
          console.log('data Of users ' , data)
          if(data){
            console.log('data ============> is ' , data)
            let onlineuser = "OnlineUser"+data;
            console.log('online user was ===>' , onlineuser)
            client.del(onlineuser , (err, cb)=>{
              if(err) console.log(err);
              console.log(cb)
            })
          }
          })
          //delete socket data 
          client.del(socketdata , (err ,reply)=>{
            if(err) console.log(err);
            resolve(reply)
          })
  
      } catch (e) {
          return reject(e)
      }
  });
}

SearchAndDisconnectAdmin = (socketId)=>{
  
  console.log('serach and disconnect admin function called !')
    return new Promise((resolve, reject) => {
      try {
        socketdata = "SocketOfAdmin"+socketId
     let data = client.get(socketdata , (err , data)=>{
          if(err) console.log('error ' , err)
          console.log('data Of users ' , data)
          if(data){
            console.log('data ============> is ' , data)
            let onlineuser = "OnlineAdmin"+data;
            console.log('online user was ===>' , onlineuser)
            client.del(onlineuser , (err, cb)=>{
              if(err) console.log(err);
              console.log(cb)
            })
          }
          })
          //delete socket data 
          client.del(socketdata , (err ,reply)=>{
            if(err) console.log(err);
            resolve(reply)
          })
  
      } catch (e) {
          return reject(e)
      }
  });


}
UpdateAndReplaceNewResponderInEvent= (deleteResponder , responders ,EventId)=>{
  // console.log('serach and disconnect User function called !' , 'oldresponder ==>' , OldResponder, 'new res==>' , NewResponder , 'event==' , event)
    return new Promise((resolve, reject) => {
      try {
        let event = "Event"+EventId;
        for(var j =0 ; j <deleteResponder.length; j++ ){
        let RoomOfUser = "RoomOfUser"+deleteResponder[j];

let data = client.lrange(RoomOfUser,0 , -1, (err, reply)=>{
  if(err) console.log(err);
  console.log('reply is --->' , reply)
  let userdata = reply;
  console.log('userdata is ' , userdata);
  for(var i = 0; i < userdata.length; i++){
    if(userdata[i] == event ){
      client.lrem(RoomOfUser , 0 ,event )
    }
  }
})}

for(var k = 0 ; k < responders.length; k++){
  let RoomOfNewuser = "RoomOfUser"+responders[k]
let updatenewUser = client.rpush(RoomOfNewuser, event, (err, reply)=>{
  if(err)console.log(err);
  console.log('new user reply is ' , reply)
    
})
}
let ResponderObject = "Event_"+EventId+"ResponderList";
let responderData = JSON.stringify(responders);
let DataOfEvent = client.set(ResponderObject ,responderData , (err , reply)=>{
  if(err) console.log(err);
  console.log('added responder' , reply)
  resolve(reply)
} )
 


        
          
  
      } catch (e) {
          return reject(e)
      }
  });
} ,
EventCompleted = ()=>{
  console.log('EventCompleted function called !')
  return new Promise((resolve, reject) => {
    try {
      socketdata = "SocketOfAdmin"+socketId
      //find all user against room 


       //delte room from  every user list 
       
       //delte that room 

       //if socket socketid .leave 
        
       

    } catch (e) {
        return reject(e)
    }
});
}
//
module.exports = {
  SearchAndDisconnectAdmin,
  SearchAndDisconnectUser,
  UpdateAndReplaceNewResponderInEvent
 
}