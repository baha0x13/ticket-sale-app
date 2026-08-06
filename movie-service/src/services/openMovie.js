const got = require('got');

const fakeData = require('./data');

const API_KEY ='64b833c7';

// OMDb details for a given imdbID don't change between requests -- caching
// them avoids re-fetching the same movie's data from an external API on
// every single incoming request. Found this was the real bottleneck under
// load: getAll() looks up every listed movie's details on every call, and
// with RabbitMQ's prefetch(1) capping concurrent processing, requests queued
// up waiting on OMDb's network latency rather than any local compute cost.
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour -- movie metadata is effectively static
const detailsCache = new Map(); // imdbID => { data, expiresAt }

module.exports = {
  getAll(){
      return new Promise(resolve => {
          resolve(fakeData.Search);
      })
  },
    async getMovieDetails(imdbID){
      const cached = detailsCache.get(imdbID);
      if (cached && cached.expiresAt > Date.now()) {
          return cached.data;
      }

      const { body } = await got(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
      const data = JSON.parse(body);

      detailsCache.set(imdbID, { data, expiresAt: Date.now() + CACHE_TTL_MS });

      return data;
    }
};



