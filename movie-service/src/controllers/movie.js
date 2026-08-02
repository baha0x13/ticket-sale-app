const { Op, UniqueConstraintError } = require('sequelize');
const {Movie, Seats} = require('../models');
const openMovieService = require('../services/openMovie');
const movieTrailerService = require('movie-trailer');

const alphabet = 'abcdefghijklmnopqrstuvwxyz';

const SEATS_ROWS = 6;
const SEATS_COMUNS = 6;


module.exports = {
    async create(data){
        let movie;
        try {
            movie = await Movie.create(data);
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                const friendly = new Error(`A movie with imdbID '${data.imdbID}' already exists`);
                friendly.code = 409;
                throw friendly;
            }
            throw err;
        }

        const seats = [];

        for(let x = 0; x < SEATS_ROWS; x++){
            const row = alphabet[x].toUpperCase();
            for(let y = 0; y < SEATS_COMUNS; y++){
                const seat = Seats.create({
                    row,
                    column: (y + 1),
                    movieId: movie.id
                });
                seats.push(seat);
            }
        }

        await Promise.all(seats);
        return movie;
    },

    async getAll(){
        const movies = await Movie.findAll({ where: { isDeleted: false }, order: [['date', 'ASC']] });

        return Promise.all(movies.map(async movie => {
            try {
                const details = await openMovieService.getMovieDetails(movie.imdbID);
                return { ...details, ...movie.toJSON() };
            } catch (err) {
                // OMDb lookup failed (bad/unknown imdbID, rate limit, network) --
                // still show the movie using just what's in our own DB, rather
                // than dropping it from the list entirely.
                console.warn(`OMDb lookup failed for movie ${movie.id} (${movie.imdbID}):`, err.message);
                return movie.toJSON();
            }
        }));
    },


    async getById(id){
        const movie = await Movie.findOne({
            where: {
                id: {[Op.eq]: id},
                isDeleted: false
            },
            include: {
                attributes: ['id', 'row', 'column', 'isAvailable'],
                model: Seats
            },
            order: [
                [{model: Seats}, 'row'],
                [{model: Seats}, 'column']
            ]
        });

        if(movie === null){
            return {};
        }

        const movieDetails = await openMovieService.getMovieDetails(movie.imdbID);

        return {
            ...movieDetails,
            ...(movie.toJSON())
        }
    },

    async getTrailer({title, year}){
        const trailer = await movieTrailerService(title, year);
        return {
            trailerUrl: trailer
        }
    },

    async update(id, data){
        const movie = await Movie.findByPk(id);
        if(movie === null || movie.isDeleted){
            const err = new Error('Movie not found');
            err.code = 404;
            throw err;
        }

        const { title, imdbID, hall, date } = data;
        try {
            return await movie.update({ title, imdbID, hall, date });
        } catch (err) {
            if (err instanceof UniqueConstraintError) {
                const friendly = new Error(`A movie with imdbID '${imdbID}' already exists`);
                friendly.code = 409;
                throw friendly;
            }
            throw err;
        }
    },

    async delete(id){
        const movie = await Movie.findByPk(id);
        if(movie === null || movie.isDeleted){
            const err = new Error('Movie not found');
            err.code = 404;
            throw err;
        }

        // Soft delete only -- the row stays so existing orders keep resolving
        // their `order.movie` association correctly. Just hidden from getAll/
        // getById (both filter on isDeleted above), not actually destroyed.
        await movie.update({isDeleted: true});
    },

    async getAllDeleted(){
        const movies = await Movie.findAll({ where: { isDeleted: true }, order: [['updatedAt', 'DESC']] });
        return movies.map(movie => movie.toJSON());
    },

    async restore(id){
        const movie = await Movie.findByPk(id);
        if(movie === null || !movie.isDeleted){
            const err = new Error('Deleted movie not found');
            err.code = 404;
            throw err;
        }

        await movie.update({isDeleted: false});
    }
};