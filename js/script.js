(function() {
  var firebase = require('firebase');
  var config = require('../config.js');
  var $ = require('jquery');
  var login = require('./login');
  var profile = require('./profile');

  switch (document.location.pathname) {
    case '/':
      document.addEventListener('DOMContentLoaded', login.bind(this, firebase));
      break;
    case '/profile':
      document.addEventListener(
        'DOMContentLoaded',
        profile.bind(this, firebase, $)
      );
      break;
  }

  function getCookie(name) {
    var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
    return v ? v[2] : null;
  }

  // Initialize Firebase app.
  firebase.initializeApp(config);
  // Set persistence to none.
  firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      user.getIdToken().then(function(idToken) {
        // Session login endpoint is queried and the session cookie is set.
        // CSRF token should be sent along with request.
        var csrfToken = getCookie('csrfToken');

        return $.ajax({
          type: 'POST',
          url: '/sessionLogin',
          data: { idToken: idToken, csrfToken: csrfToken },
          contentType: 'application/x-www-form-urlencoded'
        }).then(
          function() {
            window.location.assign('/profile');
          },
          function(error) {
            document.querySelector('#msg-box').hidden = null;
            document.querySelector('.alert-danger').hidden = null;
            document.querySelector('.alert-danger').innerHTML = error.responseJSON.message;
            document.querySelector('#submit-btn').disabled = null;
            console.log(error);
            // Refresh page on error.
            // window.location.assign('/');
          }
        );
      });
    }
  });
})();
