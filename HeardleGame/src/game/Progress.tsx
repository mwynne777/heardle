import React, { Fragment, useState } from 'react';
import SpotifyPlayer from 'react-spotify-web-playback'
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';
import { useProgressBarStyles } from './useProgressBarStyles';

type ProgressProps = {
    accessToken: string
    duration: number
    play: boolean
    uri: string
    setDeviceId: (id: string) => void
    setPlay: (play: boolean) => void
}

export default function Progress({ accessToken, duration, play, uri, setDeviceId, setPlay }: ProgressProps) {
    const [progress, setProgress] = useState(0)

    const classes = useProgressBarStyles();

    const updateProgressBar = (increment: number) => {
        console.log('calling updateProgressBar Func')
        let timer
        timer = setInterval(() => {
            setProgress((oldProgress) => {
                if (oldProgress >= 100 + increment) {
                    clearInterval(timer)
                    return 0
                }
                return oldProgress + increment
            });
        }, 190);
      };

  return (
      <Fragment>
        <SpotifyPlayer 
            token={accessToken}
            uris={uri ? [uri] : []}
            callback={(data) => {
                setDeviceId(data.deviceId)
                if (data.isPlaying && data.type === 'player_update') {
                    setPlay(true)
                    updateProgressBar(100 / (duration * 5))
                }
            }}
            play={play}
        />
        <Box sx={{ width: '100%' }}>
            <LinearProgress
                variant="determinate"
                value={progress}
                className={classes.progressBar}
                classes={{ bar: classes.progressBarInner.toString() }}
            />
        </Box>
    </Fragment>
  )
}
