import {useState} from 'react'
import reactLogo from './static/react.svg'
import viteLogo from './static/vite.svg'
import './App.css'
import '@mantine/core/styles.css';
import {Button, MantineProvider} from '@mantine/core';

function App() {
    const [count, setCount] = useState(0)

    return (
        <MantineProvider>
            <>
                <div>
                    <a href="https://vitejs.dev" target="_blank">
                        <img src={viteLogo} className="logo" alt="Vite logo"/>
                    </a>
                    <a href="https://react.dev" target="_blank">
                        <img src={reactLogo} className="logo react" alt="React logo"/>
                    </a>
                </div>
                <h1>Vite + React</h1>
                <div className="card">
                    <button onClick={() => setCount((count) => count + 1)}>
                        count is {count}
                    </button>
                    <Button variant="filled">Button</Button>
                    <p>
                        Edit <code>src/App.jsx</code> and save to test HMR
                    </p>
                </div>
                <p className="read-the-docs">
                    Click on the Vite and React logos to learn more
                </p>
            </>
        </MantineProvider>
    )
}

export default App
