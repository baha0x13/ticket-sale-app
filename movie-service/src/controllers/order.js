const Op = require('sequelize').Op;
const crypto = require('crypto');
const {Order, db, Seats, Movie} = require('../models');
const notificationService = require('../services/notification');

const TICKET_PRICE = 15.00;

function generateBankReference() {
    return 'TXN-' + crypto.randomBytes(4).toString('hex').toUpperCase();
}

function sendTicketEmail(order){
    const quantity = order.seats.length;

    return notificationService.send({
        from: 'Ticket-Sale👻',
        to: order.userEmail,
        subject: 'Your ticket',
        template: 'billing',
        context: {
            "name": order.userName,
            "movie": order.movie.title,
            "date": new Date(order.movie.date).toLocaleDateString(),
            "time": new Date(order.movie.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            "hall": order.movie.hall,
            "seat": order.seats.map(el => el.row + el.column),
            "quantity": quantity,
            "price": TICKET_PRICE,
            "subtotal": TICKET_PRICE * quantity,
            "total": TICKET_PRICE * quantity,
            "currency": "TND"
        }
    }).catch(err => console.log('Failed to send ticket email', err));
}

module.exports = {

    async create({movieId, seatIds, userId, userEmail, userName}){
        let transaction;

        try {
            transaction = await db.transaction();
            const order = await Order.create({
                movieId,
                userId,
                userEmail,
                userName,
                paymentStatus: 'pending',
                bankReference: generateBankReference()
            }, {transaction});



            const seats = await Seats.findAll({
                where:{
                    id: {[Op.in]: seatIds}
                }
            });

            for(const seat of seats){
                if(!seat.isAvailable) throw new Error('This place is already reserved');
                await seat.update({isAvailable: false});
            }

            await order.setSeats(seatIds, {transaction});

            await transaction.commit();
            const fullModel = await this.getById(order.id);
            return fullModel;
        } catch (err) {
            await transaction.rollback();
            return Promise.reject(err);
        }

    },

    getById(id){
        return Order.findOne({
            where: {
              id: {[Op.eq]: id}
            },
            include: [
                {
                    attributes: ['id', 'row', 'column'],
                    model: Seats,
                    through:{
                        attributes: []
                    }
                },
                {
                    model: Movie
                }
            ]
        })
    },

    getAll(){
        return Order.findAll({
            include: [
                {
                    attributes: ['id', 'row', 'column'],
                    model: Seats,
                    through:{
                        attributes: []
                    }
                },
                {
                    model: Movie
                }
            ],
            order: [['createdAt', 'DESC']]
        })
    },

    getAllForUser(userId){
        return Order.findAll({
            where: {
                userId: {[Op.eq]: userId}
            },
            include: [
                {
                    attributes: ['id', 'row', 'column'],
                    model: Seats,
                    through:{
                        attributes: []
                    }
                },
                {
                    model: Movie
                }
            ],
            order: [['createdAt', 'DESC']]
        })
    },

    async approve(id){
        const order = await this.getById(id);
        if(order === null) throw new Error('Order not found');

        await order.update({paymentStatus: 'confirmed'});
        const fullOrder = await this.getById(id);
        await sendTicketEmail(fullOrder);
        return fullOrder;
    },

    async reject(id){
        const order = await this.getById(id);
        if(order === null) throw new Error('Order not found');

        for(const seat of order.seats){
            await seat.update({isAvailable: true});
        }

        await order.update({paymentStatus: 'rejected'});
        return this.getById(id);
    }
};

