const mongoose = require('mongoose');

const db_connect = async() => {
   const data = await mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true})
   console.log(`mongodb is connected to :${data.connection.host}`);
    }


module.exports = db_connect;