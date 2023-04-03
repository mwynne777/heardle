import React from "react";
import ReactDOM from "react-dom";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";
import Login from './login/login'
import Game from './game/Game'

import "./index.scss";

const App = () => {

  const router = createBrowserRouter([
    {
      path: "/",
      element: <Login/>,
    },
    {
      path: '/game',
      element: <Game/>
    }
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  )
};
ReactDOM.render(<App />, document.getElementById("app"));
