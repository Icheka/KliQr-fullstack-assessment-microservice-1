const router = require('express').Router();
const User = require('../controllers/User');

/* GET a user's expense trends */
router.get('/:user_id', (req, res, next) => {
    const user = new User();
    user.getTrendsInWindow(res, req.params.user_id);
    // res.send("User trends for user " + req.params.user_id);
});

module.exports = router;