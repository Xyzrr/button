/**
 * Initial setup for fingerprint object in firebase and functions
 * to increment visit and client clicks count
 */
var visits = null;
var clientClicks = null;

var numFingerprints = null;
var numLessFingerprints = null;

var button = document.getElementById("button");
var clickCount = document.getElementById("clicks");

var setInitialStats = incrementVisits => {
  firebase
    .database()
    .ref("fingerprints/" + fingerprint + "/visits")
    .once("value")
    .then(function(snapshot) {
      visits = snapshot.val();
      incrementVisits();
    });

  firebase
    .database()
    .ref("fingerprints/" + fingerprint + "/clicks")
    .once("value")
    .then(function(snapshot) {
      clientClicks = snapshot.val();
      clickCount.innerHTML = clientClicks;
    });

  firebase
    .database()
    .ref("fingerprints")
    .orderByChild("clicks")
    .on("value", function(snapshot) {
      var fingerprints = snapshot.val();

      numFingerprints = Object.keys(fingerprints).length;

      if (fingerprints[fingerprint]) {
        numLessFingerprints = Object.keys(fingerprints).filter(
          key =>
            (fingerprints[key]["clicks"] || 0) <
            fingerprints[fingerprint]["clicks"]
        ).length;
      }

      document.getElementById("percentile").innerHTML =
        "You beat <strong>" +
        ((numLessFingerprints * 100) / (numFingerprints - 1)).toFixed(2) +
        "</strong>% of the competition";
    });
};

/*
 * Incrementing functions (for visits and clicks)
 */
var incrementVisits = () => {
  firebase
    .database()
    .ref("fingerprints/" + fingerprint + "/visits")
    .set((visits = visits + 1 || 1));
};

var incrementClientClicks = () => {
  clientClicks += 1;
  firebase
    .database()
    .ref("fingerprints/" + fingerprint + "/clicks")
    .set((clicks = clientClicks));

  clickCount.innerHTML = clientClicks;
};

/**
 * Object to create a fingerprint that uniquely identifies devices
 */
var fingerprint = null;

ga(function(tracker) {
  fingerprint = tracker.get("clientId").replace(".", "");
  setInitialStats(incrementVisits);
});

/**
 * Initial setup to get reference for firebase value of totalClicks
 */
var clicksRef = firebase.database().ref("clicks");

clicksRef.once("value").then(function(snapshot) {
  document.getElementById("totalClicks").innerHTML =
    snapshot.val() + " Worldwide Clicks";
});

clicksRef.on("value", function(snapshot) {
  document.getElementById("totalClicks").innerHTML =
    snapshot.val() + " Worldwide Clicks";
});

/**
 * Function used to increment the click count and sets the value
 * in Firebase database
 */
var incrementClicks = () => {
  var clicks = parseInt(document.getElementById("totalClicks").innerHTML);
  clicks += 1;

  // Update counts in databse and html
  clicksRef.set((clicks = clicks));

  redness += 0.1;
  newColor = lerpColor(green, red, redness);
  button.style.backgroundColor = newColor;
  button.style.color = lerpColor(newColor, black, 0.25);

  incrementClientClicks();
};

/**
 * Are they haaaaacking?
 */
var consecutiveSameSpotClicks = 0;
var lastX = 0;
var lastY = 0;
var suspicious = false;
var suspiciousClicks = 0;
var cheater = false;
const checkForTrust = e => {
  if (!e.isTrusted) {
    cheaterDetected();
  }
  if (e.clientX === lastX && e.clientY === lastY) {
    consecutiveSameSpotClicks += 1;
    if (consecutiveSameSpotClicks > 200) {
      suspicious = true;
      button.classList.add("suspicious");
      document.getElementById("textContainer").style.display = "none";
      document.getElementById("cheatTest").style.display = "block";
    }
  } else {
    consecutiveSameSpotClicks = 0;
    lastX = e.clientX;
    lastY = e.clientY;
  }
};

const cheaterDetected = () => {
  button.classList.add("suspicious");
  document.getElementById("textContainer").style.display = "none";
  document.getElementById("cheatTest").style.display = "block";
  document.getElementById("cheatTest").innerHTML = "Cheater :(";
  firebase
    .database()
    .ref("fingerprints/" + fingerprint + "/clicks")
    .set(-1);
  clickCount.innerHTML = -1;
  cheater = true;
};

document.getElementById("cheatTest").addEventListener("mousedown", function() {
  suspiciousClicks += 1;
  if (suspiciousClicks >= 10) {
    cheaterDetected();
  }
});

document
  .getElementById("cheatTestButton")
  .addEventListener("mousedown", function(e) {
    window.setTimeout(() => {
      if (!cheater) {
        suspicious = false;
        button.classList.remove("suspicious");
        document.getElementById("textContainer").style.display = "flex";
        document.getElementById("cheatTest").style.display = "none";
        suspiciousClicks = 0;
      }
    }, 500);
  });

window.addEventListener("blur", function() {
  console.log("blur");
  if (suspicious) {
    cheaterDetected();
  }
});

/**
 * Functions to change the color of the button
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

var buttonColor = window
  .getComputedStyle(button, null)
  .getPropertyValue("background-color");
buttonColor = buttonColor
  .substring(4, buttonColor.length - 1)
  .split(",")
  .map(key => Number(key));
buttonColor = rgbToHex(buttonColor[0], buttonColor[1], buttonColor[2]);

var green = "#4CAF50";
var red = "#E03C1F";
var black = "#000000";
var redness = 0;

var decreaseColor = () => {
  var newColor = lerpColor(green, red, redness);
  redness *= 0.95;
  button.style.backgroundColor = newColor;
  button.style.color = lerpColor(newColor, black, 0.25);
  setTimeout(decreaseColor, 50);
};

setTimeout(decreaseColor, 50);

/**
 * A linear interpolator for hexadecimal colors
 * @param {String} a
 * @param {String} b
 * @param {Number} amount
 * @example
 * // returns #7F7F7F
 * lerpColor('#000000', '#ffffff', 0.5)
 * @returns {String}
 */
function lerpColor(a, b, amount) {
  var ah = parseInt(a.replace(/#/g, ""), 16),
    ar = ah >> 16,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ""), 16),
    br = bh >> 16,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + amount * (br - ar),
    rg = ag + amount * (bg - ag),
    rb = ab + amount * (bb - ab);

  return (
    "#" + (((1 << 24) + (rr << 16) + (rg << 8) + rb) | 0).toString(16).slice(1)
  );
}

/**
 * Function for button click
 */
button.addEventListener("mousedown", function(e) {
  incrementClicks();
  checkForTrust(e);
});

button.addEventListener("touchstart", function(e) {
  e.preventDefault();
  incrementClicks();
  button.setActive(true);
});

button.addEventListener("touchend", function(e) {
  e.preventDefault();
  button.setActive(false);
});
