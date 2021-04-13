const fs = require('fs');
const path = require('path');

class _Error {

    /**
     * the guard() method is used to prevent unhandled promise rejections from crashing the Node process
     * in production environments
     * 
     * @returns event handler
     */
    guard() {
        return process.on('unhandledRejection', (err, promise) => {
            this.log("#", `_Error Handler :>> Unhandled Promise Rejection[Promise: ${promise.toString()}] | Error: '${err}'`, 5);
        });
    };

    /**
     * 
     * the log() method safely logs errors so that they can be inspected and analysed during system maintenance/health-check operations
     * I usually prefer to log my errors in different files too (based on the error severity) but I'm leaving that out here because 
     * I do not want to over-optimize prematurely.
     * 
     * @param {string} thrower the file/line/function, etc that threw this error
     * @param {string} error the error message
     * @param {int} severity the severity of the error
     */
    log(thrower, error, severity) {
        const ERRORS = {
            1: "Undefined",
            2: "Request",
            3: "Source",
            4: "External service",
            5: "System/environment/process"
        };

        const logFilePath = path.join(__dirname, "../logs/errors.log.txt");
        const logMessage = 
`=========================================
    ERROR
Class: ${ERRORS[severity]}
Time: ${new Date().toLocaleString()}
At: ${thrower}
Reason: ${error}
`;
        fs.appendFile(
            logFilePath,
            logMessage,
            err => { if (err) throw err }
        );
    };
};

module.exports = new _Error();