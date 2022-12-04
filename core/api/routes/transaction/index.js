import logger from '../../../logger.js';
import MillixBridge from '../../../bridge/millix-bridge.js';

export default {
    routes: {
        get: async(req, res) => {
            try {
                const {
                          p0: transactionId,
                          p1: action
                      } = req.query;
                logger.debug(`[api] GET /transaction [transactionId:${transactionId}, action:${action}]`);
                if (!transactionId || !action) {
                    res.send({
                        status : 'error',
                        message: `missing parameters: p0<transactionId> and p1<action> are required`
                    });
                }
                let [actionTrigger, actionValue] = action.split(':');
                switch (actionTrigger) {
                    case 'transaction_new':
                        await MillixBridge.onTransactionNew(transactionId);
                        break;
                    case 'transaction_validation':
                        await MillixBridge.onTransactionValidationUpdate(transactionId, actionValue);
                        break;
                    case 'transaction_hibernate':
                        await MillixBridge.onTransactionHibernate(transactionId);
                        break;
                    default:
                        return res.send({
                            status : 'error',
                            message: `unknown action: ${action}`
                        });
                }
                res.send({status: 'success'});
            }
            catch (e) {
                res.send({
                    status : 'error',
                    message: e.message
                });
            }
        }
    }
};
