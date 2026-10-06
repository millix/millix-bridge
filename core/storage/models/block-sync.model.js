import {DataTypes} from 'sequelize';
import Database from '../database.js';

const sequelize = Database.getConnection();

const BlockSync = sequelize.define('blocksync', {
    id         : {
        type        : DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey  : true
    },
    network    : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    blockNumber: {
        type     : DataTypes.INTEGER,
        allowNull: false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['network']
        }
    ]
});

export default BlockSync;
