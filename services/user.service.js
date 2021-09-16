const { DEFAULT_ADMIN_EMAIL, DEFAULT_ADMIN_PASSWORD } = require('../constants/constants');
const { User } = require('../db');
const { ADMIN } = require('../constants/user-roles.enum');
const { hashPassword } = require('./password.service');

module.exports = {
    createDefaultAdmin: async () => {
        try {
            const user = await User.findOne({ role: ADMIN });

            if (!user) {
                const hashedPassword = await hashPassword(DEFAULT_ADMIN_PASSWORD);

                await User.create({
                    email: DEFAULT_ADMIN_EMAIL,
                    password: hashedPassword,
                    role: ADMIN
                });
            }
        } catch (e) {
            console.log(e);
        }
    },
    findAllByQuery: async (query = {}) => {
        const {
            page = 1,
            perPage = 10,
            sortBy = 'createdAt',
            order = 'asc',
            ...props
        } = query;

        const skipCount = (page - 1) * perPage;
        const orderBy = order === 'asc' ? 1 : -1;
        const sort = { [sortBy]: orderBy };

        const searchObject = {};

        const queryPropsKeys = Object.keys(props);

        queryPropsKeys.map((key) => {
            switch (key) {
                case 'role':
                    const roles = props.role.split('&');
                    searchObject.role = { $in: roles };
                    break;
                case 'email':
                    searchObject.email = props.email;
                    break;
            }
        });

        const acceptableUsers = await User
            .find(searchObject)
            .limit(+perPage)
            .skip(skipCount)
            .sort(sort)
            .select('-__v -password');

        return acceptableUsers;
    }
};
