var conn = require('../../../utils/dao');
var ObjectID = require('mongodb').ObjectId;
var _db;
class Swot{
  swotColl =null;
  constructor(){
    this.initModel();
  }
  async initModel(){
     try {
      _db = await conn.getDB();
       this.swotColl = await _db.collection("messages");
    }catch(ex){
      console.log(ex);
      process.exit(1);
    }
  }

  //New
  async addNew(title, message, to, id){
    let newSwot = {
      title, 
      message, 
      to,
      date: new Date().getTime(),// + (30 * 24 * 60 * 60 * 1000),
      senddate: new Date().getTime() + (30 * 24 * 60 * 60 * 1000),
      user: id,
    }
    let result = await this.swotColl.insertOne(newSwot);
    return result;
  }

  //Get by user
  async getAll(id){
    const filter = {"user": id}
    let swots = await this.swotColl.find(filter);
    return swots.toArray();
  }

  //Get by title
  async getByTitle(title, userId){
    const filter = {"title":RegExp(title, 'g'), "user": userId};
    let cursor = await this.swotColl.find(filter);
    return cursor.toArray();
  }

  //Get by Receptor
  async getByReceptor(receptor, userId){
    const filter = {"to": RegExp(receptor, 'g'), "user": userId};
    let cursor = await this.swotColl.find(filter);
    return cursor.toArray();
  }

  //Get by message id
  async getid(id){
    const filter = {"_id": new ObjectID(id)};
    let swotDocument = await this.swotColl.findOne(filter);
    return swotDocument;
  }

  //Get by message & Items per page
  async getByFacet(textToSearch, page, itemsPerPage, userId){
    const filter = {"message": RegExp(textToSearch, 'g'), "user": userId};
    
    let cursor = await this.swotColl.find(filter);
    let docsMatched = await cursor.count();
    cursor.skip((itemsPerPage * (page - 1)));
    cursor.limit(itemsPerPage);
    let documents = await cursor.toArray();
    
    return {
      docsMatched,
      documents,
      page,
      itemsPerPage
    };
  }
  
  //Update message
  async updateMessage(message, to, id){
    let filter = {"_id": new ObjectID(id)};
    let updateJson = {
      "$set" : {"message": message, "to": to, "senddate": new Date().getTime() + (30 * 24 * 60 * 60 * 1000), "date": new Date().getTime()}
    };
    let result = await this.swotColl.updateOne(filter, updateJson);
    return result;
  }

  //Delete message
  async deleteById(id){
    let filter = {"_id": new ObjectID(id)};
    let result = await this.swotColl.deleteOne(filter);
    return result;
  }

  //Filter
  async getWithFilterAndProjection(filter, projection){
    let p = {
      "projection": projection
    }
    let swots = await this.swotColl.find(filter, p);
    return swots.toArray();
  }

  async updateRelevanceRandom(id){
    const filter = {"_id": new ObjectID(id)};
    const updateAction = {"$set": {swotRelevance: Math.round(Math.random()*100)/100}};
    let result = await this.swotColl.updateOne(filter, updateAction);
    return result;
  }

  async getAggregatedData(userId){
    const PipeLine = [
      {
        '$match': {
          'user_id': new ObjectID(userId)
        }
      }, {
        '$group': {
          '_id': '$swotType', 
          'swotTypeCount': {
            '$sum': 1
          }
        }
      }, {
        '$sort': {
          '_id': 1
        }
      }
    ];
    const cursor = this.swotColl.aggregate(PipeLine);
    return await cursor.toArray();
  }
}

module.exports = Swot;