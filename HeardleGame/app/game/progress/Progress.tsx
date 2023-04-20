import React, { useEffect, useRef, useState } from 'react'
import SpotifyPlayer from 'react-spotify-web-playback'
import Box from '@mui/material/Box'
import TimeBar from '../TimeBar'

const UPDATE_INTERVAL_MS = 16

type ProgressProps = {
    accessToken: string
    duration: number
    play: boolean
    uri: string
    seekTo: (millis: number) => void
    setDeviceId: (id: string) => void
    setPlay: (play: boolean) => void
}

export default function Progress({
    accessToken,
    duration,
    play,
    uri,
    seekTo,
    setDeviceId,
    setPlay,
}: ProgressProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const timer = useRef<NodeJS.Timer | null>(null)

    useEffect(() => {
        if (!play) {
            setCurrentTime(0)
            if (timer.current) {
                clearInterval(timer.current)
            }
        }
    }, [play, timer])

    // Reset time when duration is exceeded
    useEffect(() => {
        if (currentTime <= duration) return

        setCurrentTime(0)
        timer.current && clearInterval(timer.current)
    }, [currentTime, duration])

    // Clear interval on unmount
    useEffect(() => {
        return () => {
            timer.current && clearInterval(timer.current)
        }
    }, [])

    const updateProgressBar = () => {
        timer.current = setInterval(() => {
            setCurrentTime((prevTime) => prevTime + UPDATE_INTERVAL_MS / 1000)
        }, UPDATE_INTERVAL_MS)
    }

    return (
        <>
            <SpotifyPlayer
                token={accessToken}
                name='HeardleClonePlayer'
                persistDeviceSelection
                uris={uri ? [uri] : []}
                callback={(data) => {
                    setDeviceId(data.deviceId)
                    if (data.isPlaying && data.type === 'player_update') {
                        setPlay(true)
                        updateProgressBar()
                    } else if (
                        !data.isPlaying &&
                        data.type === 'player_update'
                    ) {
                        setPlay(false)
                        seekTo(0)
                    }
                }}
                play={play}
            />
            <Box sx={{ width: '100%' }}>
                <TimeBar currentTime={currentTime} duration={duration} />
            </Box>
        </>
    )
}
