const jwt = require("jsonwebtoken")

function authenticateTokenPatient(req,res,next){
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if(!token){
        return res.status(401).json({error:"Unauthorised",details:"Token not provied"})
    }
    jwt.verify(token,"jwt.Secret",(err,decoded) => {
        if(err){
            return res.status(403).json({error:"Forbidden",details:err.message})
        }
        req.patient = decoded
        next()
    })
}

function authenticateTokenDoc(req,res,next){
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]
    if(!token){
        return res.status(401).json({error:"Unauthorised",details:"Token not provied"})
    }
    jwt.verify(token,"jwt.Secret",(err,decoded) => {
        if(err){
            return res.status(403).json({error:"Forbidden",details:err.message})
        }
        req.doctor = decoded
        next()
    })
}


module.exports = {authenticateTokenPatient,authenticateTokenDoc}