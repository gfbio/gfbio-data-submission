# Submission user-interface

ReactJs based user-interface code and components, 
like data-submission-forms, dashboards, etc..

## Note on set-up 

- TODO: axios instead of whatwg fetch ???

### Commands

- refer to react_boilerplate_docs

#### Develop standalone with hot-reloading

      npm start

start a local node server that provides access
to localhost and network internal IP. E.g:
  
      Access URLs:
      -----------------------------------
      Localhost: http://localhost:3000
      LAN: http://172.30.172.168:3000
  
#### Develop in conjunction with django+templates

start a script that perform a complete production build
of the react-app and copies, renames, replaces all wherever
necessary, to then perform a collect static action for django:
  
      npm run collect
      
then access app via django development server. 


### Git and built app in django static directory

#### Initial Approach

- app code is under version control. build/ and its content is not.
- built app code in static/js or static/css 
  (copied by 'npm collect' for example) may be under 
  version control. This is not a strict rule since app can be rebuild
  at any time.
- if built app code is under VC and is updated, old js chunks should be
  deleted

