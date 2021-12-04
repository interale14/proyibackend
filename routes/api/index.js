var express = require('express');
var router = express.Router();

const passport = require('passport');
const passportJWT = require('passport-jwt');
const extractJWT = passportJWT.ExtractJwt;
const strategyJWT = passportJWT.Strategy;


passport.use(
  new strategyJWT(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET
    },
    (payload, next) => {
      return next(null, payload);
    }
  )
);

const jstMiddleware = passport.authenticate('jwt', {session:false});

router.use(passport.initialize());

var swotRouter = require('./swot/index');
var secRouter = require('./sec/index');


router.get('/', (req, res, next)=>{
    res.status(200).json({"msg":"Api V1 JSON"});
  }
);

router.use('/swot', jstMiddleware, swotRouter);
router.use('/sec', secRouter);


/*
router.get("/users/:userId", async function (req, res) {
    const params = {
      TableName: USERS_TABLE,
      Key: {
        userId: req.params.userId,
      },
    };
  
    try {
      const { Item } = await dynamoDbClient.get(params).promise();
      if (Item) {
        const { userId, name } = Item;
        res.json({ userId, name });
      } else {
        res
          .status(404)
          .json({ error: 'Could not find user with provided "userId"' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not retreive user" });
    }
});
  
router.post("/users", async function (req, res) {
    const { userId, name } = req.body;
    if (typeof userId !== "string") {
      res.status(400).json({ error: '"userId" must be a string' });
    } else if (typeof name !== "string") {
      res.status(400).json({ error: '"name" must be a string' });
    }
  
    const params = {
      TableName: USERS_TABLE,
      Item: {
        userId: userId,
        name: name,
      },
    };
  
    try {
      await dynamoDbClient.put(params).promise();
      res.json({ userId, name });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Could not create user" });
    }
});
  
router.use((req, res, next) => {
    return res.status(404).json({
      error: "Not Found",
    });
});*/

router.get("/hello", (req, res, next) => {
    return res.status(200).json({
      message: "Hello from path!",
    });
});
  
router.use((req, res, next) => {
    return res.status(404).json({
      error: "Not Found",
    });
});


module.exports = router;