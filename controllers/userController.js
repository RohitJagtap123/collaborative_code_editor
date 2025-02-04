import userModel from "./models/userModel.js";
import bcrypt from 'bcrypt'
import validator from 'validator'
import jwt from 'jsonwebtoken'

const createToken = (id) =>{
    return jwt.sign({id},process.env.JWT_SECRET,{expiresIn:'2d'})
}


const registerUser=async(req,res)=>{
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
        const token=createToken(user._id);
        res.json({success:true, token,message:'User registered successfully', user:user});



    }catch(error){
        console.log(error);
        res.json({success:false, message:'Error'})
    }

}
const loginUser=async(req,res)=>{
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

export {registerUser,loginUser}
