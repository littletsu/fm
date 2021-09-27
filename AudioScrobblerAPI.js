import JsonRequest from "../JsonRequest.js";
import fetch from 'node-fetch';
import cheerio from 'cheerio';

/**
 * Class used to make requests and recieve information from Last.fm API
 */
export default class AudioScrobblerAPI {
    /**
     * Create a new instance of AudioScrobblerAPI with an unique key and configurations
     * @param {object} config - config.json file containing a valid Last.fm API key
     */
    constructor(config={}) {

        if(!config.key) throw new Error("Invalid Last.fm API key");
        /**
         * Configuration object used by this class
         * @type {object}
         */
        this.config = config;
        
        this.API_URL = `http://ws.audioscrobbler.com/2.0/?format=json&api_key=${config.key}&method=`;
    }

    /**
     * Get the track an user is currently listening to (warning: unstable, could probably do better) 
     * @param {string} user - User to get listening track from
     * @returns The track the user is listening to, if they are listening to one. Otherwise returns null
     */
    async getUserListeningTrack(user=null) {
        let lastTrack = (await this.request('user.getrecenttracks', { user })).recenttracks?.track[0];
        return lastTrack["@attr"] ? lastTrack["@attr"].nowplaying === "true" ? lastTrack : null : null;
    }

    /**
     * Gets album information (cover and name) from Last.fm
     * @param {object} track - An object containing a name and artist property to get the information from
     */
    async getTrackAlbum({ name, artist }) {
        let trackInfo = (await this.request('track.getInfo', {
            track: name,
            artist: artist["#text"]
        })).track
        if(!trackInfo) return null;
        if(trackInfo.album) return {
            imgUrl: trackInfo.album.image[3]["#text"],
            name: trackInfo.album.title
        }
    }
   
    
    async getArtistImg(artist) {
        let req = await fetch(`https://www.last.fm/music/${artist["#text"]}/+images`);
        let text = await req.text();
        let $ = cheerio.load(text);
        return $(".image-list-item-wrapper")[0].children[1].children[1].attribs.src
        
    }
    // http stuff

    /**
     * GET a method from the Last.fm API
     * @param {string} method - A method from the Last.fm API
     * @param {object} params - Query parameters such as user, artist, track, etc..
     * @returns A promise returning a JSON object if the request was successful
     */
    async request(method, params={}) {
        return (await JsonRequest(this.API_URL + method + this._parseParams(method, params)));
    }

    /**
     * Internal function for converting an object to URL safe query parameters
     * @param {string} method - Method from the Last.fm API, used to provide default parameters
     * @param {object} params - Query parameters such as user, artist, track, etc..
     * @returns A string of parameters ready to be requested
     */
    _parseParams(method, params) {
        if(method.startsWith("user.") && (!params.user)) {
            params.user = this.config.user
        }
        return "&" + Object.entries(params)
                .map(param => 
                    `${param[0]}=${encodeURIComponent( param[1] )}`)
                .join('&');
    }
}
