const userModel = require("./models/userModel.js");
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');


const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'2d'})
}


exports.registerUser=async(req,res)=>{
    const {name,password,email} = req.body;
    try{

        const exists=await userModel.findOne({email});
        if(exists){
            return res.json({success:false, message:'User already exists'})
        }

        if(!validator.isEmail(email)){
            return res.json({success:false, message:'Please enter a valid email'})
        }

        if(password.length<8){
            return res.json({success:false, message:'Please enter a strong password'})
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser=new userModel({
            name:name,
            email:email,
            password:hashedPassword,
        })

        const user=await newUser.save();
        // Registeration ke vakt token kyu banaya h ?
        const token=createToken(user._id);
        res.json({success:true, token,message:'User registered successfully', user:user});



    }catch(error){
        console.log(error);
        res.json({success:false, message:'Error'})
    }

}

exports.loginUser=async(req,res)=>{
    const {email,password}=req.body;
    try{
        const user=await userModel.findOne({email});

        if(!user){
            return res.json({success:false, message:'User does not exist'}) 
         }

         const isMatch = await bcrypt.compare(password,user.password);

        if(!isMatch){
            return res.json({success:false, message:'Invalid credentials'})
        }

        const token = createToken(user._id);
        res.json({success:true, token, message:'User logged in successfully', user:user});


    }catch(error){
        console.log(error);
        res.json({success:false, message:'Error'})
    }

}


