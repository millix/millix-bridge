import BlockSyncModel from '../models/block-sync.model.js';
import {Op} from 'sequelize';


class BlockSyncRepository {
    async getLastProcessedBlockNumber(network) {
        const blockSync = await BlockSyncModel.findOne({
            where: {network}
        });
        return blockSync ? blockSync.blockNumber : null;
    }

    /**
     * moves the sync checkpoint of a network forward. the update is monotonic:
     * a block number lower than the one already tracked is discarded, so events
     * processed out of order cannot rewind the checkpoint.
     */
    async updateLastProcessedBlockNumber(network, blockNumber) {
        const [
                  blockSync,
                  created
              ] = await BlockSyncModel.findOrCreate({
            where   : {network},
            defaults: {blockNumber}
        });

        if (created || blockSync.blockNumber >= blockNumber) {
            return;
        }

        await BlockSyncModel.update({blockNumber}, {
            where: {
                network,
                blockNumber: {
                    [Op.lt]: blockNumber
                }
            }
        });
    }
}


export default new BlockSyncRepository();
