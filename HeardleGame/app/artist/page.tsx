import authorizePage from "../../utils/authorizePage"
import ArtistGame from "./ArtistGame"

const page = async () => {
    const access_token = await authorizePage()

    return (
        <ArtistGame accessToken={access_token}/>
    )
}

export default page