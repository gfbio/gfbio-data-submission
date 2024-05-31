import './App.css'
import '@mantine/core/styles.css';
import {MantineProvider} from '@mantine/core';
import ProfileForm from './components/ProfileForm';

function App() {
    // const [count, setCount] = useState(0)

    return (
        <MantineProvider>
            <>
                <ProfileForm></ProfileForm>
                {/*<div className="row">*/}
                {/*    <h3>test for simple & direct usage of boostrap classes</h3>*/}
                {/*    <div className="col-6">*/}
                {/*        <p>col 1</p>*/}
                {/*    </div>*/}
                {/*    <div className="col-6">*/}
                {/*        <p>col 2</p>*/}
                {/*    </div>*/}
                {/*</div>*/}
                {/*<div>*/}
                {/*    <a href="https://vitejs.dev" target="_blank">*/}
                {/*        <img src={viteLogo} className="logo" alt="Vite logo"/>*/}
                {/*    </a>*/}
                {/*    <a href="https://react.dev" target="_blank">*/}
                {/*        <img src={reactLogo} className="logo react" alt="React logo"/>*/}
                {/*    </a>*/}
                {/*</div>*/}
                {/*<h1>Vite + React</h1>*/}
                {/*<div className="card">*/}
                {/*    <button onClick={() => setCount((count) => count + 1)}>*/}
                {/*        count is {count}*/}
                {/*    </button>*/}
                {/*    <Button variant="filled">Button</Button>*/}
                {/*    <p>*/}
                {/*        Edit <code>src/App.jsx</code> and save to test HMR*/}
                {/*    </p>*/}
                {/*</div>*/}
                {/*<p className="read-the-docs">*/}
                {/*    Click on the Vite and React logos to learn more*/}
                {/*</p>*/}
            </>
        </MantineProvider>
    )
}

export default App
