const router = require('express').Router();
const {
  getMyUser,
  editUser,
} = require('../controllers/users');

router.get('/me', getMyUser);
router.patch('/me', editUser);

module.exports = router;
