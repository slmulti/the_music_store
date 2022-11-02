const { sequelize } = require('./db');
const seed = require('./seedFn');

seed()
    .then(() => {
        console.log('Seeding success. The Music Store is open for business!');
    })
    .catch(err => {
        console.error(err);
    })
    .finally(() => {
        sequelize.close();
    });