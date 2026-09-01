import Parse from 'parse';

Parse.initialize(
  process.env.REACT_APP_PARSE_APPLICATION_ID,
  process.env.REACT_APP_PARSE_JAVASCRIPT_KEY
);

Parse.serverURL = 'https://parseapi.back4app.com/';

export default Parse;