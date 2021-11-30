var filter = {}
var updateAction = {"$set":{"swotRelevance": 0}}
db.SWOT.updateMany(filter, updateAction)
