const dotenv = require("dotenv");
const mysql = require("mysql2");

dotenv.config();

// DEFINE HTTP STATUS CODES FOR POSSIBLES ERRORS THAT MIGHT BE THROWN 
// WHILE ATTEMPTING TO CONNECT TO
// THE MYSQL DATABASE
const MySQLToHTTPMap = Object.freeze({
    ER_TRUNCATED_WRONG_VALUE_FOR_FIELD: 422,
    ER_DUP_ENTRY: 409
});

class Database {
    constructor() {
        this.conn = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_DATABASE
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
                        
                        break;
                    case "ECONNREFUSED":

                        break;
                    case "ER_CON_COUNT_ERROR":

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
            this.conn.execute(sql, values, callback);

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

module.exports = new Database().query;