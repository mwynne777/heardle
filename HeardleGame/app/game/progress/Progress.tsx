import React, { useEffect, useRef, useState } from 'react'
import SpotifyPlayer from 'react-spotify-web-playback'
import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Background from './hpb.png'

const formatTimeStamp = (time: number) => {
    let result = '0:'
    return time < 10 ? `${result}0${time}` : `${result}${time}`
}

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
    const [progress, setProgress] = useState(0)
    const [currentTimeStamp, setCurrentTimeStamp] = useState(formatTimeStamp(0))
    const progressMax = (duration / 16) * 100
    const timer = useRef<NodeJS.Timer | null>(null)

    useEffect(() => {
        if (!play) {
            setProgress(0)
            setCurrentTimeStamp(formatTimeStamp(0))
            if (timer.current) {
                clearInterval(timer.current)
            }
        }
    }, [play, timer])

    const updateProgressBar = (increment: number) => {
        timer.current = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress > progressMax + increment) {
                    clearInterval(timer.current!)
                    setCurrentTimeStamp(formatTimeStamp(0))
                    return 0
                }
                setCurrentTimeStamp(
                    formatTimeStamp(
                        Math.floor((oldProgress + increment) / 6.25)
                    )
                )
                return oldProgress + increment
            })
        }, 100)
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
                        updateProgressBar((1 / (16 * 10)) * 100)
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
                <LinearProgress
                    variant='determinate'
                    value={progress}
                    sx={{
                        background: `url(${Background.src})`,
                        backgroundSize: '500px',
                        marginBottom: '8px',
                        height: '27px',
                    }}
                />
            </Box>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <div>{currentTimeStamp}</div>
                <div>0:16</div>
            </Box>
        </>
    )
}
