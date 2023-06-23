const jwt = require('jsonwebtoken');


exports.verifyJWT = async (req,res,next)=>{

    try{
        const user = await jwt.verify(req.query.token,process.env.JWT_SECRET);
        req.user = user;
    next();
    }catch(excepction){ res.status(200).json({status:0,message:"Invalid Token Please Try With New Link"})}
    
}