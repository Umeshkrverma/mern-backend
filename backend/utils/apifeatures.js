class Apifeature{
    constructor(query, querystr){
        this.query= query,
        this.querystr = querystr 
    }
    // method for searching an item using name.
    search(){
        const keyword = this.querystr.keyword?{
            name:{
                $regex:this.querystr.keyword,
                $options:'i'
            }
        }:{}
        this.query = this.query.find({...keyword});
        return this
    }
    //filtering products 
    filter(){
        //remove some fields
        let queryCopy = {...this.querystr}
        let removeFields = ["keyword","page","limit"]; // items to remove from objects
        removeFields.forEach(key=>delete queryCopy[key])
        // filter for price and reviews
        let querystr = JSON.stringify(queryCopy);
        querystr = querystr.replace(/\b(lt|gt|lte|gte)\b/g, key=>`$${key}`);
        this.query = this.query.find(JSON.parse(querystr))
        return this
    }
    //pagination feature..
    pagination(resultperpage){
        const currentpage = Number(this.querystr.page)||1;  //current page we are on
        const skip = resultperpage * (currentpage-1);       //skiping results per page
        this.query = this.query.limit(resultperpage).skip(skip);
        return this
    }
}


module.exports = Apifeature;