config = require('../DB');


let createUser = (criteria, callback) => {
  config.getDB().query(`insert into user set ? `, criteria, callback);
  console.log("insert into user set ? ", criteria);
}

// Api For user login..
let getUserByEmail = (criteria, callback) => {
  let conditions = "";
  criteria.email ? conditions += ` email = '${criteria.email}'` : true;
  config.getDB().query(`select * from user where ${conditions}`, callback);
}

let insertOtp = (dataToset, callback) => {
  let setData = dataToset.otp;
  let conditions = '';
  dataToset.email ? conditions += `email = '${dataToset.email}'` : true
  config.getDB().query(`UPDATE user set otp = ${setData} where ${conditions}`, callback)
}

let getContact = (criteria,callback) => {
  let conditions = ''
  criteria.otp ? conditions += ` otp = '${criteria.otp}'` : true
  config.getDB().query(`select otp, email from user where ${conditions}`,criteria, callback)
}

let getAllBlood = (criteria,callback) => {
  config.getDB().query(`select user_id, fname, bgroup, username, city, state from user`,criteria, callback);
}

let getUser = (criteria, callback) => {
  config.getDB().query(`select * from user`, criteria, callback);
}

let getUserById = (criteria,paramsdata, callback) => {
  let conditions = ' ';
  paramsdata.user_id ? conditions += `user_id = '${paramsdata.user_id}'` : true;
  config.getDB().query(`select * from user where ${conditions}`,callback);
}

let deleteUser = (criteria, paramsid, callback) => {
  let conditions = "";
  paramsid.id ? conditions += `user_id = '${paramsid.id}'` : true;
  //console.log(`delete from article where 1 ${conditions}`);
  config.getDB().query(`delete from user where ${conditions}`, callback);
}

let updateUser = (criteria, params, callback) => {
  let conditions = "";
  let setData = "";
  params.id ? conditions += ` user_id = '${params.id}'` : true;
  Object.keys(criteria).forEach(function (k) {
    // console.log(k + ' - ' + criteria[k]);
    setData += k + ' = "' + criteria[k] + '",';
  });
  setData = setData.substring(0, setData.length - 1);
  // console.log(`UPDATE user SET ${setData} where ${conditions}`);
  config.getDB().query(`UPDATE user SET  ${setData} where ${conditions}`, callback);
}

let forgetPassword = (criteria, callback) => {
  let conditions = "";
  let setData = "";
  criteria.email ? conditions += `email = '${criteria.email}'` : true;
  criteria.password ? setData += `password = '${criteria.password}'` : true;
  config.getDB().query(`UPDATE user SET  ${setData} where ${conditions}`, callback);
  console.log(`UPDATE user SET ${setData} where ${conditions}`);
}





module.exports = {
  getUser: getUser,
  getUserById: getUserById,
  createUser: createUser,
  deleteUser: deleteUser,
  updateUser: updateUser,
  getUserByEmail: getUserByEmail,
  getAllBlood: getAllBlood,
  forgetPassword: forgetPassword,
  insertOtp: insertOtp,
}
