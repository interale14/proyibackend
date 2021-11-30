var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
const bcrypt = require("bcryptjs");
var _db;
class Sec{
  secColl =null;
  constructor(){
    this.initModel();
  }
  async initModel(){
     try {
      _db = await conn.getDB();
       this.secColl = await _db.collection("users");
    }catch(ex){
      console.log(ex);
      process.exit(1);
    }
  }

  async createNewUser(email, password){
    try {
        let user = {
            email: email,
            password: await bcrypt.hash(password,10),//encripta 10 veces
            lastlogin: null,
            lastpasswordchange: null,
            passwordexpires: new Date().getTime() + (90 * 24 * 60 * 60 * 1000),
            oldpassword: [],
            roles: ["public"],
        }
        let result = await this.secColl.insertOne(user);
        return result;
    } catch (ex) {
        console.log(ex);
        throw(ex);
    }
  }

  async getByEmail(email){
    const filter = {"email": email};
    return await this.secColl.findOne(filter);
  }

  async getIdByEmail(email){
    const filter = {"email": email};
    let user = await this.secColl.findOne(filter);
    return user.id;
  }

  async comparePasswords(rawpassword, dbpassword){
      return await bcrypt.compare(rawpassword, dbpassword);
      
  }

  async codeVerification(code, secCode){
    if(code == secCode){
      return true;
    }
    else{
      return null;
    }
  }

  async newPswdConfirmation(pswd,email){
    try{
      let filter = {"email": email};
      const newPswd = await (await bcrypt.hash(pswd,10)).toString();
      let updateJson = {
        "$set" : {
          password: newPswd,
          passwordexpires: new Date().getTime() + (90 * 24 * 60 * 60 * 1000),
        }
      };
      let result = await this.secColl.updateOne(filter, updateJson);
      return result;
    } catch (ex) {
      console.log(ex);
      throw(ex);
    }
  }
}

module.exports = Sec;