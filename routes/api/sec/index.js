const express = require("express");
let router = express.Router();
const jwt = require("jsonwebtoken");
const mailSender = require("../../../utils/mailer");
let SecModelClass = require('./sec.model.js');
let SecModel = new SecModelClass;
let secRecoveryCode = 0;
let secRecoveryEmail = "";

router.post('/login', async (req, res, next)=>{
    try{
        const {email, pswd} = req.body;
        let userLogged = await SecModel.getByEmail(email);
        if(userLogged){
          const isPswdOk = await SecModel.comparePasswords(pswd, userLogged.password);
          if(isPswdOk){
            delete userLogged.password;
            delete userLogged.oldpassword;
            delete userLogged.lastlogin;
            delete userLogged.lastpasswordchange;
            let payload = {
              jwt: jwt.sign(
                {
                  email: userLogged.email, 
                  _id: userLogged._id,
                  roles: userLogged.roles 
                },
                process.env.JWT_SECRET,
                {expiresIn:'1d'}
              ),
              user: userLogged
            };
            return res.status(200).json(payload);
          }
        }
        console.log(email, userLogged);
        return res.status(400).json({msg:"Credenciales no válidas"});
      }catch(ex){
        console.log(ex);
        return res.status(500).json({"msg":"Error"});
      }
  }
);

router.post('/signin', async (req, res, next)=>{
    try{
        const {email, pswd} = req.body;
        let userAdded = await SecModel.createNewUser(email, pswd);
        delete userAdded.password;
        console.log(userAdded);

        return res.status(200).json({"msg":"Usuario creado"});
      }catch(ex){
        console.log(ex);
        return res.status(500).json({"msg":"Error"});
      }
  }
);

router.post('/passrecovery', async (req, res, next)=>{
  try{
    const {email} = req.body;
    let userExists = await SecModel.getByEmail(email);
    secRecoveryEmail = email;
    if(userExists){
      const code = [
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10),
        Math.floor(Math.random()*10)
      ].toString();
      secRecoveryCode = code.replace(/,/g,"");
      mailSender(
        "ale-interiano@hotmail.com",
        "Recuperación de contraseña",
        `<h1>Importante</h1><p>No comparta este código con nadie más.</p><br/><p><b>${secRecoveryCode}</b></p>`
      );
      res.status(200).json({msg:"Email enviado"});
    }
    else
    {
      return res.status(500).json({"msg":"Usuario inexistente"});
    }
  }catch(ex){
    console.log(ex);
    return res.status(500).json({"msg":"Error"});
  }
})

router.post('/passrecoveryverify', async (req, res, next)=>{
  try{
    const {code} = req.body;
    let codeVerify = await SecModel.codeVerification(code,secRecoveryCode);
    if (codeVerify){
      secRecoveryCode = "";
      return res.status(200).json({"msg":"Verificación exitosa"});
    }
    else{
      return res.status(500).json({"msg":"Código incorrecto"});
    }
  }catch(ex){
    console.log(ex);
    return res.status(500).json({"msg":"Error"});
  }
})

router.post('/newpassword', async (req, res, next)=>{
  try{
    const {pswd, confirm} = req.body;
    if(pswd == confirm){
      const newPswdConfirm = await SecModel.newPswdConfirmation(pswd,secRecoveryEmail);
      return res.status(200).json(newPswdConfirm);
    }else{
      return res.status(500).json({"msg":"Contraseñas no coinciden"});
    }
  }catch(ex){
    console.log(ex);
    return res.status(500).json({"msg":"Error"});
  }
})


module.exports = router;