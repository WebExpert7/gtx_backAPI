const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
const mysql_connection = require('./config/mysql_connection');
const mongoose = require('mongoose');
const config = require('./config/database');

// Connect To Database
mongoose.Promise = require('bluebird');
mongoose.connect(config.database, { promiseLibrary: require('bluebird') })
  .then(() => console.log(`Connected to database ${config.database}`))
  .catch((err) => console.log(`Database error: ${err}`));

const app = express();

// const users = require('./routes/users');
const gtx = require('./routes/gtx');
// const btc = require('./routes/btc');
// const toc = require('./routes/toc');
// const xrp = require('./routes/xrp');
// const trx = require('./routes/trx');
// const ada = require('./routes/ada');
// const xem = require('./routes/xem');
// const cms = require('./routes/cms');
// const alis = require('./routes/alis');
// const erc20 = require('./routes/erc20');

// Port Number
const port = 3000;

// CORS Middleware
app.use(cors());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.json());

// Passport Middleware
// app.use(passport.initialize());
// app.use(passport.session());

// require('./config/passport')(passport);

// app.use('/users', users);
app.use('/api/gtx', gtx);
// app.use('/api/btc', btc);
// app.use('/api/toc', toc);
// app.use('/api/xrp', xrp);
// app.use('/api/trx', trx);
// app.use('/api/ada', ada);
// app.use('/api/xem', xem);
// app.use('/api/cms', cms);
// app.use('/api/alis', alis);
// app.use('/api/erc20', erc20);

// Index Route
app.get('/', (req, res) => {
  res.send('Invalid Endpoint');
});

// Start Server
app.listen(port, () => {
  console.log('Server started on port '+port);
});