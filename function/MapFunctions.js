const client = require('../Connections/RedisConnection')


const UpdateStatusOfEventofMap = (eventId , status)=>{
  console.log('in function eventId --->' , eventId , 'status == > ' , status)
  return new Promise((resolve, reject) => {
    try {
      // let data = JSON.stringify(GetResponderData);
      let updateEventStatus = client.hmset('StatusOfEvent',eventId ,status,(err,reply)=>{
        if(err) console.log(err)
        console.log('Adrss responderMap data insertion' , reply)
        resolve(reply)
      })
    } catch (e) {
        return reject(e)
    }
});
}

const UpdateStatus= (responderId, eventId)=>{
console.log('UPDATE STATUS FUCTION CALLED ');
return new Promise ( async (resolve , reject)=>{

  try{
    let data = [ responderId, eventId ]
  let status = socket.emit('updatestatus' , ({data } , reply)=>{
    if(err) console.log(err);
    console.log('update status value with in functiion is ' , reply)
    resolve(reply)
  })


  // console.log('response ' , response);
    
  
  }catch(err){
    reject(err)
  }
});


};
const getResponderdataOnMap = ()=>{
return new Promise ( async (resolve , reject)=>{

  try{
     client.HGETALL("ResponderDataofEventOnMap",   (err , reply)=>{
  if(err) console.log('error ' , err)
  console.log('Responder data on map is ===============> ' , reply)
  
      resolve(reply)
});
  // console.log('response ' , response); 
  }catch(err){
    reject(err)
  }
});

}
let AddPathOfResponders = async(responderIdentifier ,pathdata )=>{
  console.log('addpathofResponders function called ')
  return new Promise((resolve, reject) => {
    try {
      let Responderdata = JSON.stringify(pathdata)
  let data = client.rpush(responderIdentifier,Responderdata ,async (e,reply)=>{
  if(e) console.log(e)
      resolve(reply)
   }) }catch (e) {
        return reject(e)
    }
});
}
CalculateAverageMapData = (RespondersList  ,GetResponderData) =>{
  console.log('CalculateAverage map data function called ')
  return new Promise((resolve, reject) => {
    try {
     console.log('get responder ' , GetResponderData);
     let mydata = [];
    

     for(let key in GetResponderData ){
       if(GetResponderData.hasOwnProperty(key)){
        mydata.push(GetResponderData[key])
       }
     }

    let lat = mydata.map(arr=>arr.lat)
    let lng = mydata.map(arr=>arr.lng)
     let TotalLat = 0;
     let TotalLng = 0;
    for(var i = 0; i < lat.length; i++){
      TotalLat = TotalLat+ lat[i]
    }
    for(var i = 0; i < lng.length; i++){
      TotalLng = TotalLng+ lng[i]
    }

    let averagelat = TotalLat/lat.length
    let averagelng = TotalLng / lng.length
    console.log('average lat and lng are '  , averagelng , averagelat)
    let pathdata=  {
      lat:averagelat,
      lng: averagelng
    }
    console.log('path data is ' , pathdata)
    let data = {}
    // let responderlength = RespondersList.length;
    // console.log('responder list is ' , RespondersList)

    for(let key in GetResponderData ){
      if(GetResponderData.hasOwnProperty(key)){
       GetResponderData[key] = pathdata
      }
    }
      resolve(GetResponderData)
    } catch (e) {
        return reject(e)
    }
});
}
let  UpdateDataOfMap = (EventkeyData ,GetResponderData)=>{
  console.log('Get AddDataInCaseOfGreaterStatus function called !' )
  
  return new Promise((resolve, reject) => {
      try {
        let data = JSON.stringify(GetResponderData);
        let AddResponderMapData = client.hmset(['ResponderDataofEventOnMap',EventkeyData,data],(err,reply)=>{
          if(err) console.log(err)
          console.log('Adrss responderMap data insertion' , reply)
          resolve(reply)
        })
 
      } catch (e) {
          return reject(e)
      }
  });

}
let GetAndReplaceResponderOldData= (eventId, responderId  , pathdata) => {
  // console.log('path data is ' , ResponderPath)
  // ResponderPath = JSON.parse(ResponderPath)
    console.log('get event old data api called !');
  return new Promise((resolve, reject) => {
      try {
        let GetEventOldData = client.hget(['ResponderDataofEventOnMap' , eventId] , (err,reply)=>{
         
          console.log('reply of reponder for first time dats is ' , reply)
         let testdata;
         DataIfFirstTime = {} 
          if(reply != null){
           
            let data = JSON.parse(reply);
            let x = responderId
            console.log('data 2 --->' ,data[x]);
            data[x] = pathdata;
            console.log('data 2 is now ' , data[x])
            // data.push({[`${responderId}`] : pathdata})
            console.log('dataa ' , data)
            testdata = data
          }
          else{
            let x = responderId
            // console.log('data 2 --->' ,data[x]);
            DataIfFirstTime[`${x}`]= pathdata
            testdata = DataIfFirstTime
          
          }
         
          resolve(testdata);
        })
 
      } catch (e) {
          return reject(e)
      }
  });
}
const GetStatusesOfallEventsForMap= ()=>{
  console.log('get all status of all events for map function called ')
  return new Promise ( async (resolve , reject)=>{
  
    try{
       client.HGETALL("StatusOfEvent",   (err , reply)=>{
    if(err) console.log('error ' , err)
    console.log('Responder data on map is ===============> ' , reply)
   
        resolve(reply)
  });
    // console.log('response ' , response); 
    }catch(err){
      reject(err)
    }
  });
}

module.exports = {
  GetStatusesOfallEventsForMap,
  UpdateStatusOfEventofMap,
  UpdateStatus,
  getResponderdataOnMap ,
  AddPathOfResponders,
  CalculateAverageMapData,
  GetAndReplaceResponderOldData,
  UpdateDataOfMap,

}