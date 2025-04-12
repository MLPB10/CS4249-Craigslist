// Adapted from http://web.mit.edu/6.813/www/sp18/assignments/as1-implementation/logging.js
//
// A simple Google-spreadsheet-based event logging framework.
//
// Add logging.js to your Web App to log standard input and custom events.
//
// This is currently set up to log every mousedown and keydown
// event, as well as any events that might be triggered within
// the app by triggering the 'log' event anywhere in the doc
// as follows:
//
// document.dispatchEvent(new CustomEvent('log', { detail: {
//   eventName: 'myevent',
//   info: {key1: val1, key2: val2}
// }}));

var ENABLE_NETWORK_LOGGING = true; // Controls network logging.
var ENABLE_CONSOLE_LOGGING = true; // Controls console logging.
var LOG_VERSION = '0.1';           // Labels every entry with version: "0.1".
var NAV_FLOW = 'Multiple steps';
var INPUT_TYPE = 'Manual Entry';
var ELEMENT_SIZE = 'Small';

// These event types are intercepted for logging before jQuery handlers.
var EVENT_TYPES_TO_LOG = {
  mousedown: true,
  keydown: true
};

// These event properties are copied to the log if present.
var EVENT_PROPERTIES_TO_LOG = {
  which: true,
  pageX: true,
  pageY: true
};

// This function is called to record some global state on each event.
var GLOBAL_STATE_TO_LOG = function() {
  return {
  };
};

var loggingjs = (function() { // Immediately-Invoked Function Expression (IIFE); ref: http://benalman.com/news/2010/11/immediately-invoked-function-expression/

// A persistent unique id for the user.
var uid = getUniqueId();

let secretcode = null; // Define with let, initialize to null
try {
    const urlParams = new URLSearchParams(window.location.search);
    secretcode = urlParams.get('secretcode'); 
    // Check if secretcode was found, otherwise use default value 0
    if (secretcode === null || secretcode === undefined || secretcode === '') { // More robust check
        console.log("Secret code not found in URL parameters or is empty. Using default value 0."); // Changed to console.log
        secretcode = 0; 
    }
} catch (e) {
    console.error("Error processing URL parameters:", e);
    secretcode = 0; // Default to 0 in case of error too
}

// Hooks up all the event listeners.
function hookEventsToLog() {
  // Set up low-level event capturing.  This intercepts all
  // native events before they bubble, so we log the state
  // *before* normal event processing.
  for (var event_type in EVENT_TYPES_TO_LOG) {
    document.addEventListener(event_type, logEvent, true);
  }
}

// Returns a CSS selector that is descriptive of
// the element, for example, "td.left div" for
// a class-less div within a td of class "left".
function elementDesc(elt) {
  if (elt == document) {
    return 'document';
  } else if (elt == window) {
    return 'window';
  }
  function descArray(elt) {
    var desc = [elt.tagName.toLowerCase()];
    if (elt.id) {
      desc.push('#' + elt.id);
    }
    for (var j = 0; j < elt.classList.length; j++) {
      desc.push('.' + elt.classList[j]);
    }
    return desc;
  }
  var desc = [];
  while (elt && desc.length <= 1) {
    var desc2 = descArray(elt);
    if (desc.length == 0) {
      desc = desc2;
    } else if (desc2.length > 1) {
      desc2.push(' ', desc[0]);
      desc = desc2;
    }
    elt = elt.parentElement;
  }
  return desc.join('');
}

// Parse user agent string by looking for recognized substring.
function findFirstString(str, choices) {
  for (var j = 0; j < choices.length; j++) {
    if (str.indexOf(choices[j]) >= 0) {
      return choices[j];
    }
  }
  return '?';
}

// Generates or remembers a somewhat-unique ID with distilled user-agent info.
function getUniqueId() {
  if (!('uid' in localStorage)) {
    var browser = findFirstString(navigator.userAgent, [
      'Seamonkey', 'Firefox', 'Chromium', 'Chrome', 'Safari', 'OPR', 'Opera',
      'Edge', 'MSIE', 'Blink', 'Webkit', 'Gecko', 'Trident', 'Mozilla']);
    var os = findFirstString(navigator.userAgent, [
      'Android', 'iOS', 'Symbian', 'Blackberry', 'Windows Phone', 'Windows',
      'OS X', 'Linux', 'iOS', 'CrOS']).replace(/ /g, '_');
    var unique = ('' + Math.random()).substr(2);
    localStorage['uid'] = os + '-' + browser + '-' + unique;
  }
  return localStorage['uid'];
}

// Log the given event.
function logEvent(event, customName, customInfo) {
	
	console.log('event', event, 'customName', customName, 'customInfo', customInfo);
	
  var time = (new Date).getTime();
  var eventName = customName || event.type;
  // By default, monitor some global state on every event.
  var infoObj = GLOBAL_STATE_TO_LOG();
  // And monitor a few interesting fields from the event, if present.
  for (var key in EVENT_PROPERTIES_TO_LOG) {
	if (event && key in event) {
      infoObj[key] = event[key];
    }
  }
  // Let a custom event add fields to the info.
  if (customInfo) {
    infoObj = Object.assign(infoObj, customInfo);
  }
  var info = JSON.stringify(infoObj);
  var target = document;
  if (event) {target = elementDesc(event.target);}
  var state = location.hash;

  if (ENABLE_CONSOLE_LOGGING) {
    console.log(uid, time, eventName, target, info, state, LOG_VERSION);
  }
  if (ENABLE_NETWORK_LOGGING) {
    sendNetworkLog(uid, time, eventName, target, info, state, LOG_VERSION, secretcode, NAV_FLOW, INPUT_TYPE, ELEMENT_SIZE);
  }
}

// OK, go.
if (ENABLE_NETWORK_LOGGING) {
  hookEventsToLog();
}

// module pattern to allow some key functions to be "public"
return {
	logEvent
};

}());

