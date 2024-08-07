import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ProfileFormWrapper from "./components/ProfileFormWrapper.jsx";
import SubmissionList from "./components/SubmissionList.jsx";
import ErrorPage from "./components/errorPage.jsx";
import { DEFAULT_PROFILE_NAME, PROFILE_URL_PREFIX } from "./settings.jsx";
import { loader as submissionsLoader } from "./utils/SubmissionsLoader.jsx";
// import './index.css'

let profileName = DEFAULT_PROFILE_NAME;
if (window.props !== undefined) {
  profileName = window.props.profile_name || DEFAULT_PROFILE_NAME;
}

localStorage.setItem("profileName", profileName);

// TODO: switch to LOCAL_ROUTER_BASE_URL for local development with hot reloading via, npm run dev
//  and use PROFILE_URL_PREFIX etc. for django served app in dev & production
const base = PROFILE_URL_PREFIX + profileName + "/ui/";
// const base = LOCAL_ROUTER_BASE_URL;

const router = createBrowserRouter([
  {
    path: base,
    element: <App baseUrl={base} />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <SubmissionList baseUrl={base} />,
        loader: submissionsLoader,
      },
      { path: base + "form/", element: <ProfileFormWrapper /> },
      {
        path: base + "form/:brokerageId/",
        element: <ProfileFormWrapper />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
