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
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import SubmissionForm from 'containers/SubmissionForm/Loadable';
import SubmissionList from 'containers/SubmissionList/Loadable';


// TODO: set according to root django url, full path from config/urls.py
//  to APP/urls.py. local development works, but entering URL with prefix
//  prevents error messages
const urlPrefix = '/ui/submission';
export default function App() {
  return (
    <div>
      <BrowserRouter basename={urlPrefix}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          {/* TODO: maybe remove /form url and use / instead ? */}
          <Route exact path="/form" component={SubmissionForm} />
          <Route exact path="/list" component={SubmissionList} />
          <Route component={NotFoundPage} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}
