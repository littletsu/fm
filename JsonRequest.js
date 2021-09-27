import fetch from 'node-fetch';

/**
 * Module for making a JSON request to a server using node-fetch
 * @param {string} url - URL to make a JSON request to
 * @param {object} params - Extra parameters for node-fetch
 * @returns A promise returning a JSON object if the request was successful
 */
export default async (url, params) => (await ((await fetch(url, params)).json()))
