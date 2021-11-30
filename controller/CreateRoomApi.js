
let methods = {

  //TO Create Room
  CreateRoomApi  :  async(req , res)=>{
    console.log('create room api called !')
    try{
      console.log('fazeel body' , req.body)
      let id = req.body.id;
      let name = req.body.name;
      let EventsRespinders = req.body.EventsRespinders;
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
  
      socket.emit('joinRoom' ,{id , name , responders , respondersOfEvent } )
  
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
  } , 
}

module.exports = methods