module.exports = function(firebase, $) {
  var form = document.querySelector('#create-form');

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    var email = document.querySelector('#email');
    var password = document.querySelector('#password');
    var password2 = document.querySelector('#password2');
    var displayName = document.querySelector('#dname');

    if (!email.value || !password.value) {
      document.querySelector('.alert-danger').hidden = null;
      document.querySelector('.alert-danger').innerHTML =
        'email and password required';
      return false;
    }

    if (!password2.value) {
      document.querySelector('.alert-danger').hidden = null;
      document.querySelector('.alert-danger').innerHTML =
        'please re enter password';
      return false;
    }

    if (password.value !== password2.value) {
      document.querySelector('.alert-danger').hidden = null;
      document.querySelector('.alert-danger').innerHTML =
        'passwords do not match';
      return false;
    }

    document.querySelector('.alert-danger').hidden = true;
    document.querySelector('.alert-info').hidden = true;
    document.querySelector('#submit-btn').disabled = true;

    var emailVal = email.value;
    var passVal = password.value;
    var dnVal = displayName.value;

    $.ajax({
      type: 'POST',
      url: '/createUser',
      data: { email: emailVal, password: passVal, displayName: dnVal },
      contentType: 'application/x-www-form-urlencoded'
    }).then(
      function() {
        document.querySelector('.alert-info').hidden = null;
        document.querySelector('#submit-btn').disabled = null;
        document.querySelector('.alert-danger').hidden = true;
        document.querySelector('.alert-info').innerHTML =
          'Successfully created new user';
      },
      function(error) {
        document.querySelector('.alert-danger').hidden = null;
        document.querySelector('#submit-btn').disabled = null;
        document.querySelector('.alert-info').hidden = true;
        document.querySelector('.alert-danger').innerHTML = error.message;
        console.log(error);
        // Refresh page on error.
        // window.location.assign('/');
      }
    );
  });
};
