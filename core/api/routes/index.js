import logger from '../../logger.js'
export default {
    routes: {
        get: async (req, res) => {
            res.send({name: 'millix-bridge', version: '1.0.0'});
        }
    }
};
