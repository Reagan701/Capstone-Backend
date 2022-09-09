function errorHandeling (err,req,res, next){
    if(err){
        res.send(400).send(err.message);
    }
    next();
}

module.exports = {errorHandeling};