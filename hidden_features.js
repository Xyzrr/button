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
  // $('#username').toggleClass('slide-out');
}

$('#login').on('click', loginClick);
