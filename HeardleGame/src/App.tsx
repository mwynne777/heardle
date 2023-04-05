import React, { useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import Login from './login/login'
import Game from './game/Game'
import ArtistGame from "./artist-game/ArtistGame";

import "./index.scss";

var spotifyApi = new SpotifyWebApi()

type SpotifyParam = { access_token: string, refresh_token: string }

function isSpotifyParam(param: {} | SpotifyParam): param is SpotifyParam {
    return (param as SpotifyParam).access_token !== undefined &&
    (param as SpotifyParam).refresh_token !== undefined;
  }

const App = () => {

  const params = useMemo(() => {
    var hashParams = { access_token: '', refresh_token: ''};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}, [])

useEffect(() => {
  console.log('params', params)
  if (isSpotifyParam(params)) {
      console.log('setting the access token')
      spotifyApi.setAccessToken(params.access_token)
  }
}, [params])

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login/>,
    },
    {
      path: '/game',
      element: <Game spotifyApi={spotifyApi} accessToken={params.access_token}/>
    },
    {
      path: '/artist',
      element: <ArtistGame spotifyApi={spotifyApi} />
    }
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
};
ReactDOM.render(<App />, document.getElementById("app"));
