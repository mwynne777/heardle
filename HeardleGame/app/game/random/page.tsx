import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isUserAuthorized } from '../../../utils/authorization';

import Game from '../Game'

const USER_COOKIE: string = process.env.USER_COOKIE ?? ''

export type Song = {
	artist: string
	id: string
	img: string
	lengthMillis: number
	title: string
	uri: string
}

const random = async () => {
    const cookieStore = cookies();
    const user = cookieStore.get(USER_COOKIE);

    const userAuth = await isUserAuthorized(user?.value)

    if (!userAuth.isAuthorized) {
        console.log('Redirecting you to log in again w/ Spotify')
        redirect('/')
    }

    return (
        <Game accessToken={userAuth.access_token}/>
    )
}

export default random