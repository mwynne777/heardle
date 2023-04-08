import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { isUserAuthorized } from '../../utils/authorization';
import GameModes from './GameModes';

const USER_COOKIE: string = process.env.USER_COOKIE ?? ''

export default async function Page() {
    const cookieStore = cookies();
    const user = cookieStore.get(USER_COOKIE);
    
    const userAuth = await isUserAuthorized(user?.value)

    if (!userAuth.isAuthorized) {
        console.log('Redirecting you to log in again w/ Spotify')
        redirect('/')
    }

    return (
        <GameModes/>
    )
  }
  