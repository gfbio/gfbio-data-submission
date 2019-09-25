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
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import SubmissionForm from 'containers/SubmissionForm/Loadable';
import SubmissionList from 'containers/SubmissionList/Loadable';
import SubmissionSubNavigation from 'components/SubmissionSubNavigation';
import ScrollToTop from 'components/ScrollToTop';


// TODO: set according to root django url, full path from config/urls.py
//  to APP/urls.py. local development works, but entering URL with prefix
//  prevents error messages.
//  prefix/basename ('/ui/submission') is set in app/utils/history.js which is used
//  in app/app.js where ConnectedRouter is instantiated.
export default function App() {
  // TODO: if services-search style header is desired: extend this
  //  wrapping container here to display full section (override template
  //    section block). take care of django messages.
  //  annonymous div like here should be ok to wrap mulitple sections (like search has)
  return (
    <div>
      <SubmissionSubNavigation />
      <ScrollToTop>
        <Switch>
          <Route exact path='/' component={HomePage} />
          {/* TODO: maybe remove /form url and use / instead ? */}
          <Route exact path='/form' component={SubmissionForm} />
          <Route path='/form/:brokerSubmissionId' component={SubmissionForm} />
          <Route exact path='/list' component={SubmissionList} />
          {/*<Route exact path='/help' component={HelpContent} />*/}
          <Route component={NotFoundPage} />
        </Switch>
      </ScrollToTop>
    </div>
  );
}
