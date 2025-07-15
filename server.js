
const http = require("http");
require('dotenv').config()
const port = process.env.PORT || 3000;

const app = require('./src/server/app');
require('./src/config/db/dbConnect')
require("./src/config/cron")
const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running at port ${port}`);
});

process.on('SIGINT', function () {

    console.log(' server closed');
    process.exit(1);
});

