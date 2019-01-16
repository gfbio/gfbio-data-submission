/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import HomePage from 'containers/HomePage/Loadable';
import Test_1 from 'containers/Test_1/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
// import createBrowserHistory from 'history/createBrowserHistory';

// perhaps this way with "test" as url.py entry
// or do like in ena_redux

const urlPrefix = '/ui/test';
export default function App() {
  return (
    <div>
      <Switch>
        <Route exact path={`${urlPrefix}/`} component={HomePage} />
        <Route exact path={`${urlPrefix}/t1`} component={Test_1}/>
        <Route component={NotFoundPage} />
      </Switch>
    </div>
  );
}
