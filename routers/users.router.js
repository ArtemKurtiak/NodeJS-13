const router = require('express').Router();

const { checkAccessToken } = require('../middlewares/auth.middleware');
const {
    getAllUsers, getUserById, deleteUser, updateUser, createUser, createAdmin
} = require('../controllers/users.controller');
const {
    checkUserPermission,
    isUpdateUserDataSent, isUserIdFormatCorrect, checkUserAvailability, isUserNotExists, isUserExists, isUserAdmin
} = require('../middlewares/user.middleware');

router.use(checkAccessToken);

router.get('/', getAllUsers);

router.post('/', checkUserAvailability('email'),
    isUserNotExists, createUser);

router.post('/admin',
    checkUserAvailability('email'),
    isUserNotExists,
    createAdmin);

router.use('/:userId', isUserIdFormatCorrect);

router.patch('/:userId',
    isUpdateUserDataSent,
    checkUserAvailability('userId', 'params', '_id'),
    isUserExists,
    checkUserAvailability('email'),
    isUserNotExists,
    checkUserPermission,
    updateUser);

router.use('/:userId', checkUserAvailability('userId', 'params', '_id'), isUserExists);

router.delete('/:userId', checkUserPermission, deleteUser);

router.get('/:userId', getUserById);

module.exports = router;
