import {DataTypes} from 'sequelize';
import Database from '../database.js';

const sequelize = Database.getConnection();

const VestingRule = sequelize.define('vestingrule', {
    id               : {
        type        : DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey  : true
    },
    field      : {
        type     : DataTypes.STRING,
        allowNull: false
    },
    operator        : {
        type: DataTypes.STRING
    },
    value: {
        type     : DataTypes.STRING,
        allowNull: false
    }
},{
    indexes : [
        {
            unique : true,
            fields: ['field', 'operator', 'value']
        }
    ]
});

export default VestingRule;