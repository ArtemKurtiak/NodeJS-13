const Sentry = require('@sentry/node');
const { SENTRY_URL } = require('../constants/constants');

Sentry.init({
    dsn: SENTRY_URL
});

module.exports = Sentry;
