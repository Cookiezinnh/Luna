const { google } = require('googleapis');
const config = require('../config.json');
const SearchCache = require('../models/MusicSearchCache');

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtubeApiKey,
});

async function searchYouTube(query) {
    try {
        const response = await youtube.search.list({
            q: query,
            part: 'snippet',
            maxResults: 1,
            type: 'video',
        });

        if (response.data.items.length) {
            return `https://www.youtube.com/watch?v=${response.data.items[0].id.videoId}`;
        } else {
            throw new Error('Nenhum resultado encontrado no YouTube.');
        }
    } catch (error) {
        console.error('Erro ao buscar no YouTube:', error);
        throw error;
    }
}

async function cacheSearch(query, url) {
    try {
        const searchEntry = new SearchCache({ query, url });
        await searchEntry.save();
    } catch (error) {
        console.error('Erro ao salvar no cache:', error);
    }
}

async function getCachedSearch(query) {
    try {
        const result = await SearchCache.findOne({ query });
        return result ? result.url : null;
    } catch (error) {
        console.error('Erro ao buscar no cache:', error);
        return null;
    }
}

module.exports = { searchYouTube, cacheSearch, getCachedSearch };