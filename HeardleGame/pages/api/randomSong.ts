import type { NextApiRequest, NextApiResponse } from 'next'
import path from 'path'

export default async function (req: NextApiRequest, res: NextApiResponse) {
    let songs: string[] = []
    try {
        const dirRelativeToPublicFolder = 'songs'

        const dir = path.resolve('./public', dirRelativeToPublicFolder);

        songs = require('fs').readFileSync(path.join('/', dir, 'topTenSongs.txt'), 'utf-8')
    .split('\n')
    .filter(Boolean);
    } catch (err) {
        console.error(err)
    }

	const numberOfSongs = songs.length
	const randomIndex = Math.floor(Math.random() * numberOfSongs)
    console.log('Chosen song: ', songs[randomIndex])
	res.json({ song: songs[randomIndex] })
}