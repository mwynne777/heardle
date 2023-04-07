'use client'

import { useEffect, useState } from "react"
import Link  from "next/link";
import spotifyApi from "../game/SpotifyApi";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography';

import Autocomplete from "../game/Autocomplete"

type ArtistGameProps = {
    accessToken: string
}

const ArtistGame = ({ accessToken }: ArtistGameProps) => {
    const [optionsFull, setOptionsFull] = useState<SpotifyApi.ArtistObjectFull[]>([])
    const [options, setOptions] = useState<string[]>([])
    const [artist, setArtist] = useState<SpotifyApi.ArtistObjectFull | null>(null)

    useEffect(() => { 
        spotifyApi.setAccessToken(accessToken)
    }, [])

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
                <>
                    <Typography variant="h3">{artist.name}</Typography>
                    <img src={artist.images[0].url} height={300} width={300}/>
                    <Link href='/artist' style={{ textDecoration: 'none' }}>
                        <Button variant='outlined' sx={{ margin: '7px'}}>
                            Play {artist.name} Heardle
                        </Button>
                    </Link>
                </>
            }
        </Box>
    )
}

export default ArtistGame