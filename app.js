const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const expressRateLimit = require('express-rate-limit');
const swaggerUI = require('swagger-ui-express');

require('dotenv').config();

const { ALLOWED_ORIGINS, MAX_REQUESTS_PER_TIME } = require('./constants/constants');
const CustomError = require('./errors/customError');
const cronJobs = require('./crons');
const Sentry = require('./errors/sentry');
const { sentryService } = require('./services');
const { swaggerJson } = require('./docs');
const { usersRouter, authRouter, laptopRouter } = require('./routers');
const { userService } = require('./services');

mongoose.connect(process.env.MONGODB_URI);

const app = express();

app.use(cors({ origin: _corsConfiguration }));

app.use(expressRateLimit({
    windowMs: 10 * 60 * 1000,
    max: MAX_REQUESTS_PER_TIME
}));

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/docs', swaggerUI.serve, swaggerUI.setup(swaggerJson));

app.use(fileUpload());

if (process.env.NODE_ENV === 'dev') {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const morgan = require('morgan');

    app.use(morgan('dev'));
}

app.use('/auth', authRouter);

app.use('/users', usersRouter);

app.use('/laptops', laptopRouter);

app.use(_errorHandler);

// eslint-disable-next-line
function _errorHandler(err, req, res, next) {
    const { message = 'Something wrong', status = 500 } = err;

    return res
        .status(status)
        .json({
            message
        });
}

function _corsConfiguration(origin, cb) {
    const allowedOrigins = ALLOWED_ORIGINS.split('&');

    if (!origin) {
        return cb(null, true);
    }

    if (!allowedOrigins.includes(origin)) {
        return cb(new CustomError('Forbidden'), false);
    }

    return cb(null, true);
}

app.listen(process.env.PORT, () => {
    console.log(`Server run at port ${process.env.PORT}`);
    // userService.createDefaultAdmin();
    // cronJobs();
});
