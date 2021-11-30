const client = require('../Connections/RedisConnection')
const axios = require('axios');

const api = 'http://'+process.env.API_END_POINT;

let IsUserOnline= (user)=>{
  console.log('get online user function called !')
  return new Promise((resolve, reject) => {
    try {
   let data = client.get(user , (err , data)=>{
        if(err) console.log('error ' , err)
        console.log('data Of online users ' , data)
        
        resolve(data);
        })

    } catch (e) {
        return reject(e)
    }
});

}
let IsAdminOnline= (Admin)=>{
  console.log('Is online admin function called !')
  return new Promise((resolve, reject) => {
    try {
   let data = client.get(Admin , (err , data)=>{
        if(err) console.log('error ' , err)
        console.log('data Of online users ' , data)
        
        resolve(data);
        })

    } catch (e) {
        return reject(e)
    }
});

}

let ValidateResponder = async(token)=>{
  
  return new Promise ( async (resolve , reject)=>{
  
    try{
      
      let axiosConfig = {
        headers: {
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
            "Authorization": `Bearer ${token}`
        }
    
      };
      
   let response =  await axios.post( api+'/api/chat/addText' , axiosConfig)


    // console.log('response ' , response);
      resolve(response)
    }catch(err){
      reject(err)
    }
  });
  
    
    //call apoi for validateion
    //if succsess then next
    //else disconnect 
  }
let GetAllRoomOfUsers = (userroom)=>{
  console.log('user room is === > ' , userroom);
  console.log('Get all Room of uSer Function called !')
  return new Promise ( async (resolve , reject)=>{
  
    try{
      let rooms = client.lrange(userroom , 0 , -1, (err, reply)=>{
        let data = reply;
      resolve(data);
      
      })
    }catch(err){
      reject(err)
    }
  });
}
 let GetAllRoomOfAdmins = (userroom)=>{
  console.log('user room is === > ' , userroom);
  console.log('Get all Room of uSer Function called !')
  return new Promise ( async (resolve , reject)=>{
  
    try{
      let rooms = client.lrange(userroom , 0 , -1, (err, reply)=>{
        let data = reply;
      resolve(data);
      
      })
    }catch(err){
      reject(err)
    }
  });
}
let UpdateConnectivityStatusOfUser = (onlineuser , socketId , responderId)=>{
  console.log('Update Connectivity  status of User function called');
  return new Promise ( async (resolve , reject)=>{
  
    try{
      client.set(onlineuser, socketId, (err, reply)=>{
//Also Save User Id Against Socket Id Such That During Disconnectivity We Have User Record 
let onlineUserData = reply
let socketdata = "Socket"+socketId
  client.set(socketdata , responderId , (err , reply)=>{
    if(err) console.log(err)
  console.log('online socket 1 ==>' , reply)
  resolve(onlineUserData , reply)
})  
      })
    }catch(err){
      reject(err)
    }
  });


} 
let UpdateConnectivityStatusOfAdmin = (onlineuserAdmin,socketId , userId)=>{
  console.log('Update Connectivity  status of User function called');
  return new Promise ( async (resolve , reject)=>{
  
    try{
      client.set(onlineuserAdmin, socketId, (err, reply)=>{
//Also Save User Id Against Socket Id Such That During Disconnectivity We Have User Record 
let onlineAdminData = reply
let socketdata = "SocketOfAdmin"+socketId
  client.set(socketdata , userId , (err , reply)=>{
    if(err) console.log(err)
  console.log('online socket 1 ==>' , reply)
  resolve(onlineAdminData , reply)
})  
      })
    }catch(err){
      reject(err)
    }
  });


}

module.exports = {
  IsUserOnline,
  ValidateResponder,
  IsAdminOnline,
  GetAllRoomOfUsers,
  UpdateConnectivityStatusOfUser,
  UpdateConnectivityStatusOfAdmin
}