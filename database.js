const mongoose = require('mongoose');

class Database {

    constructor(){
        this.connect();        
    }

    connect() {
        mongoose.connect('mongodb+srv://dovydmcnugget:Davidv98!@socialclonecluster.zos7k.mongodb.net/socialDB?retryWrites=true&w=majority')
            .then(() => {
                console.log('db connected')
            })
            .catch((err) => {
                console.log('db had an error connecting: ' + err)
            })
    }
}

module.exports = new Database();