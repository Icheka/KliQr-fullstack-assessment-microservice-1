/**
 * This module provides an important abstraction layer for DB transactions
 * The idea is that the underlying schema can be changed (within reasonable limits)
 * without breaking the service or requiring a line-by-line update for each Db transaction
 */

module.exports = {
    users: 'users',
    transactions: 'transactions'
};