import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.jsx";
import ProfileFormWrapper from "./components/ProfileFormWrapper.jsx";
import SubmissionList from "./components/SubmissionList.jsx";
import ErrorPage from "./components/errorPage.jsx";
// import './index.css'

let profileName = "generic";
if (window.props !== undefined) {
  profileName = window.props.profile_name || "generic";
}
localStorage.setItem("profileName", profileName);
const base = "/profile/profile/" + profileName + "/ui/";

const router = createBrowserRouter([
  {
    path: base,
    element: <App baseUrl={base} />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <SubmissionList /> },
      { path: base + "form/", element: <ProfileFormWrapper /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
