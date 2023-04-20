import { Box } from '@mui/material'

type Interval = [number, number]

const MAX_SECONDS = 16
const INTERVALS: Interval[] = [
    [0, 1],
    [1, 2],
    [2, 4],
    [4, 7],
    [7, 11],
    [11, 16],
]

const formatTimeStamp = (time: number) => {
    let result = '0:'
    return time < 10 ? `${result}0${time}` : `${result}${time}`
}

interface Props {
    currentTime: number
    duration: number
}

export default function TimeBar({ currentTime, duration }: Props) {
    const progress = (100 * currentTime) / MAX_SECONDS
    const currentTimeStamp = formatTimeStamp(Math.floor(currentTime))

    return (
        <Box>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: 27,
                    border: 1,
                    marginBottom: 1,
                }}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 5,
                        height: '100%',
                        width: `${(100 * duration) / MAX_SECONDS}%`,
                        backgroundColor: 'text.disabled',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        zIndex: 7,
                        height: '100%',
                        width: `${progress}%`,
                        backgroundColor: 'primary.main',
                    }}
                />
                {INTERVALS.map((interval, idx) => (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: `${(100 * interval[0]) / MAX_SECONDS}%`,
                            zIndex: 10,
                            width: `${
                                (100 * (interval[1] - interval[0])) /
                                MAX_SECONDS
                            }%`,
                            height: '100%',
                            borderLeft: idx === 0 ? 0 : 1, // Don't add a left border for the first element.
                        }}
                    />
                ))}
            </Box>
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <div>{currentTimeStamp}</div>
                <div>{formatTimeStamp(MAX_SECONDS)}</div>
            </Box>
        </Box>
    )
}
