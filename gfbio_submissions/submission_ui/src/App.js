import React, {Component} from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom'
import './App.css';

import Posts from './posts/Posts';

class App extends Component {
    render() {
        return (
            <BrowserRouter>
                <Switch>
                    <Route component={Posts}/>
                </Switch>
            </BrowserRouter>
        );
    }
}

export default App;
