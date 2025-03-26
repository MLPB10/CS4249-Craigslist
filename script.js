/**************************************
 * 1. Record Page Load
 **************************************/
function recordPageLoad(pageName) {
  const loadTime = new Date().toISOString();
  // Retrieve existing log from sessionStorage or start a new one
  let logData = JSON.parse(sessionStorage.getItem('interactionLog')) || [];

  logData.push({
    page: pageName,
    event: 'page_load',
    time: loadTime
  });

  sessionStorage.setItem('interactionLog', JSON.stringify(logData));
  console.log(`Page load recorded: ${pageName} at ${loadTime}`);
}

/**************************************
 * 2. Record Keystrokes
 **************************************/
function recordKeystroke(fieldId, fieldValue) {
  const timestamp = new Date().toISOString();
  let logData = JSON.parse(sessionStorage.getItem('interactionLog')) || [];

  logData.push({
    event: 'keystroke',
    field: fieldId,
    value: fieldValue,
    time: timestamp
  });

  sessionStorage.setItem('interactionLog', JSON.stringify(logData));
  console.log(`Keystroke recorded: ${fieldId} at ${timestamp}, value: ${fieldValue}`);
}

/**************************************
 * 3. Record Page Leave & Navigation
 **************************************/
function recordPageLeave(currentPage) {
  const leaveTime = new Date().toISOString();
  let logData = JSON.parse(sessionStorage.getItem('interactionLog')) || [];

  logData.push({
    page: currentPage,
    event: 'page_leave',
    time: leaveTime
  });

  sessionStorage.setItem('interactionLog', JSON.stringify(logData));
  console.log(`Page leave recorded: ${currentPage} at ${leaveTime}`);
}

/**************************************
 * 4. Helper to Move to the Next Page
 **************************************/
function goToNextPage(currentPage, nextPage) {
  recordPageLeave(currentPage);
  window.location.href = nextPage;
}
