import { NextFunction,Request,Response } from "express";
import jwt from  "jsonwebtoken"
import { JWT_SECRETE } from "./config";
import { ObjectId } from 'mongodb'; 

export const authMiddleWare =  (req:Request,res:Response,next:NextFunction)=>{
    try{
        const header = req.headers["authorization"];
       
        
        if(!header ){
          res.json({message: "Header is missing"})
        }
        
        if(header !== undefined){
            
            const token = header 
            const decoded = jwt.verify(token, JWT_SECRETE) as { id: string }; // id is typically a string in JWT

            // Attach the userId to the request object
            req.userId = new ObjectId(decoded.id);
            next();
        }
      

       
        

    }catch(e){
        res.status(401).json({ message: 'Invalid or expired token', e });
    }
    
}