/////////////////////////////////////////////////////////////////////////////
// CHANGE ME:,,,,,,,b,
// ** Replace the function below by substituting your own google form. **
/////////////////////////////////////////////////////////////////////////////
//
// 1. Create a Google form called "Network Log" at forms.google.com.
// 2. Set it up to have several "short answer" questions; here we assume
//    seven questions: uid, time, eventName, target, info, state, version.
// 3. Run googlesender.py to make a javascript
//    function that submits records directly to the form.
// 4. Put that function in here, and replace the current sendNetworkLog
//    so that your version is called to log events to your form.
//
// For example, the following code was written as follows:
// python googlesender.py https://docs.google.com/forms/d/e/1.../viewform
//
// This preocess changes the ids below to direct your data into your own
// form and spreadsheet. The formid must be customized, and also the form
// field names such as "entry.1291686978" must be matched to your form.
// (The numerical field names for a Google form can be found by inspecting
// the form input fields.) This can be done manually, but since this is an
// error-prone process, it can be easier to use googlesender.py.
//
/////////////////////////////////////////////////////////////////////////////

// Untitled form submission function
// submits to the google form at this URL:
// docs.google.com/forms/d/e/1FAIpQLSceUijEU91_ZD6yxkuj8bmiyqpjyZayxm-DoGWtUWYvJ2DicA/viewform
function sendNetworkLog(
    uid,
    time,
    eventname,
    target,
    info,
    state,
    log_version, 
    secretcodeparam,
    navigation_flow,
    input_type,
    element_size) {
  var formid = "e/1FAIpQLSceUijEU91_ZD6yxkuj8bmiyqpjyZayxm-DoGWtUWYvJ2DicA";
  var data = {
    "entry.2145644790": secretcodeparam,
    "entry.1077837961": uid,
    "entry.1417590357": time,
    "entry.449309509": eventname,
    "entry.476660299": target,
    "entry.1310564566": info,
    "entry.504437254": state,
    "entry.104367827": log_version,
    "entry.112553958": navigation_flow,
    "entry.807094603": input_type,
    "entry.1366163530": element_size
  };
  var params = [];
  for (key in data) {
    params.push(key + "=" + encodeURIComponent(data[key]));
  }
  // Submit the form using an image to avoid CORS warnings; warning may still happen, but log will be sent. Go check result in Google Form
  (new Image).src = "https://docs.google.com/forms/d/" + formid +
     "/formResponse?" + params.join("&");
}