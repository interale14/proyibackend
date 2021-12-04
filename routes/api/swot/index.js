const { parse } = require('dotenv');
var express = require('express');
var router = express.Router();
var SwotDao = require('./swot.dao');
var Swot = new SwotDao();
const mailSender = require("../../../utils/mailer");

//New
router.post('/new', async (req, res, next) =>{
  try{
    const {
      title,
      message,
      to
    } = req.body;
    const userE = await Swot.getUser(req.user._id);

    const result = await Swot.addNew(title, message, to, req.user._id);

    mailSender(
      to, 
      title, 
      `<p>${message}</p><p>De: ${userE.email}</p><br/><br/><b>Enviado a través de: <i>Nostalgia Drive</i></b>`
      );

    console.log(result);
    res.status(200).json({msg:"Agregado exitosamente"});

  }catch (ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by User
router.get('/list', async (req, res, next)=>{
  try{
    const allSwotEntries = await Swot.getAll(req.user._id);

    //console.log(req.user);
    return res.status(200).json(allSwotEntries);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by Title
router.get('/bytitle/:title', async (req, res, next) =>{
  try{
    const {title} = req.params;
    const swots = await Swot.getByTitle(title, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by Receptor
router.get('/byreceptor/:receptor', async (req, res, next) =>{
  try{
    const {receptor} = req.params;
    const swots = await Swot.getByReceptor(receptor, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Get by Message ID
router.get('/getid/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const SwotEntry = await Swot.getid(id);
    return res.status(200).json(SwotEntry);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Find & Items per page
router.get('/facet/:page/:items', async (req, res, next)=> {
  try {
    let {page, items}  = req.params;
    page = parseInt(page) || 1;
    items = parseInt(items) || 10;

    const swots = await Swot.getByFacet('', page, items, req.user._id);

    return res.status(200).json(swots);
  } catch (ex) {
    console.log(ex);
    return res.status(500).json({ msg: "Error al procesar petición" });
  }
}); // facet

//Get by Date
router.get('/bydate/:date1/:date2/:extremes', async (req, res, next) =>{
  try{
    const {lower, upper, extremes} = req.params;
    const filter = (parseInt(extremes) > 0) ?  {
      swotRelevance: {
        "$gte": parseFloat(lower),
        "$lte": parseFloat(upper),
      }
    }
    :
    {
      swotRelevance: {
        "$gt": parseFloat(lower),
        "$lt": parseFloat(upper),
      }
    };
    const swots = await Swot.getWithFilterAndProjection(filter, {});
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Aggregate Data
router.get('/dashboard', async (req, res, next) =>{
  try{
    const swots = await Swot.getAggregatedData(req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

//Update by ID
router.put('/update/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const {message, to} = req.body;
    const result = await Swot.updateMessage(message, to, id);
    console.log(result);
    return res.status(200).json({msg:"Actualizado"});
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al actualizar"});
  }
});

//Delete by ID
router.delete('/delete/:id', async (req, res, next) =>{
  try{
    const {id} = req.params;
    const result = await Swot.deleteById(id);
    console.log(result);
    return res.status(200).json({msg:"Eliminado"});
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al eliminar"});
  }
});

router.get('/fix', async (req, res, next) =>{
  try{
    let swots = await Swot.getWithFilterAndProjection(
      {},
      {_id:1, swotRelevance:1}
    );
    swots.map( async (o) => {
      await Swot.updateRelevanceRandom(o._id);
    });
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

router.get('/facet/:page/:items/:text', async (req, res, next) =>{
  try{
    let {page, items, text} = req.params;
    page = parseInt(page) || 1;
    items = parseInt(items) || 10;
    
    const swots = await Swot.getByFacet(text, page, items, req.user._id);
    return res.status(200).json(swots);
  }catch(ex){
    console.log(ex);
    return res.status(500).json({msg:"Error al procesar petición"});
  }
});

module.exports = router;