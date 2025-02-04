import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://rohanwagh52005:6iIDo7fC20778zWL@cluster0.c70xh.mongodb.net/CodeEditor').then(()=>{
       console.log('DB connected') ;
    })
}

