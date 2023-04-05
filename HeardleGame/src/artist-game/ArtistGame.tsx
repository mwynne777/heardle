import React, { useState } from "react"
import { Link } from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';

import Autocomplete from "../game/Autocomplete"

type ArtistGameProps = {
    spotifyApi: SpotifyWebApi.SpotifyWebApiJs
}

const ArtistGame = ({ spotifyApi }: ArtistGameProps) => {
    const [optionsFull, setOptionsFull] = useState<SpotifyApi.ArtistObjectFull[]>([])
    const [options, setOptions] = useState<string[]>([])
    const [artist, setArtist] = useState<SpotifyApi.ArtistObjectFull | null>(null)

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginTop: '20px' 
        }}>
            <Autocomplete
                labelText="Select an artist"
                options={options}
                onSelect={(value) => {
                    const artist = optionsFull.find(a => a.name === value)
                    artist && setArtist(artist)
                }}
                getAutocomplete={async (value) => {
                    const response = await spotifyApi.searchArtists(value)
                    setOptions(response.artists.items.map(a => a.name))
                    setOptionsFull(response.artists.items)
                }}
            />
            { artist &&
                <Box>
                    <Typography variant="h3">{artist.name}</Typography>
                    <img src={artist.images[0].url} height={300} width={300}/>
                    <Link to='/game' state={{ artist: artist.id }}>Play {artist.name} Heardle</Link>
                </Box>
            }
        </Box>
    )
}

export default ArtistGame