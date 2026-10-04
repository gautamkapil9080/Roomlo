
class ExpressError  extends Error{
    constructor(statusCode,message){
        super(message);
        this.statusCode=statusCode;
        this.status=statusCode;
        this.message=message;
        this.expose=statusCode < 500;
    }
}

module.exports=ExpressError;
