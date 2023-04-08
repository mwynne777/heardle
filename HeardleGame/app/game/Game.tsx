'use client'

import { useEffect, useReducer } from "react";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button'
import spotifyApi, { SpotifyWebApi } from "./SpotifyApi";

import Autocomplete from './Autocomplete'
import Guesses from "./Guesses";
import Progress from './progress/Progress';
import reducer, { getNextDuration, initialGameState } from "./reducer";
import AnswerModal from "./AnswerModal";

type GameProps = {
    accessToken: string,
    artistId?: string
}

const game = ({ accessToken, artistId }: GameProps) => {
    const [state, dispatch] = useReducer(reducer, initialGameState)
    const { answer, autocompleteOptions, duration, guesses, isOver, isWinningRound, playing, spotifyDeviceId } = state
    
    const seekTo = (millis: number) => {
        spotifyApi.seek(millis, { device_id: spotifyDeviceId })
    }
    
    useEffect(() => { 
        spotifyApi.setAccessToken(accessToken)
    }, [])


    useEffect(() => {
        if (artistId !== null && artistId !== undefined) {
            getSongsByArtist(artistId, spotifyApi)
        } else {
            fetchRandomSong()
        }
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

    const getSongsByArtist = async (artistId: string, spotifyApi: SpotifyWebApi) => {
        const artistAlbums = await spotifyApi.getArtistAlbums(artistId, { album_type: 'album', limit: 50 })
        const dedupedAlbums = artistAlbums.items.filter((value, index, self) =>
            index === self.findIndex((t) => (
                t.name === value.name
            ))
        )
        const randomAlbum = dedupedAlbums[Math.floor(Math.random()*dedupedAlbums.length)]
        const albumTracks = await spotifyApi.getAlbumTracks(randomAlbum.id)
        const randomSong = albumTracks.items[Math.floor(Math.random()*albumTracks.items.length)];
        dispatch({ 
            type: 'get-new-song',
            payload: {
                answer: {
                    artist: randomSong.artists[0].name,
                    id: randomSong.name,
                    img: randomAlbum.images[0].url,
                    lengthMillis: randomSong.duration_ms,
                    title: randomSong.name,
                    uri: randomSong.uri
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
        </div>
    )
}

export default game