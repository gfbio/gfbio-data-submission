import './App.css'
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import {MantineProvider} from '@mantine/core';
import ProfileFormWrapper from './components/ProfileFormWrapper.jsx';
import {Route, Routes} from "react-router-dom";

function App() {
    return (
        <MantineProvider>
            <Routes>
                <Route path="/" element={<ProfileFormWrapper/>}/>
                <Route path='/:brokerSubmissionId' element={<ProfileFormWrapper/>}/>
            </Routes>
        </MantineProvider>
    )
}

export default App
