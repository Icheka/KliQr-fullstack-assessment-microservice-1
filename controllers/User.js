const _Http = require('../handlers/Http.class');
const UserModel = require('../models/UserModel');


class User {
    constructor() {
        this.usermodel = new UserModel();
    }

    async getTransactionsInWindow(res, user_id) {
        if (!this.usermodel.isUser(user_id)) {
            _Http.emit(res, 417, "Expectation failed", "The service expected a valid user ID.");
            return false;
        };

        const transactions = await this.usermodel.getUserTransactionsByWindow(user_id);

        return transactions;
    };

    async getTrendsInWindow(res, user_id) {
        let transactions = await this.getTransactionsInWindow(res, user_id);
        if (transactions === false) return false;

        let countsByMonth = {};
        let l = [];

        transactions.forEach(trx => {
            let month = new Date(trx.date_time).getMonth() + 1;
            countsByMonth[trx.category]
            ? 
            (() => {
                // I add 1 so that 1 -> January 
                // (instead of 0 -> January, which might cause some
                // confusion in future when somebody needs to maintain the app)
                countsByMonth[trx.category].months.push(month);
                countsByMonth[trx.category].icon = trx.icon_url;
                countsByMonth[trx.category].frequency += 1;

            })()
            : 
            countsByMonth[trx.category] = {
                months: [month],
                icon: trx.icon_url,
                frequency: 1
            };
        });

        Object.keys(countsByMonth).forEach(category => {
            let monthsAsSet = new Set();
            countsByMonth[category].months.forEach(month => monthsAsSet.add(month));
            countsByMonth[category].months = Array.from(monthsAsSet);
        });

        let trendingCategories = Object.keys(countsByMonth).filter(category => countsByMonth[category].months.length > 6);
        let trends = [];
        trendingCategories.forEach(category => trends.push({
            category: category,
            ...countsByMonth[category]
        }));

        res.send(trends);
    };
};


module.exports = User;