"use client"

import SpotifyWebApi from "spotify-web-api-js";

const spotifyApi = new SpotifyWebApi()

console.log("Not sure the log makes sense, but let's see how many times it prints")

type ApiType = SpotifyWebApi.SpotifyWebApiJs

export default spotifyApi
export type { ApiType as SpotifyWebApi }