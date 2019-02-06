/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import HomePage from 'containers/HomePage/Loadable';
import Test_1 from 'containers/Test_1/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';

// TODO: set according to root django url, full path from config/urls.py
//  to APP/urls.py
const urlPrefix = '/ui/submission';
export default function App() {
  return (
    <div>
      <BrowserRouter basename={urlPrefix}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/t1" component={Test_1} />
          <Route component={NotFoundPage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
