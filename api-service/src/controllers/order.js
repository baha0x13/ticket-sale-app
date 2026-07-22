const movieService = require('../services/movie');

module.exports = {
    create(body){
        return movieService.createOrder(body);
    },

    getAllForUser(userId){
        return movieService.getAllOrdersForUser(userId);
    },

    getAllForAdmin(){
        return movieService.getAllOrders();
    },

    approve(id){
        return movieService.approveOrder(id);
    },

    reject(id){
        return movieService.rejectOrder(id);
    }
};
