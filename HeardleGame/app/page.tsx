import Link from 'next/link'

const Page = () => {

    return (
        <>
            <h1>Welcome! Please log in to Spotify</h1>
            <Link href="/api/login">
                Log in with Spotify
            </Link>
        </>
    )
}

export default Page