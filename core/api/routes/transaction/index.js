export default {
    routes: {
        get: async (req, res) => {
            try {
                res.send({status: 'success'})
            } catch (e) {
                res.send({status: 'error', message: e.message})
            }
        }
    }
};
