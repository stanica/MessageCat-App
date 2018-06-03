'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:8080',
    SESSION_SECRET: 'messagecat-secret',

    FACEBOOK_ID: '246755676070474',
    FACEBOOK_SECRET: '12f190f622754ad9aa9d85e4063c0632',

    TWITTER_ID: 'app-id',
    TWITTER_SECRET: 'secret',

    GOOGLE_ID: 'app-id',
    GOOGLE_SECRET: 'secret',

    // Control debug level for modules using visionmedia/debug
    DEBUG: ''
};
//# sourceMappingURL=local.env.js.map
