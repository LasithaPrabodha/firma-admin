module.exports = function(firebase) {
  var form = document.querySelector('#login-form');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var email = document.querySelector('#email');
    var password = document.querySelector('#password');
    if (!email.value || !password.value) {
      document.querySelector('.alert-danger').hidden = null;
      document.querySelector('.alert-danger').innerHTML =
        'email and password required';
      return false;
    }
    document.querySelector('.alert-danger').hidden = true;
    document.querySelector('#submit-btn').disabled = true;

    var emailVal = email.value;
    var passVal = password.value;

    // Sign in user
    firebase
      .auth()
      .signInWithEmailAndPassword(emailVal, passVal)
      .catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;

        document.querySelector('.alert-danger').hidden = null;
        document.querySelector('.alert-danger').innerHTML = errorMessage;
        document.querySelector('#submit-btn').disabled = null;

        console.log('signIn error', error);
        // ...
      });
  });
};
