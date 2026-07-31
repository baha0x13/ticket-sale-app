const morgan  = require('morgan');
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const config = require('./config');
const { register, requestDurationMiddleware } = require('./metrics');


let app = express();
const server = require('http').createServer(app);

app.use(morgan('tiny'));
app.use(requestDurationMiddleware);
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", config.frontend_origin);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, ApiKey");
    res.header("Access-Control-Expose-Headers", "total-count");
    next();
});

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use('/', routes);



app.use((err, req, res, _next) => {
    if(process.env.NODE_ENV !== 'production') console.log(err);
    // errors thrown locally use .status/.message; errors relayed back over the
    // AMQP RPC from movie-service use .code/.error (see services/movie.js's
    // sendMessage, which rejects with the raw {code, error} response body)
    res.status(err.status || err.code || 500);
    res.json({'error': {
        message: err.message || err.error
    }});
});


server.listen(3030, () => {
    console.log('> Express app listening on port 3030');
});


// Store temporary reservation in-memory 'DB'
const roomToReservation = {};   //room => Set [{room, seatId, state}]
const clientIdToReservation = {};  //clientId => Set [{room, seatId, state}]


function clearClientReservation(socket) {
    if(clientIdToReservation[socket.id] === undefined) return;
    for(const params of clientIdToReservation[socket.id].values()){
        if(roomToReservation[params.room] !== undefined) roomToReservation[params.room].delete(params);
        socket.broadcast.to(params.room).emit('temp-book-seat', {...params, state: false});
    }
    delete clientIdToReservation[socket.id];
}

const io = require('socket.io')(server, {
    cors: {
        origin: config.frontend_origin
    }
});
io.on('connection', socket => {
    console.log('new client: ', socket.id);

    socket.on('join-room', room => {
        socket.join(room);
        if(roomToReservation[room] === undefined) return;
        for(const seat of roomToReservation[room].values()){
            socket.emit('temp-book-seat', seat)
        }
    });

    socket.on('leave-room', room => {
        socket.leave(room);
        clearClientReservation(socket);
    });


    socket.on('disconnect', () => clearClientReservation(socket));

    socket.on('temp-book-seat', params =>{
        if(params.state){
            (roomToReservation[params.room] = roomToReservation[params.room] || new Set()).add(params);
            (clientIdToReservation[socket.id] = clientIdToReservation[socket.id] || new Set()).add(params);
        }else{
            if(roomToReservation[params.room] !== undefined) roomToReservation[params.room].delete(params);
            if(clientIdToReservation[socket.id !== undefined]) clientIdToReservation[socket.id].delete(params);
        }

        socket.broadcast.to(params.room).emit('temp-book-seat', params);
    });

});

