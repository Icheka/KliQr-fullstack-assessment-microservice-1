const dotenv = require("dotenv");
const mysql = require("mysql2");
const _Error = require('../handlers/Error.class');

dotenv.config();

// DEFINE HTTP STATUS CODES FOR POSSIBLES ERRORS THAT MIGHT BE THROWN 
// WHILE ATTEMPTING TO CONNECT TO
// THE MYSQL DATABASE
const MySQLToHTTPMap = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409,
});

class _Database {
    constructor() {
        this.conn = mysql.createPool({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASS || '',
            database: process.env.DB_DATABASE || 'kliqr_trends'
        });
        this.testConnection();
    };

    testConnection() {
        this.conn.getConnection((err, connection) => {
            if (err) {
                // THERE ARE SEVERAL REASONS WHY AN ERROR MIGHT OCCUR DURING A SERVER-DATABASE HANDSHAKE
                // SO...
                switch(err.code) {
                    case "PROTOCOL_CONNECTION_REFUSED":
                        _Error.log("#/db/index.js", "The connection to the database was destroyed.");
                        break;
                    case "ECONNREFUSED":
                        _Error.log("#/db/index.js", "The connection to the database was either rejected or didn't go through. Is the database server online?");
                        break;
                    case "ER_CON_COUNT_ERROR":
                        _Error.log(`The number of connections to the database has exceeded its limit.`);
                        break;
                    case "ENOTFOUND":
                        _Error.log("The remote database host was not found");
                        break;
                };
            }
            // IF THERE'S A CONNECTION DESTROY IT
            if (connection) connection.release();
            return;
        });
    };

    async query(sql, values) {
        return new Promise((resolve, reject) => {
            const callback = (err, result) => {
                if (err) {
                    reject(err);
                    return;
                };
                
                resolve(result);
            };
            let tmp_conn = new _Database();
            tmp_conn.conn.execute(sql, values, callback);

        }).catch(databaseError => {
            // CREATE AN ARRAY OF POSSIBLE DATABASE ERRORS AT THIS POINT 
            // THE GOAL IS TO HAVE FLEXIBILITY IN CHOOSING HOW TO HANDLE SUCH ERROR(S)
            // FOR EXAMPLE, ONE CAN EASILY RESPOND (TO THE ORIGINAL REQUEST) WITH A HTTP STATUS CODE
            // OR LOG THE ERROR OR JUST THROW IT
            // I'LL SIMPLY THROW THE ERROR BECAUSE I'M IN A DEVELOPMENT ENVIRONMENT
            // IN PRODUCTION, I'D LOG IT.
            // ACTUALLY, GOOD SOFTWARE ENGINEERING OUGHT TO PREVENT THESE ERRORS FROM SHOWING UP IN PRODUCTION.

            const errors = Object.keys(MySQLToHTTPMap);

            // IF errors 'includes' THE CODE FOR THE ERROR, ASSIGN THE CORRESPONSING STATUS CODE TO databaseError.status 
            // (SO THAT A RESPONSE WITH THAT STATUS CODE MAY BE CREATED)
            databaseError.status = errors.includes(databaseError.code) ? MySQLToHTTPMap[databaseError.code] : databaseError.status;

            throw databaseError;
        });
    };
};

module.exports = new _Database().query;