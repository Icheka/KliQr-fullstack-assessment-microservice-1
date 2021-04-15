const query = require('../database');
const tables = require('../database/tables');


class UserModel {
    constructor() {
        this.NOW = new Date().toISOString().slice(0, 19).replace('T', ' ');
    };
    
    async isUser(user_id) {
        const SQL = `SELECT * FROM ${tables.users} WHERE id = ?`;
        const VALUES = [user_id];

        const users = await query(SQL, VALUES);
        return users.length !== 0 ? true : false;
    };

    async getUserTransactionsByWindow(user_id) {
        if (!this.isUser(user_id)) return false;

        const SQL = `SELECT * FROM ${tables.transactions} WHERE user_id = ? AND date_time >= DATE_SUB(?, INTERVAL 1 YEAR)`;
        const VALUES = [user_id, this.NOW];

        return await query(SQL, VALUES);
    };
};

module.exports = UserModel;