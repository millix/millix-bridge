import {Sequelize} from 'sequelize';
import config from '../config/config.js';


class Database {
    constructor() {
        this.db = null;
    }

    getConnection() {
        if (!this.db) {
            this.db = new Sequelize(
                config.DATABASE_NAME,
                config.DATABASE_AUTH_USER,
                config.DATABASE_AUTH_PASSWORD,
                {
                    host   : config.DATABASE_HOST,
                    dialect: config.DATABASE_DIALECT,
                    port: config.DATABASE_PORT
                }
            );
        }
        return this.db;
    }
}


export default new Database();
