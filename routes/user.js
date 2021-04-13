const router = require('express').Router();

/* GET a user's expense trends */
router.get('/:user_id', (req, res, next) => {
    console.log(req.params)
    res.send("User trends for user " + req.params.user_id);
});

module.exports = router;