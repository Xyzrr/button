/**
* Functions for hidden features in button
*/
function addHiddenFeatures(clientClicks) {
  if (clientClicks >= LOGIN_CLICKS && !LOGIN_TOGGLE) {
    LOGIN_TOGGLE = true;
    loginFeature();
  }
}

/**
* Login Feature
*/
function loginFeature() {
  $('.login-feature').toggleClass('show');
}

function loginClick() {
  if (!LOGIN_TOGGLE) {
    return;
  }

  $('.login-feature').toggleClass('slide-out');
}

$('#login').on('click', loginClick);

// Firebase logic for authenticating a user
function authenticateUser() {
  email = document.getElementById("email").value;
  password = document.getElementById("password").value;

  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    // User already has an account
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;

      console.log('Login error');
    });

  });
}

// Prevents refresh from submitting the form
$(".login-feature").submit(function(e) {
    e.preventDefault();
});
