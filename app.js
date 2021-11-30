const client = require('./Connections/RedisConnection')
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

// const test = require('./Connections/connection');
// const io = test.io;
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
let createRoomApi = require('./controller/CreateRoomApi');
app.use(cors({origin: true}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
var socket = require("socket.io-client")("http://localhost:8000");
const axios = require('axios')
const RespondersMapDataObject = require('./function/MapFunctions');
const UserConnectivityStatus = require('./function/OnlineUserModule');
const onlineUsermodule = require('./function/OnlineUserModule');
let Userdisconnectivity = require('./function/UserDisconnectivity');

const api = `http://${process.env.API_END_POINT || 'localhost:3001' }`;
const ServerApi = `http://${process.env.ServerApi}`;

const socketFunc = require('./function/socketfunction');
const { type } = require('./Connections/RedisConnection');

io.on('connection', async (socket) => {
   console.log('user connected !')
   console.log('socket data from hassan ====> ' , socket.rooms)

  

   let socketId = socket.id;
   let token = socket.handshake.auth.token;
   let IsAdmin = socket.handshake.query.IsAdmin;
   console.log('query is ' , socket.handshake.query)
  //  let istoken =  await onlineUsermodule.ValidateResponder(token).catch((e )=> {
  //    console.log('user diconnected token not confirm !')
  // //  console.log(e)
  //   let socketId = socket.id;
  //   let socketdata = "Socket"+socketId
  //   client.get(socketdata , (err , reply)=>{
  //     let onlineuser = reply;
  //     client.del(onlineuser , (err, reply)=>{
  //       console.log('delete' , reply)
  //     } )
  //   })
  //   client.del(socketdata , (err, reply)=>{
  //     console.log('socketdata deleteed ' , reply)
  //   })
  //   console.log('user disconnected !')
  
  //   // socket.emit('disconnect');
    
  // }
  //)

  let responderId  = socket.handshake.query.responderId;
  console.log('responder id during connection is === > ' , responderId)
  // let responderId = 3;

if(IsAdmin == 'ABC'){
 
  console.log('connected user is admin' )
  
  //  if(IsAdmin == true){
    console.log('responder id -=== > '  , responderId)
    let userId = responderId;
    
    let Adminroom = "RoomOfAdmin"+userId ;
    console.log('admin room ' , Adminroom);
    let UserRoomData = await UserConnectivityStatus.GetAllRoomOfUsers(Adminroom);
    // let AdminRoomData = await UserConnectivityStatus.GetAllRoomOfAdmins(Adminroom);
// console.log('room data is ' , roomdata )

    // socket.join(AdminRoomData);
    socket.join(UserRoomData)
    let onlineuserAdmin = "OnlineAdmin"+ userId;
    console.log('room of hassan is ================> ' , socket.rooms)
    //call function To save record User In Online Record !
  let UpdateConnectivityStatusOfUser = await
  UserConnectivityStatus.UpdateConnectivityStatusOfAdmin(onlineuserAdmin,
  socketId , userId);
    console.log('UpdateConnectivityStatusOf Admin is - ==> ',UpdateConnectivityStatusOfUser)      
   //}
  }

//Get room Of user
if(!IsAdmin || IsAdmin == false){
  console.log('connected user is responder' )
  let userroom = "RoomOfUser"+responderId;
let roomdata = await UserConnectivityStatus.GetAllRoomOfUsers(userroom);
// console.log('room data is ' , roomdata )
socket.join(roomdata)
console.log('Romm of hassan is ' , socket.rooms)
//update status of user to OnlineRecord
let onlineuser = "OnlineUser"+responderId;
console.log('room of hassan is ================> ' , socket.rooms)
//call function To save record User In Online Record !
let UpdateConnectivityStatusOfUser = await
 UserConnectivityStatus.UpdateConnectivityStatusOfUser(onlineuser,
  socketId , responderId);
console.log('UpdateConnectivityStatusOfUser ==> ',UpdateConnectivityStatusOfUser)
//pass connectivity message 
   socket.emit('message' , {text:'you has been connected'})  


}

  socket.on('auth' , (msg)=>{
    console.log('auth object called ' )
    let socketId = socket.id;
    //input from users 
    let responderId = msg.responderId;
    console.log("Token Reveived in auth==============",msg.token)
    token = msg.token;
    client.set('AuthtokenOfResponder:'+responderId , msg.token)
    console.log("In Auth Token Value --->",token)
    // console.log('msg ' , msg)
    // console.log('responder id is ' , responderId)
// //check all rooms assigned to repsonder if assigned then join user to that room
let userroom = "RoomOfUser"+responderId;
let rooms = client.lrange(userroom , 0 , -1, (err, reply)=>{
  console.log('user room is ' , reply )
  socket.join(reply)
})
// client.rpush('OnlineUsers' , responderId , (err,reply)=>{
//   console.log(reply)
// } );

//Add User to Online List . save scket id against online user id 
let onlineuser = "OnlineUser"+responderId;
// console.log('online user is ' ,socket)
client.set(onlineuser, socket.id, (err, reply)=>{
  console.log('online user insertion in socket ! ' , reply )
})
//also save user id against socket id such that during disconnectivity we have user record 
let socketdata = "Socket"+socketId
client.set(socketdata , onlineuser , (err , reply)=>{
  console.log('online socket ' , reply)
})
})
//In Case Of Event Creation Add Online responder to join room

  socket.on("joinRoom", ({ id , name ,responders, respondersOfEvent ,safeHouseId }) => {
    console.log(socket.id, "=id");
    let DataResponders = responders;
    console.log('dta responders are ===> ' ,DataResponders)
    console.log('join room funct called ')
    let event = "Event"+id;
    let eventusers = event+"users"
    //creaet and join event 
    socket.join(event);
    //Every user has a list of rooms . append this room to list of that user'room
    for(var i =0 ; i < responders.length; i++){
      console.log('calling');
      let RoomOfUser = "RoomOfUser"+responders[i];
      client.rpush(RoomOfUser , event)
      //check which user in list are online if online then join room to that user !
      let user = client.get("OnlineUser"+responders[i] , (err , reply)=>{
        console.log(`user is ` , reply)
        //if user not online
        if(reply == null){
          console.log(reply , ' is not avaliable ')
        }
        //connect user to that Room
        else{
          let data =reply
          const my_socket = io.sockets.sockets.get(data);
          let event2 = "Event"+id;
          console.log('event 2 ====================>' , event2)
          // my_socket.join(event2)
        }
      })

    }
    //add this event into active event 
    //Add Responder List agaisnt event !
    let ResponderObject = "Event_"+id+"ResponderList";

    //in this loop we will add only responder against an event 
    
    
      let EventResponderData = {}
      //this is list of event responders admin not include in it 
      console.log('RepsonderOf events are ' ,respondersOfEvent );
      respondersOfEvent = JSON.stringify(respondersOfEvent);
      client.set(ResponderObject , respondersOfEvent , (err, reply)=>{
        console.log(`responder added against an event ! ` , reply)
      })
    
    //list of all users against an event 
    const AllUsersOfEvent = JSON.stringify(responders);
    client.set(event, AllUsersOfEvent, function(err, reply) {
        console.log(reply);
    });
    client.rpush('ListOfActiveEvents', event)

    // socket.broadcast.to(event).emit( 'message' , {
    //   event:event,
    //   text: `An event with ${name} has been created andyou are added to group !`,
    // });
    // socket.broadcast.to(event).emit('OperationEvent' ,{eventId:id , Ebventname:name ,responders, respondersOfEvent ,safehouseId , status:1})
    io.emit('OperationEvent'  , {eventId:id ,status:1,message: 'New event has been created!' , eventname:name , respondersOfEvent:respondersOfEvent,safeHouseId:safeHouseId});

   
  })

  socket.on('operation' , async (data , fn)=>{
    console.log(`operation socket event called  called ! `)
    let eventId = data.eventId;
     let status = data.status;
     let message =data.message;
     let dataObj = data.dataObj
     console.log('eventId===> ' , eventId , "status =>" , status , "message ==>"  , message )
    // if(!eventId || !status || !message) {
    //   fn({msg:'can not fetch events ' , sucssess:false})}
    //get all users of this events //
    let event = "Event"+eventId;
    // let safehouseId= 36;
    // let respondersOfEvent = [14,29,28,41];
    //update status of event //
    let Eventstatus = await RespondersMapDataObject.UpdateStatusOfEventofMap(status, eventId);
    
    console.log('event status ' , Eventstatus  );
    console.log('operation event emitted ======================>>>>>' ,)
    io.in(event).emit('OperationEvent', {eventId:eventId , status:status , message:message,dataObj});
    socket.broadcast.to(event).emit( 'operation' , {eventId:eventId , status:status , message:message,dataObj });
    // o.in(event).emit('OperationEvent', {eventId:eventId , status:status , message:message,dataObj});
    console.log('object to be emitted ==>' , eventId , status , message, dataObj)
    // io.emit('OperationEvent' ,{eventId:163 , status:1, message:'hello world' , respondersOfEvent:[1,2,3,4],safehouseId:1});
    // io.emit('OperationEvent'  , {eventId:eventId,status:status,message:message ,dataObj:dataObj });
    console.log('operation event emitted done ======================>>>>>' ,)
  })
 

  socket.on('message' , async (data, fn )=>{
    console.log('call back from messeges is ' , fn)
    //{eventId,messageId, responderId,EventResponderId,chat}
    let responderId = data.responderId;
    console.log("Data from client ---->",data)
   
    // let usertoken =  client.get('AuthtokenOfResponder:'+responderId , (err, reply)=>{
    //   if(err)console.log(err)
    //   token = reply
    //   console.log('reply token is ' , reply )
    // })

    
   let chat = '  ';
   let mediaType = '';
    // if(!data.eventId || !data.messageId || !data.responderId || !data.EventResponderId ){
    //   fn({msg:'innvalid hit  ', success:false})
    // }
    let eventId = data.eventId;
    let messageId = data.messageId;
    let mediaUrl = data.mediaUrl;
    if(data.mediaType){
      mediaType = data.mediaType
    }
    let file = {
      mediaType:mediaType,
      mediaUrl:mediaUrl
    }

    let EventResponderId = data.EventResponderId;
    if(data.chat){
      chat = data.chat;
    }
    let event = "Event"+eventId;   
     let room = socket.rooms

    let IsEventinRooom = room.has(event);
    if(IsEventinRooom == false){
      let RoomUsers = client.get(event , (err, reply)=>{
        if(err){
          fn({msg:'message senfing failed  ', messageId , success:false})
        }
        else{
          console.log('users ' , reply)
          if(reply){
            for(var i =0; i < reply.length; i++){
              if(responderId == reply[i]){
                console.log(reply[i] , 'user is in')
                socket.join(event)
         }}}
          else{
            fn({msg:'message sending failed ', messageId , success:false})
          }
        }})
    }
   
     
     

// // let eventusers = event+"users"+responderId
// // console.log('eventusers' , eventusers)
// // let checkeventuser = client.get(eventusers)
// // if(!checkeventuser) console.log('event user not found !')
// // console.log('checkeventuser' , checkeventuser)

    var postData = {
      EventResponderId:EventResponderId,
      chat:chat ,
      file
    };
    
    let axiosConfig = {
      headers: {
          'Content-Type': 'application/json;charset=UTF-8',
          "Access-Control-Allow-Origin": "*",
          "Authorization": `Bearer ${token}`
      }
    };
    // console.log(`axiosConfig -----> ` , axiosConfig)
    console.log('token -=====>' , token)

    socket.broadcast.to(event).emit( 'message' , {
      responderId:responderId ,
      EventResponderId:EventResponderId,
      chat: chat,
      messageId:100,
      mediaUrl:mediaUrl,
      mediaType:mediaType,
      eventId:eventId
    });
  

    // let call api for inserting chat and eventrepsonderid

    await axios.post(`http://192.168.100.47:3001/api/chat/addText` , postData, axiosConfig)
    .then(function (response) {
      console.log('response send  sucssessfully !');
      fn({msg:'message send sucssessfully !', messageId , success:true})
    }).catch(err=>{
      console.log('errror' ,err)
      fn({msg:'message sending failed due to invalid token  ', messageId , success:false})
    })
      

});
//send data to map by mobiledevices 
socket.on('SendMapDataToServer' ,async  (Userdata ,fn)=>{  
  console.log('Send map dataTo server function called !')
  console.log('socket data from mobile devices are ==>' , Userdata);
  console.log('call back from moobile devices are ' , fn);
  let data = JSON.parse(Userdata);

  // {longitude , latitude , responderId , eventId, status  , message}
  let longitude  = data.longitude ;
  let latitude = data.latitude;
  let responderId = data.responderId;
  console.log('responder id is ==>' ,responderId)
  let eventId = data.eventId;
  console.log('type of data is ' , typeof(data));
 
  let status = data.status;
  let message = data.message;
  let userstatus = status;
  //create an object for responder list of this event 
let responders = 'Event_'+eventId+'ResponderList';
//create longitide and latitude object path for responder 
let pathdata=  {
  lat:latitude,
  lng:longitude,
}

//responder list 
let RespondersList = await GetAllrespondersList(responders);
console.log('get all responder list is ======> out side function' , RespondersList)
// console.log('list of responders are ' , RespondersList);
//call get all responder function 
let GetAllRespondersdata = await GetAllResponders(responders);
console.log('get all responders are ' , GetAllResponders)
// console.log(`get all responders are ` , GetAllRespondersdata)
//responder length 
let event = "Event"+eventId;
console.log('event is ' , event)
console.log('socket id is ==>' , socket.id)
let EventkeyData = 'Event_:'+eventId;
//client not include 
io.in(event).emit('sendResponderUpdateToMobileDevice', {longitude:longitude , latitude:latitude , responderId:responderId ,eventId:eventId , status:status , message:message});
socket.broadcast.to(event).emit('sendResponderUpdateToMobileDevice', data);
io.emit('sendResponderUpdateToMobileDevice' , {msg:'publically transmitted data '});
io.to(event).emit('sendResponderUpdateToMobileDevice' , {msg:'public notification of user 1===>'})
//io.socket.emit('sendResponderUpdateToMobileDevice' , {msg:'public notiifcation to all except sender !'})
socket.broadcast.to(event).emit('sendResponderUpdateToMobileDevice', 'nice game');
socket.broadcast.emit('sendResponderUpdateToMobileDevice' , {msg:'hello world'})
socket.to(event).emit({msg:'Mobile phone recived socket data !'});

// socket.emit('sendResponderUpdateToMobileDevice' ,{eventId , responderId ,pathdata});
//
let GetResponderData=  await RespondersMapDataObject.GetAndReplaceResponderOldData(eventId , responderId ,pathdata );
console.log('get responder data is ' , GetResponderData)
if(status < 3){
 console.log('statuss from hassan saide is ' , status)
 
  let AddNewDataOnMap = await RespondersMapDataObject.UpdateDataOfMap(eventId ,GetResponderData);
  console.log('AddnewdataOnMap' , AddNewDataOnMap )

  let Eventstatus = await RespondersMapDataObject.UpdateStatusOfEventofMap(eventId , userstatus,);
  console.log('event status ' , Eventstatus  )
  socket.emit( {sucsess:true , msg:'data send sucssessfully !'})
  fn({msg:'data send  ', success:true})
  // let FindRadius = await checkForRadius(GetAllRespondersdata)
  // console.log('find radius is ' , FindRadius)
}
if(status > 3){
  console.log('status from hassn side is ' , status)
  let AverageMapData = await RespondersMapDataObject.CalculateAverageMapData( RespondersList,GetResponderData )
  console.log('AverageMap data is -->' , AverageMapData);
  let InsertAverageMapData = await RespondersMapDataObject.UpdateDataOfMap(eventId ,GetResponderData);
  let Eventstatus = await RespondersMapDataObject.UpdateStatusOfEventofMap(userstatus ,eventId);
  console.log('event status ' , Eventstatus  )
}
//Save path of responder against that event
let responderIdentifier =`Event_${eventId}_${responderId}`
let pathofResponders = RespondersMapDataObject.AddPathOfResponders(responderIdentifier ,pathdata )

socket.emit( {sucsess:true , msg:'data send sucssessfully !'})
fn({msg:'data recived   ', success:true})

})
socket.on('updatestatus' , (data , fn)=>{
  let responderId = data.responderId;
  let eventId = data.eventId;
  console.log('data from hassan side is  are ' , data)
  console.log('============< donr')
})

//Get Map data from map by admin ! 
socket.on('ResponderDataofEventOnMap' , async()=>{
  let EventsData = await RespondersMapDataObject.getResponderdataOnMap() ;
 let StatusesData = await RespondersMapDataObject.GetStatusesOfallEventsForMap();
  io.sockets.emit('AllResponderDataOnMap', ({EventsData , StatusesData})); 
})
socket.on('SendNotificatioToAUser' , async (data , fn)=>{
  let ResponderId = data.ResponderId;
  let user=  "OnlineUser"+ResponderId;
  console.log(`user is ` , user);
  let SocketUser = await onlineUsermodule.IsUserOnline(user);
  let IsmessageSend = true
  if(!SocketUser) {
    IsmessageSend = false
  }
  console.log('socket user is ' ,SocketUser );
  console.log('data from fazeel side is ' , data )
  socket.broadcast.to(SocketUser).emit('SendNotificationToEventSingleUser',data)
})
socket.on('SendNotificatioToAdmin' , async (data , fn)=>{
  let UserId = data.UserId;
  let user=  "OnlineAdmin"+UserId;
  console.log(`user is ` , user);
  let SocketUser = await onlineUsermodule.IsAdminOnline(user);
  console.log('admin user is ==== ? ' , SocketUser)
  let IsmessageSend = true
  if(!SocketUser) {
    IsmessageSend = false
  }
  console.log('socket user is ' ,SocketUser );
  console.log('data from fazeel side is ' , data )
  socket.broadcast.to(SocketUser).emit('SendNotificationOfEventToAdmin',data)
})
socket.on('UpdateResponderOfEvent' , (data , callback)=>{
  
  let deleteResponder  = data.deleteResponder ;
  let responders = data.responders;
  let EventId = data.EventId;
  let PreviousSafeHouseId = data.PreviousSafeHouseId;
  let  SafeHouseId = data.SafeHouseId
  
  let updateEvent = Userdisconnectivity.UpdateAndReplaceNewResponderInEvent(deleteResponder , responders ,EventId);
  console.log('updateEvent is ' , updateEvent)
  io.emit('ResponderOfEventUpdated' , data)
})

socket.on('completeEvent' , (data , fn)=>{
  let EventId = data.EventId;
  if(!eventId){
    fn({msg:'can not complete an event '})
  }
  let event = "Event"+eventId;
  //emit message to all user in room 
  io.in(event).emit('completeEventResponseMessage' , {eventId:eventId, msg:'event has been completed '})
  //call an event find all responders 

  //delete this event from list of all events 

  //
})


socket.on('disconnect',  () =>{
  console.log('user disconnected !======================================================================<<????????????????')
  let socketId = socket.id;
  let disconnectuser = Userdisconnectivity.SearchAndDisconnectUser(socketId);
  console.log('disconnect user is ' , disconnectuser);
  let disconnectAdmin = Userdisconnectivity.SearchAndDisconnectAdmin(socketId);
  console.log('disconnectivity of admin is ' , disconnectAdmin)
  // let socketdata = "Socket"+socketId
  // client.get(socketdata , (err , reply)=>{
  //   let onlineuser = reply;
  //   client.del(onlineuser , (err, reply)=>{
  //     console.log('delete' , reply)
  //   } )
  })
  // client.del(socketdata , (err, reply)=>{
  //   console.log('socketdata deleteed ' , reply)
  // })
  // console.log('user disconnected ! sucsess true ')
   
});
///now chat
//client side 
//})
http.listen(port, () => {
  console.log(`Socket.IO server running at http://localhost:${port}/`);
});
//client 
socket.on('connect' , ()=>{
  console.log('client uuser connected ')
})
socket.on("disconnect", () => {
  console.log('user disconected ================> '); // undefined
});
// function senddata(){
//   socket.emit('operation' , {eventId:163 , status:1, message:'hello world'})
// }
socket.on('sendResponderUpdateToMobileDevice' , (data)=>{
  console.log('data from coresponding mobile devices are ====>' , data)
});

// socket.on('OperationEvent' , (data)=>{
//   console.log('operation event data is ====>>> ' , data)
// })

// setInterval(senddata, 300000 );
// function hello(){

//   socket.emit('message' , ({eventId :186, messageId:4,mediaUrl:'http hello' , mediaType:'png' , chat:'hello world' , responderId : 3 ,EventResponderId :3}))
// }
// setInterval(hello , 20000)
// function senddatafromdevices(){
// console.log('senddatafrommobiledevices function called !')
// socket.emit('SendMapDataToServer' , {longitude:34.823 , latitude:64.76 , responderId:5 , eventId:3, status:2})
// }
// setInterval(senddatafromdevices , 5000);

// socket.on('AllResponderDataOnMap' , (msg=>{
//   console.log('data recived from map ' , msg)
// }))

//  function sendmapdata(){
//   socket.emit('ResponderDataofEventOnMap' , ()=>{
//     // console.log('get map by admin emmited')
//   })
//  }

// socket.on('message' , (msg)=>{
//   console.log(msg)
// })
//setInterval(sendmapdata, 4510000 );
//Apis 

const CreateRoomApi  =  async(req , res)=>{
  console.log('create room api called !')
  try{
    console.log(req.body);
    let id = req.body.id;
    if(!id) throw 'id not found !'
    
    let safeHouseId = req.body.safeHouseId;
    if(!safeHouseId) throw 'safe house id not found'
    let name = req.body.name;
    if(!name) throw 'name not found !'
    let EventsRespinders = req.body.EventsResponders;
    if(!EventsRespinders) throw 'EventsRespinders not found !'
    let responders = []
    let respondersOfEvent= [];

    if(!id || !name || !EventsRespinders ) throw ' invalid request !';
    let ResponderIds =  EventsRespinders.map((arr)=>arr.ResponderId); 
    let adminids = EventsRespinders.map((arr)=>arr.AdminId);
    for(var i = 0; i <ResponderIds.length; i++ ){
      if(ResponderIds[i] == null){

        console.log(' id with index ' , i)
        delete ResponderIds[i]
      }
      else{
        responders.push(ResponderIds[i])
        respondersOfEvent.push(ResponderIds[i])
      }
      if(adminids[i] ==  null){
        delete adminids[i]
      }else{
        responders.push(adminids[i])
      }
     
    }
    console.log('responders  ' , responders)
    console.log('join room fuction to be called !')
    socket.emit('joinRoom' ,{id , name , responders , respondersOfEvent  , safeHouseId} )

     res.status(200).json({
      success:true,
      
      msg:'room created !'
    })
  }catch(error){
    res.status(500).json({
      sucsses:false,
      error
    })
  }
}

const getOnlineUserList = async(req , res)=>{
  console.log('get online user list api called')
  try{
  
    let responderId = req.body.responderId;
    let user=  "OnlineUser"+responderId
    console.log(`user is ` , user);
    let UserStatus = await onlineUsermodule.IsUserOnline(user);
    console.log('user online status is ' , UserStatus)
   let status = 'offline';
   if(UserStatus != null){
     status = 'Online'
   }
  res.status(200).json({
    msg:'done',
    status
    
  })
  
  }catch(err){
    console.log(err)
    res.status(500).json({
      sucsses:false,
      err
    })
  }
}
const getOnlineAdmin = async(req , res)=>{
  console.log('get online admin api called')
  try{
  console.log('req==========>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>' , req.body)
    let UserId = req.body.UserId;
    let Admin=  "OnlineAdmin"+UserId;
    console.log(`user is ` , Admin);
    let UserStatus = await onlineUsermodule.IsAdminOnline(Admin);
    console.log('Admin online status is ' , UserStatus)
   let status = 'offline';
   if(UserStatus != null){
     status = 'Online'
   }
  res.status(200).json({
    msg:'done',
    status
    
  })
  
  }catch(err){
    console.log(err)
    res.status(500).json({
      sucsses:false,
      err
    })
  }
}

const OperationUpdate=  async(req , res)=>{
  console.log(`operation update api called `)
  try{
   console.log('data is ==== > ' , req.body)
    let eventId = req.body.eventId;
    let status = req.body.status;
    let message = req.body.message;
    let dataObj = req.body.obj;
   
    console.log('body data == > ') , req.body;
    if(!eventId || !status || !message) throw 'invalid request !'
    
   socket.emit('operation' ,{eventId , status, message ,dataObj})
    return res.status(200).json({
      msg:'inserted' , status
    })
  }catch(err){
    console.log('error' , err)
    res.status(500).json({
      err , msg:'can not inserted '
    })
  }
}

const SendNotificationToSingleUser = async( req ,res)=>{
console.log('SendNotificationToSingleUser api called !')
try{
  let eventId = req.body.eventId;
  let status = req.body.status;
  let  message = req.body.message;
  let ResponderId = req.body.ResponderId;
  let dataObj = req.body.obj;
 if(!eventId || !status || !message || !ResponderId || !dataObj ) throw ' invalid request !';
 let sendNotification = await socket.emit('SendNotificatioToAUser' , {eventId ,status ,message ,ResponderId ,dataObj  })
 console.log('send notification is ' , sendNotification)
 return res.status(200).json({
   msg:'send notification',
   sucsses:true
 })
}catch(err){
  console.log(err);
  res.status(500).json({
    sucsses:false,
    msg:'can not send notification !'
  })
}

}

const SendNotificationToSingleAdmin = async( req ,res)=>{
  console.log('SendNotificationToAdmin api called !')
  try{
    let eventId = req.body.eventId;
    let status = req.body.status;
    let  message = req.body.message;
    let UserId = req.body.AdminId;
    let dataObj = req.body.obj;
   if(!eventId || !status || !message || !UserId || !dataObj ) throw ' invalid request !';
   let sendNotification = await socket.emit('SendNotificatioToAdmin' , {eventId ,status ,message ,UserId ,dataObj  })
   console.log('send notification is ' , sendNotification)
   return res.status(200).json({
     msg:'send notification',
     sucsses:true
   })
  }catch(err){
    console.log(err);
    res.status(500).json({
      sucsses:false,
      msg:'can not send notification !'
    })
  }
  
  }
  const updateResponder = async(req ,res)=>{
    try{
     // socket.on('UpdateResponderOfEvent' , (data , callback)=>{
        let deleteResponder = req.body.deleteResponder;
        let responders = req.body.responders;
        let EventId = req.body.EventId;
        let SafeHouseId = req.body.SafeHouseId;
        let PreviousSafeHouseId = req.body.PreviousSafeHouseId;
      if(!deleteResponder || !responders  || !EventId || !SafeHouseId || !PreviousSafeHouseId) throw ' invalid request !';
      let updateEvent = socket.emit('UpdateResponderOfEvent' , {deleteResponder , responders ,EventId , SafeHouseId , PreviousSafeHouseId})
      res.status(200).json({
        msg:'updated sucssessfully !'
      })
    }catch(err){
      console.log(err);
      res.status(200).json({
        msg:'can not update repsonder !'
      })
    }
  }
app.use('/createRoomApi' , CreateRoomApi);
app.use('/IsUserOnline' , getOnlineUserList)
app.use('/OperationUpdate' , OperationUpdate )
app.use('/sendnotification' , SendNotificationToSingleUser);
app.use('/IsAdminOnline' , getOnlineAdmin);
app.use('/SendNotificationToSingleAdmin' , SendNotificationToSingleAdmin  )
app.use('/updateResponder' , updateResponder);


let GetAllResponders = async (responders) => {
  console.log('Get All Responder function called !' )
  console.log('responder in function is === > ' , responders)
  
  return new Promise((resolve, reject) => {
      try {

        let data = client.get(responders , async (err,reply)=>{
          if(err) console.log(err)
          console.log('responderlist before  are !' , reply);
          responderlist = JSON.parse(reply)
          console.log('responderlist are !' , responderlist);
          resolve(responderlist)
        })
 
      } catch (e) {
          return reject(e)
      }
  });
}
let GetAllrespondersList= async (responders)=>{
  console.log('responder in function is === > ' , responders)
  console.log('Getallresponderlist function called !');
  return new Promise((resolve, reject) => {
    try {
  let data = client.get(responders , async (err,reply)=>{
  if(err) console.log(err)
  console.log("get responder list before parse are -->" , reply)
  responderlist = JSON.parse(reply)
  console.log('responderlist are !' , responderlist);
  
  
       
      resolve(responderlist)
   }) }catch (e) {
        return reject(e)
    }
});
}

let checkForRadius = (data) => {
  console.log('Check For Radius Called');
  return new Promise((resolve, reject) => {
      try {
          if (data.length < 3) throw "Error! Length Cannot Be less Then 3";
          let distanceOne = getDistanceBetweenTwoPoints(data[0], data[1]);
          let distanceTwo = getDistanceBetweenTwoPoints(data[0], data[2]);
          let distanceThree = getDistanceBetweenTwoPoints(data[1], data[2]);
          // console.log('1 ==========> ', distanceOne, '2 =========> ', distanceTwo, '3 ============> ', distanceThree)
          let min = Math.min(distanceOne, distanceTwo, distanceThree);
          // console.log(min)
          if (min === distanceOne) {
              return resolve([data[0], data[1]]);
          } else if (min === distanceTwo) {
              return resolve([data[0], data[2]]);
          } else if (min === distanceThree) {
              return resolve([data[1], data[2]]);
          }
      } catch (e) {
          return reject(e)
      }
  });
}
let getDistanceBetweenTwoPoints = (cord1, cord2) => {
  console.log('Get Distance B/w Two Points')
  if (cord1.lat == cord2.lat && cord1.lng == cord2.lng) {
      return 0;
  }
  const radlat1 = (Math.PI * cord1.lat) / 180;
  const radlat2 = (Math.PI * cord2.lat) / 180;
  const theta = cord1.lng - cord2.lng;
  const radtheta = (Math.PI * theta) / 180;
  let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) {
      dist = 1;
  }
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  dist = dist * 1.609344; //convert miles to km
  return dist;
}


