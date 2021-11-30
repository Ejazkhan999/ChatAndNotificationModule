const axios = require('axios');
const api = 'http://'+process.env.API_END_POINT;

// ********************
// Socket IO Methods
// ********************
// on Connect
console.log(process.env.domain)
const connectionFunction = (socket) => {
  console.log(`socket server connected `)

}
const ValidateResponder = (socket)=>{
  
return new Promise ( async (resolve , reject)=>{

  try{
    
  const response = await axios.post(`${api}/api/socket/validate`,
   {
    headers: { Authorization: `Bearer ${socket.token}` },
  } 
  )
  console.log('response ' , response);



    resolve(true)
  }catch(err){
    reject(err)
  }
});

  
  //call apoi for validateion
  //if succsess then next
  //else disconnect 
}
// on Disconnect
const disconnectFunction = (socket) => {
  console.log('disconnect !')
}




module.exports =  {
  connectionFunction,
  disconnectFunction ,
  ValidateResponder
};