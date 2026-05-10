const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const validator = require('validator');

const generateToken = (userId) =>{
  return jwt.sign({id: userId}, process.env.JWT_SECRET, {expiresIn: '7d'});
}

const register = async(req,res) =>{
  try{
    const {name, email, password} = req.body;

    if(!name || !email || !password){
      return res.status(400).json({message: "Missing details"});
    }

    if(!validator.isEmail(email)){
      return res.status(400).json({message: "Invalid email format"});
    }

    if(password.length < 8){
      return res.status(400).json({message: "Password must be at least 8 characters long"});
    }

    const existingUser = await User.findOne({email});
    if(existingUser){
      return res.status(400).json({message: "Email already in use"});
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.status(201).json({ token, user: {id: user._id, name: user.name, email: user.email, profileImage: user.profileImage} });
  }
  catch(error){
    res.status(500).json({message: "Internal server error"});
  }
}

const login = async(req,res) =>{
  try{
    const {email, password} = req.body;
    if(!email || !password){
      return res.status(400).json({message: "Missing email or password"});
    }
    const user = await User.findOne({email});

    if(!user){
      return res.status(400).json({message: "Invalid email or password"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return res.status(400).json({message: "Invalid email or password"});
    }

    const token = generateToken(user._id);
    res.status(200).json({ token, user: {id: user._id, name: user.name, email: user.email, profileImage: user.profileImage} });
  }
  catch(error){
    res.status(500).json({message: "Internal server error"});
  }
}

module.exports = {
  register,
  login
};