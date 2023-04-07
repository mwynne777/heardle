'use client'

import { useEffect, useReducer } from "react";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button'
import spotifyApi from "./SpotifyApi";
import Link from "next/link";

import Autocomplete from './Autocomplete'
import Guesses from "./Guesses";
import Progress from './progress/Progress';
import reducer, { getNextDuration, initialGameState } from "./reducer";
import AnswerModal from "./AnswerModal";

// const getSongsByArtist = async (artistId: string, spotifyApi: SpotifyWebApi.SpotifyWebApiJs) => {
//     const artistAlbums = await spotifyApi.getArtistAlbums(artistId, { album_type: 'album' })
//     console.log(artistAlbums.items)
//     const promises = artistAlbums.items.map(album => spotifyApi.getAlbumTracks(album.id))
//     const unvalidatedSongs = await Promise.all(promises)
//     const validatedSongs = new Set()
//     unvalidatedSongs.forEach((album) => {
//         album.items.forEach((song) => {
//             validatedSongs.add(song.name)
//         })
//     })
//     console.log(validatedSongs)
// }

type GameProps = {
    accessToken: string
}

const game = ({ accessToken }: GameProps) => {
    const [state, dispatch] = useReducer(reducer, initialGameState)
    const { answer, autocompleteOptions, duration, guesses, isOver, isWinningRound, playing, spotifyDeviceId } = state
    
    useEffect(() => { 
        spotifyApi.setAccessToken(accessToken)
    }, [])

    const seekTo = (millis: number) => {
        spotifyApi.seek(millis, { device_id: spotifyDeviceId })
    }

    useEffect(() => {
        fetchRandomSong()
    }, [])

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (playing) {
            if (!isOver) {
                timeout = setTimeout(() => {
                    dispatch({ type: 'toggle-play', payload: { playing: false }})
                    seekTo(0)
                }, duration * 1000)
            }
        }
        return () => clearTimeout(timeout)
    }, [playing])

    const fetchAutocomplete = async (autocompletePrefix: string) => {
        const autocompleteResponse = await fetch(`/api/autocomplete?prefix=${autocompletePrefix}`)
        const autoComplete = await autocompleteResponse.json()
        console.log(autoComplete)
        const previousGuesses = guesses.map(g => { if(g.type !== 'skip') return g.song})
        const filteredAutoCompleteOptions = autoComplete.autoCompleteOptions.filter((option: string) => !previousGuesses.includes(option))
        dispatch({ type: 'get-autocomplete-options', payload: { options: filteredAutoCompleteOptions }})
    }

    const fetchRandomSong = async () => {
        const randomSongNameResponse = await fetch('/api/randomSong')
        const randomSongName = await randomSongNameResponse.json()
        console.log(randomSongName)
        const spotifySearchResponse = await spotifyApi.searchTracks(randomSongName.song)
        dispatch({ 
            type: 'get-new-song',
            payload: {
                answer: {
                    artist: spotifySearchResponse.tracks.items[0].artists[0].name,
                    id: randomSongName.song,
                    img: spotifySearchResponse.tracks.items[0].album.images[0].url,
                    lengthMillis: spotifySearchResponse.tracks.items[0].duration_ms,
                    title: spotifySearchResponse.tracks.items[0].name,
                    uri: spotifySearchResponse.tracks.items[0].uri
                }
            }
        })
    }
    
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px' }}>
            <Guesses guesses={guesses} />
            { accessToken.length > 0 &&
                <Box className='customPlayer' sx={{ width: '500px' }}>
                    <Progress 
                        accessToken={accessToken}
                        duration={duration}
                        play={playing}
                        uri={answer.uri}
                        setDeviceId={(id: string) => dispatch({ type: 'load-player', payload: { deviceId: id } })}
                        setPlay={ async (play: boolean) => {
                            if (play) {
                                await new Promise((resolve) => setTimeout(resolve, 200))
                            }
                            dispatch({ type: 'toggle-play', payload: { playing: play } })
                        }}
                        seekTo={seekTo}
                    />
                </Box>
            }
            <Autocomplete
                labelText="Guess the song (by title or artist)"
                options={autocompleteOptions}
                getAutocomplete={fetchAutocomplete}
                onSelect={(value) => {
                    if (value == null) {
                        dispatch({ type: 'clear-autocomplete' })
                    } else {
                        dispatch({ type: 'guess', payload: { guess: value } })
                    }
                }}
            />
            { !isOver &&
                <Box 
                    sx={{
                        display: 'flex',
                        justifyContent: !isOver && duration !== 16 ? 'space-between' : 'flex-end',
                        width: '500px',
                        marginTop: '12px'
                    }}
                >
                    { !isOver && duration !== 16 &&
                        <Button 
                            variant='outlined'
                            onClick={() => dispatch({ type: 'skip' })}
                            sx={{ textTransform: 'none' }}
                        >
                            SKIP (+{getNextDuration(state) - duration}s)
                        </Button>
                    }
                    <Button
                        variant='outlined'
                        onClick={() => dispatch({ type: 'give-up' })}
                        disabled={isOver}
                    >
                        Give up
                    </Button>
                </Box>
            }
            { isOver &&
                <AnswerModal 
                    answer={answer}
                    open={isOver}
                    playing={playing}
                    songLengthMillis={answer.lengthMillis}
                    titleText={isWinningRound ? 'You Win!' : 'Here\'s the answer!'}
                    onClose={async () => { 
                        dispatch({ type: 'restart' })
                        fetchRandomSong()
                    }}
                    seekTo={seekTo}
                    togglePlay={() => dispatch({ type: 'toggle-play', payload: { playing: !playing } })}
                />
            }
            <Link href='/artist'>Go to Artist Game</Link>
        </div>
    )
}

export default game