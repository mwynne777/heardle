import React, { useEffect, useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import Slider from '@mui/material/Slider'
import CloseIcon from '@mui/icons-material/Close'
import PauseRounded from '@mui/icons-material/PauseRounded'
import PlayArrowRounded from '@mui/icons-material/PlayArrowRounded'
import { Song } from './reducer'
import IconButton from '@mui/material/IconButton'
import { DialogContent } from '@mui/material'

const formatTimeStamp = (timeMillis: number) => {
    const seconds = Math.floor(timeMillis / 1000)
    const secondsVal = seconds % 60
    const minutes = Math.floor(seconds / 60)
    let result = `${minutes}:`
    return secondsVal < 10
        ? `${result}0${secondsVal}`
        : `${result}${secondsVal}`
}

type AnswerModalProps = {
    answer: Song
    open: boolean
    playing: boolean
    songLengthMillis: number
    titleText: string
    onClose: () => void
    seekTo: (millis: number) => void
    togglePlay: () => void
}

const AnswerModal = ({
    answer,
    open,
    playing,
    songLengthMillis,
    titleText,
    onClose,
    seekTo,
    togglePlay,
}: AnswerModalProps) => {
    const [calculatedMillis, setCalculatedMillis] = useState(0)
    const timerRef = useRef<NodeJS.Timer | null>(null)

    useEffect(() => {
        if (playing) {
            timerRef.current = setInterval(() => {
                setCalculatedMillis((oldMillis) => {
                    if (oldMillis < songLengthMillis) {
                        return oldMillis + 200
                    }
                    clearInterval(timerRef.current!)
                    return songLengthMillis
                })
            }, 200)
        } else {
            if (timerRef.current && timerRef.current !== undefined) {
                clearInterval(timerRef.current)
            }
        }
    }, [playing])

    return (
        <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth={true}>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    borderRadius: '7px',
                }}
            >
                <DialogTitle
                    variant='h6'
                    component='h2'
                    sx={{ padding: '0 0 8px 0' }}
                >
                    {titleText}
                    <IconButton
                        aria-label='close'
                        onClick={onClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <img
                    src={answer.img}
                    style={{ width: '100%', maxWidth: 300 }}
                />
                <div>{answer.title}</div>
                <div>{answer.artist}</div>
                <Box
                    sx={{
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                    }}
                >
                    <IconButton
                        aria-label={playing ? 'pause' : 'play'}
                        onClick={() => {
                            togglePlay()
                            if (calculatedMillis > 0) seekTo(calculatedMillis)
                        }}
                        sx={{ width: '24px', height: '24px' }}
                    >
                        {!playing ? (
                            <PlayArrowRounded
                                htmlColor='black'
                                sx={{ fontSize: '3rem' }}
                            />
                        ) : (
                            <PauseRounded
                                htmlColor='black'
                                sx={{ fontSize: '3rem' }}
                            />
                        )}
                    </IconButton>
                    <Slider
                        value={(calculatedMillis / songLengthMillis) * 100}
                        onChange={(_, value: number | number[]) => {
                            const newMillis = Math.floor(
                                ((value as number) / 100) * songLengthMillis
                            )
                            seekTo(newMillis)
                            setCalculatedMillis(newMillis)
                        }}
                    />
                    <Box
                        sx={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div>{formatTimeStamp(calculatedMillis)}</div>
                        <div>
                            -
                            {formatTimeStamp(
                                songLengthMillis - calculatedMillis
                            )}
                        </div>
                    </Box>
                </Box>
            </DialogContent>
        </Dialog>
    )
}

export default AnswerModal
