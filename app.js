require('dotenv').config();
require('express-async-errors');
//express
const express = require('express');
const app = express();

//rest of packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');

//database
const connectDB = require('./db/connect');

//routes
app.get('/', (req, res) => {
  res.send('DBbuss API');
});
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 60,
  })
);
app.use(helmet());
app.use(morgan('tiny'));
app.use(xss());
app.use(mongoSanitize());
app.use(express.json()); // so we can access req.body

app.use(
  cors({
    origin: [
      'http://localhost:5173', //dev
      'https://buss-front.netlify.app', //prod
    ],
    credentials: true,
  })
);
app.use(cookieParser(process.env.JWT_SECRET));
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5000; // PORT variable to be accessed by heroku on deployemnt, local 5000.
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    app.listen(port, () => {
      console.log(`App listening on port ${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
