const HttpClass = require("../handlers/Http.class");
const _error = require("../handlers/Error.class");

function auth() {
    return async function (req, res, next) {
        const Http = new HttpClass();
        Http.log(req, "req");
        
        try {
            const authBearer = req.headers.bearer;
            const authHeader = req.headers.authorization;

            if (!authBearer || !authHeader) {
                Http.emit(res, 402, null, "Authorization header(s) absent in request.");
            };

        } catch(err) {
            _error.log("_auth()", `A system-level error occurred while authenticating:>> ${err}`, 5);
            Http.emit(res, 500, null, "An internal error occurred. Contact the site administrator.");
            return;
        };
    };
};

module.exports = auth;