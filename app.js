var express = require('express');
var cookieParser = require('cookie-parser');
var admin = require('firebase-admin');
var bodyParser = require('body-parser');
var cons = require('consolidate');
var app = express();

function attachCsrfToken(url, cookie, value) {
  return function(req, res, next) {
    if (req.url == url) {
      res.cookie(cookie, value);
    }
    next();
  };
}

function checkIfSignedIn(url) {
  return function(req, res, next) {
    if (req.url == url) {
      var sessionCookie = req.cookies.session || '';
      // User already logged in. Redirect to profile page.
      admin
        .auth()
        .verifySessionCookie(sessionCookie, true)
        .then(function(decodedClaims) {
          // next();
          res.redirect('/profile');
        })
        .catch(function(error) {
          next();
        });
    } else {
      next();
    }
  };
}

admin.initializeApp({
  credential: admin.credential.cert('serviceAccountKeys.json'),
  databaseURL: 'https://firma-admin-dev.firebaseio.com'
});

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

app.use(cookieParser());
app.use(
  attachCsrfToken(
    '/',
    'csrfToken',
    (Math.random() * 100000000000000000).toString()
  )
);
// If a user is signed in, redirect to profile page.
app.use(checkIfSignedIn('/'));
// Serve static content from public folder.
app.use('/', express.static('public'));
app.engine('html', cons.swig);

app.set('view engine', 'html');
app.set('views', __dirname + '/public');

/** Get profile endpoint. */
app.get('/profile', function(req, res) {
  var sessionCookie = req.cookies.session || '';
  // Get the session cookie and verify it. In this case, we are verifying if the
  // Firebase session was revoked, user deleted/disabled, etc.
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** check if revoked. */)
    .then(function(decodedClaims) {
      // Serve content for signed in user.
      res.render('profile');
    })
    .catch(function(error) {
      // Force user to login.
      res.redirect('/');
    });
});

/** Session login endpoint. */
app.post('/sessionLogin', function(req, res) {
  var idToken = req.body.idToken.toString();
  var csrfToken = req.body.csrfToken.toString();

  if (!req.cookies || csrfToken !== req.cookies.csrfToken) {
    res.status(401).send('UNAUTHORIZED REQUEST!');
    return;
  }
  // Set session expiration to 5 days.
  var expiresIn = 60 * 60 * 24 * 5 * 1000;

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(function(decodedClaims) {
      // In this case, we are enforcing that the user signed in in the last 5 minutes.
      if (new Date().getTime() / 1000 - decodedClaims.auth_time < 5 * 60) {
        if (decodedClaims.admin) {
          return admin
            .auth()
            .createSessionCookie(idToken, { expiresIn: expiresIn });
        }
      }
      throw new Error('UNAUTHORIZED REQUEST!');
    })
    .then(function(sessionCookie) {
      var options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: false /** to test in localhost */
      };
      res.cookie('session', sessionCookie, options);
      res.end(JSON.stringify({ status: 'success' }));
    })
    .catch(function(error) {
      res.status(401).json({message: 'UNAUTHORIZED REQUEST!'});
    });
});

/** User signout endpoint. */
app.get('/logout', function(req, res) {
  // Clear cookie.
  var sessionCookie = req.cookies.session || '';
  res.clearCookie('session');
  // Revoke session
  if (sessionCookie) {
    admin
      .auth()
      .verifySessionCookie(sessionCookie, true)
      .then(function(decodedClaims) {
        return admin.auth().revokeRefreshTokens(decodedClaims.sub);
      })
      .then(function() {
        res.redirect('/');
      })
      .catch(function() {
        res.redirect('/');
      });
  } else {
    res.redirect('/');
  }
});

app.post('/createUser', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const displayname = req.body.displayName;

  admin
    .auth()
    .createUser({
      email: email,
      emailVerified: false,
      password: password,
      displayName: displayname,
      disabled: false
    })
    .then(function(userRecord) {
      //   admin
      //     .auth()
      //     .setCustomUserClaims(userRecord.uid, { admin: true })
      //     .then(() => {
      // See the UserRecord reference doc for the contents of userRecord.
      res.send('Successfully created new user: ' + userRecord.email);
      // });
    })
    .catch(function(error) {
      res.send('Error creating new user: ' + error.code);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Sample app listening on port ' + PORT);
});
