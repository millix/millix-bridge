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
        type     : DataTypes.STRING,
        allowNull: false
    },
    transactionIdFrom: {
        type     : DataTypes.STRING,
        allowNull: false
    },
    transactionIdTo  : {
        type     : DataTypes.STRING,
        allowNull: true
    },
    addressFrom      : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    addressTo        : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    amountFrom       : {
        type     : DataTypes.BIGINT,
        allowNull: false
    },
    amountTo         : {
        type     : DataTypes.BIGINT,
        allowNull: false
    },
    event            : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    processingState  : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    status           : {
        type     : DataTypes.SMALLINT,
        allowNull: false
    }
});

export default Transaction;
