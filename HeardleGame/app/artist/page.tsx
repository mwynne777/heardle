import AuthorizedPage from '../../utils/AuthorizedPage'
import ArtistGame from './ArtistGame'

const page = () => {
    return (
        <>
            {/* @ts-expect-error Server Component */}
            <AuthorizedPage>
                <ArtistGame />
            </AuthorizedPage>
        </>
    )
}

export default page
