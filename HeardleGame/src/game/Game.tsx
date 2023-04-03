import React, { Fragment, useEffect, useMemo, useReducer } from "react";
import Box from "@mui/material/Box";
import Button from '@mui/material/Button'

import SpotifyWebApi from 'spotify-web-api-js'
import Autocomplete from './Autocomplete'
import Guesses from "./Guesses";
// import Progress from './Progress'
import Progress from 'player/Player';
import reducer, { getNextDuration, initialGameState } from "./reducer";
import AnswerModal from "./AnswerModal";

var spotifyApi = new SpotifyWebApi()

type SpotifyParam = { access_token: string, refresh_token: string }

function isSpotifyParam(param: {} | SpotifyParam): param is SpotifyParam {
    return (param as SpotifyParam).access_token !== undefined &&
    (param as SpotifyParam).refresh_token !== undefined;
  }

const game = () => {
    const [state, dispatch] = useReducer(reducer, initialGameState)
    const { answer, autocompleteOptions, duration, guesses, isOver, isWinningRound, playing, spotifyDeviceId } = state

    const params = useMemo(() => {
        var hashParams = { access_token: '', refresh_token: ''};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while ( e = r.exec(q)) {
           hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }, [])

    const seekTo = (millis: number) => {
        spotifyApi.seek(millis, { device_id: spotifyDeviceId })
    }

    useEffect(() => {
        let timeout: NodeJS.Timeout
        if (playing) {
            if (!isOver) {
                timeout = setTimeout(() => {
                    dispatch({ type: 'toggle-play', payload: { playing: false }})
                    seekTo(0)
                    console.log('This is the useEffect for playing changing')
                }, duration * 1000)
            }
        }
        return () => clearTimeout(timeout)
    }, [playing])

    useEffect(() => {
        if (isSpotifyParam(params)) {
            spotifyApi.setAccessToken(params.access_token)
            fetchRandomSong()
        }
    }, [params])

    const fetchAutocomplete = async (autocompletePrefix: string) => {
        const autocompleteResponse = await fetch(`http://localhost:3001/getAutocomplete?prefix=${autocompletePrefix}`)
        const autoComplete = await autocompleteResponse.json()
        const previousGuesses = guesses.map(g => { if(g.type !== 'skip') return g.song})
        const filteredAutoCompleteOptions = autoComplete.autoCompleteOptions.filter((option: string) => !previousGuesses.includes(option))
        dispatch({ type: 'get-autocomplete-options', payload: { options: filteredAutoCompleteOptions }})
    }

    const fetchRandomSong = async () => {
        const randomSongNameResponse = await fetch('http://localhost:3001/getRandomSong')
        const randomSongName = await randomSongNameResponse.json()
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
            { params.access_token.length > 0 &&
                <Box className='customPlayer' sx={{ width: '500px' }}>
                    <Progress 
                        accessToken={params.access_token}
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
                    onClose={() => { 
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