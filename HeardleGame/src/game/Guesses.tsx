import React from 'react'
import Box from '@mui/material/Box'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

export type Guess = 
| {
    type: 'skip'
}
| {
    type: 'correct' | 'incorrect',
    song: string
}

type GuessListProps = {
    guesses: Guess[]
}

const GuessList = ({ guesses }: GuessListProps) => {
    return (
        <Box sx={{ width: '100%', maxWidth: 450, bgcolor: 'background.paper' }}>
            <nav aria-label="guessses">
                <List>
                    { [...Array(6)].map((_x: number, index: number) => {
                        const guess = guesses.length > index ? guesses[index] : null
                        return (
                            <ListItem
                                disablePadding
                                disableGutters
                                key={index}
                                sx={{ border: '1px solid black', height: '40px', marginBottom: '5px' }}
                            >
                                {/* <ListItemIcon>
                                    <InboxIcon />
                                </ListItemIcon> */}
                                <ListItemText 
                                    primary={ guess !== null
                                            ? guess.type === 'skip' ? "SKIPPED" : guess.song
                                            : ''
                                    } 
                                />
                            </ListItem>
                        )
                    })}
                </List>
            </nav>
        </Box>
    )
}

export default GuessList