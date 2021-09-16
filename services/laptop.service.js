const { Laptop } = require('../db');

module.exports = {
    findAllByQuery: async (query = {}) => {
        const {
            page = 1,
            perPage = 10,
            sortBy = 'createdAt',
            order = 'asc',
            ...props
        } = query;

        const skipCount = (page - 1) * perPage;
        const orderBy = order === 'asc' ? -1 : 1;
        const sort = { [sortBy]: orderBy };

        const searchObject = {};

        const queryPropsKeys = Object.keys(props);

        queryPropsKeys.map((key) => {
            switch (key) {
                case 'model':
                    searchObject.model = props.model;
                    break;
                case '$gte':
                    searchObject.price = { $gte: props.$gte };
                    break;
                case '$lte':
                    searchObject.price = { $lte: props.$lte };
                    break;
            }
        });

        const acceptableLaptops = await Laptop
            .find(searchObject)
            .limit(+perPage)
            .skip(skipCount)
            .sort(sort)
            .select('-__v');

        return acceptableLaptops;
    }
};
