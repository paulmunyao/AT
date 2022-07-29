require('dotenv').config({
    path: './.env',
});
const Menu = require('./constants/index')
const port = process.env.PORT || 9000;
const express = require('express');
const path = require('path');

let indexRoutes = require('./routes/index.js');

const main = async () => {
    const app = express();

    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'ejs');

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.static(path.join(__dirname, 'public')));

    app.use('/', indexRoutes);
    app.use('*', (req, res) => res.status(404).send('404 Not Found'));

    console.log(Menu["1"]);
    app.listen(port, () => console.log(`App running on port ${port}`));
};
main();
