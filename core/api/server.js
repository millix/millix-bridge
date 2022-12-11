import express from 'express';
import logger from '../logger.js';
import fs from 'fs';
import {promisify} from 'util';
import config from '../config/config.js';
import * as path from 'path';


class Server {
    constructor(port = config.API_PORT) {
        this.port = port;
        this.app  = express();
    }

    async start() {
        this.registerMiddleware();
        await this.registerRoutes();
        await promisify(this.app.listen.bind(this.app))(this.port);
        logger.debug(`server started at http://localhost:${this.port}`);
    }

    registerMiddleware() {
        // Ignore this for now, but register all middleware in here ...
    }

    async registerRoutes() {
        await this._registerRoutes(path.dirname(import.meta.url).replace(/^file:\/\/\//, process.platform === 'win32' ? '' : '/') + '/routes');
    }

    async _registerRoutes(baseDirectory, currentDirectory = '/') {
        // Get all the files in the specified directory
        const files = await promisify(fs.readdir)(baseDirectory + currentDirectory);
        // Traverse through the files/directories
        for (const path of files) {
            const filePath = baseDirectory + currentDirectory + path;
            const stats    = await promisify(fs.lstat)(filePath);

            // If it is a file, then register route
            if (stats.isFile()) {
                logger.info(`registering routes: ${currentDirectory}`);

                const controller = (await import(process.platform === 'win32' ? 'file://' + filePath : filePath)).default;
                const endpoint   = controller.routes;
                const routePath  = controller.path;

                // Loop through all method types of our endpoint and register
                // them to the app.
                Object
                    .keys(endpoint)
                    .forEach((method) => {

                        // Create the endpoint URL
                        const routeFileName        = path.replace('.js', '');
                        const routeDefaultEndpoint = routeFileName.endsWith('index') ? currentDirectory : currentDirectory + routeFileName;
                        const endpointUrl          = routePath ?? routeDefaultEndpoint;
                        // Register the route
                        switch (method) {
                            case 'get':
                                this.app.get(endpointUrl, endpoint[method]);
                                break;
                            case 'post':
                                this.app.post(endpointUrl, endpoint[method]);
                                break;
                            case 'put':
                                this.app.put(endpointUrl, endpoint[method]);
                                break;
                            case 'delete':
                                this.app.delete(endpointUrl, endpoint[method]);
                                break;
                            default:
                                return;
                        }
                        logger.info(`registered route [${method}]: ${endpointUrl}`);
                    });
            }

            // If directory, then loop through this directory and register
            // routes
            if (stats.isDirectory()) {
                await this._registerRoutes(baseDirectory, currentDirectory + path + '/');
            }
        }
    }
}


export default Server;
