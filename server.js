const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({
  path: './config.env',
});

const app = require('./app');

// Cloud Database
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('Database connected!'));

const server = app.listen(process.env.PORT, () => {});

process.on('unhandledRejection', (err) => {
  console.log('UNCAUGHT EXCEPTION! ..Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! ..Shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
