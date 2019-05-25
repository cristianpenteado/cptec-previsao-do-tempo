const express = require('express');
const app = express();

const port = 3000;

app.use(express.static('./src/public'));
app.set('views', './src/public');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use('/', (req, res) => {
    res.render('index.html');
});

app.listen(port, () => {
    console.log('Server on');
});