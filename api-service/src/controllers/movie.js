const movieService = require('../services/movie');


module.exports = {
    create(data){
        return movieService.createMovie(data);
    },

    getAll(){
        return movieService.getAllMovies();
    },

    getById(id){
        return movieService.getMovieById(id);
    },

    getTrailer(title, year){
        return movieService.getTrailer(title, year)
    },

    update(id, data){
        return movieService.updateMovie(id, data);
    },

    delete(id){
        return movieService.deleteMovie(id);
    },

    getAllDeleted(){
        return movieService.getAllDeletedMovies();
    },

    restore(id){
        return movieService.restoreMovie(id);
    }
};