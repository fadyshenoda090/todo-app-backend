const jwt = require('jsonwebtoken')
const {promisify} = require('util')

const auth = async (req,res,next)=>{
    const {token} = req.headers
    if(!token){
        return res.status(401).json({error: 'you must be logged in'})
    }
    try{
    // await promisify(jwt.verify(token,process.env.SECRET))
        const decoded =await promisify(jwt.verify)(token,process.env.SECRET)
        req.id=decoded.id
        next()
    }catch (err){
        return res.status(401).json({error: 'you must be logged in'})
    }
}

module.exports = {auth}