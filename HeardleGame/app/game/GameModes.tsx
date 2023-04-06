"use client"

import Link from 'next/link'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography';

const GameModes = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}} >
            <Typography variant="h5" sx={{ marginBottom: '15px' }}>
                Would you like to play artist challenge or classic heardle?
            </Typography>
            <Link href='/game/artist' style={{ textDecoration: 'none' }}>
                <Button variant='outlined' sx={{ margin: '7px'}}>
                    Artist
                </Button>
            </Link>
            <Link href='/game/random' style={{ textDecoration: 'none' }}>
                <Button variant='outlined' sx={{ margin: '7px'}}>
                    Classic
                </Button>
            </Link>
        </Box>
    )
}

export default GameModes