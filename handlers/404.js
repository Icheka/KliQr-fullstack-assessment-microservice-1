const express = require('express');
const route = express.Router();
const _Http = require('./Http.class');

route.all('*', (req, res, next) => {
    _Http.log(req);
    _Http.emit(res, 404, null, `The route '${req.originalUrl}' does not exist on the server`);
});

module.exports = route;