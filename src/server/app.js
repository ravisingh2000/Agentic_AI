const express = require('express');
const cors = require("cors");
const v1Routes = require("../v1/routes")
const app = express();


app.use(express.json({ limit: '16mb' }));;
app.use(express.urlencoded({ extended: false }));

const corsOptions = {
    "origin": ["http://localhost:4200"],
    "methods": "GET,POST,DELETE,OPTIONS",
    'allowedHeaders': ['Authorization', 'Content-Type'],
    "preflightContinue": false,
    "optionsSuccessStatus": 204,
    "credentials": true,
}
app.use(cors(corsOptions));



app.get('/', (req, res) => {
    res.json({ message: 'main route' })
});
app.use('/v1', v1Routes);

module.exports = app;