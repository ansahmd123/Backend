const express = require("express");
const User = require("../models/User");
const bcrypt=require('bcryptjs');
const { body, validationResult } = require("express-validator");
const router = express.Router();
const jwt=require('jsonwebtoken');
const fetchuser=require('../middleware/fetchuser')



const JWT_SECRET='Harryisagoodbooy';

// Route 1:create a user using: POST "api/auth/createuser",Doesnt require auth.no login required
router.post("/createuser",
  [
    body("name", "Enter valid name!").isLength({ min: 3 }),
    body("email", "Enter valid email").isEmail(),
    body("password", "Password must be at least 5 characters").isLength({min: 5,}),
  ],
  async (req, res) => {
    let success=false;
    // if errors, return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success,errors: errors.array()});
    }
    // check whether the user with email exist or not
    try {
      let user = await User.findOne({email: req.body.email});
      if (user) {
        return res.status(400).json({success,error: "User with this email already registered"});
      }
      const salt =await bcrypt.genSalt(10);
      const secPass=await bcrypt.hash(req.body.password,salt);
      //   create a new user
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        // password: req.body.password,
        password:secPass,
      });
      const data={
        user:{
          id:user.id
        }
      }
      const authToken=jwt.sign(data,JWT_SECRET);
      success=true;
      res.json({success,authToken})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured");
    }
  }
);

//Route 2: authenticate a user using POST: "api/auth/login", no login required
router.post("/login",
  [
    body("email", "Enter valid email").isEmail(),
    body("password", "Password cannot be blanked").exists(),
  ], async(req,res)=>{

    let success=false;
    
    // error check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({errors: errors.array()});
    }
    const {email,password}=req.body;
    try {
      let user=await User.findOne({email});
      if(!user){
        success=false;
        return res.status(400).json({success,error:"Email is not registered with us, Please sign up"});
      }
      const passwordCompare=await bcrypt.compare(password,user.password);
      if(!passwordCompare){
        success=false;
        return res.status(400).json({success,error:"Please enter the right password"});
      }
      const data={
        user:{
          id:user.id
        }
      }
      const authToken=jwt.sign(data,JWT_SECRET);
      success=true;
      res.json({success,authToken});

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured");
    }
  })


  // Route 3:get logged in user details using POST:'api/auth/getuser', login required
  router.post("/getuser",fetchuser, async(req,res)=>{  
    try {
      const userId=req.user.id;
      const user=await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error occured");
    }
  })



module.exports = router;
