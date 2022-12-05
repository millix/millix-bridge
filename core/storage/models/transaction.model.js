import {DataTypes} from 'sequelize';
import Database from '../database.js';

const sequelize = Database.getConnection();

const Transaction = sequelize.define('transaction', {
    id               : {
        type        : DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey  : true
    },
    networkFrom      : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    networkTo        : {
        type: DataTypes.STRING
    },
    transactionIdFrom: {
        type     : DataTypes.STRING,
        allowNull: false
    },
    transactionIdTo  : {
        type     : DataTypes.STRING
    },
    addressFrom      : {
        type: DataTypes.STRING
    },
    addressTo        : {
        type: DataTypes.STRING
    },
    amountFrom       : {
        type: DataTypes.BIGINT
    },
    amountTo         : {
        type: DataTypes.BIGINT
    },
    event            : {
        type: DataTypes.STRING
    },
    processingState  : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    status           : {
        type        : DataTypes.SMALLINT,
        defaultValue: 1,
        allowNull   : false
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['transactionIdFrom']
        },
        {
            unique: true,
            fields: ['transactionIdTo']
        }
    ]
});

export default Transaction;
