const { google } = require('googleapis');
const config = require('../config.json');
const SearchCache = require('../models/MusicSearchCache');

const youtube = google.youtube({
    version: 'v3',
    auth: config.youtubeApiKey,
});

async function searchYouTube(query) {
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
}

async function cacheSearch(query, url) {
    const searchEntry = new SearchCache({ query, url });
    await searchEntry.save();
}

async function getCachedSearch(query) {
    const result = await SearchCache.findOne({ query });
    return result ? result.url : null;
}

module.exports = { searchYouTube, cacheSearch, getCachedSearch };