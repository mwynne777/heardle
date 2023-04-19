import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

const DATABASE_URL: string = process.env.DATABASE_URL ?? ''

type Song = {
    id: number
    title: string
    artist: string
    display_name: string
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
    console.log(req.query.prefix)
    const { prefix } = req.query

    const connection = await mysql.createConnection(DATABASE_URL)
    const dbresponse = await connection.query(
        'SELECT * FROM songs WHERE LOWER(display_name) LIKE ?',
        ['%' + prefix + '%']
    )
    const rows = dbresponse[0] as Song[]

    if (rows.length > 0) {
        res.json({ autoCompleteOptions: rows.map((s) => s.display_name) })
    }
}
