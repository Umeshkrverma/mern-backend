const app = require('./app');
const dotenv = require('dotenv');
const databaseconnector = require('./config/database');

// 1. uncaught error

process.on("uncaughtException",(err)=>{
    console.log(`Error:${err.message}`);
    console.log(`shutting down server due to uncaughtException error`)
    process.exit(1)
})


// 2. port configuration
dotenv.config({path:`backend/config/config.env`})


//3. connecting to mongodb
databaseconnector();
const server = app.listen(process.env.PORT, ()=>
console.log(`server is working on http://localhost:${process.env.PORT}`)
)

// 4. unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message} `)
    console.log(`shutting down server due to unhandled promise rejection`)
    server.close(()=>{
        process.exit(1)
    })
})