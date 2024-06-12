import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import {BrowserRouter} from 'react-router-dom';
// import './index.css'

let profileName = 'generic';
if (window.props !== undefined) {
    profileName = window.props.profile_name || 'generic';
}
localStorage.setItem('profileName', profileName);
const base ='/profile/profile/' + profileName + '/ui/';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        {/*<BrowserRouter >*/}
        <BrowserRouter basename={base}>
            <App/>
        </BrowserRouter>
    </React.StrictMode>,
)
