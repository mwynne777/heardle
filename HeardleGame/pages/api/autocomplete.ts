import type { NextApiRequest, NextApiResponse } from 'next'
import mysql from 'mysql2/promise'

const DATABASE_URL: string = process.env.DATABASE_URL ?? ''

export default async function (req: NextApiRequest, res: NextApiResponse) {
	console.log(req.query.prefix)
    const { prefix } = req.query

    const connection = await mysql.createConnection(DATABASE_URL);
    const [rows] = await connection.query(
        'SELECT * FROM songs WHERE LOWER(display_name) LIKE ?',
        ['%' + prefix + '%']
    )
    
    if (rows.length > 0) {
        res.json({ autoCompleteOptions: rows.map(s => s.display_name) })
    }
}