const bcrypt = require('bcrypt');
const { sequelize } = require('./db');
const { CD, User } = require('./');
const { CDs, users } = require('./seedData');

const seed = async () => {
    await sequelize.sync({ force: true }); // recreate db

    await Promise.all(
        users.map(async (user) => {
            const hashed = await bcrypt.hash(user.password, 6);
            user.password = hashed;
        })
    );
    await User.bulkCreate(users);
    await CD.bulkCreate(CDs);
};

module.exports = seed;