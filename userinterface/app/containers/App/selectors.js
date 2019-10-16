import { createSelector } from 'reselect';

const selectRouter = state => state.get('router');

// TODO: here we could get history and match from router
const makeSelectLocation = () =>
  createSelector(selectRouter, routerState =>
    routerState.get('location').toJS(),
  );

export { makeSelectLocation };
