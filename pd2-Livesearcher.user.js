// ==UserScript==
// @name         pd2-livesearcher
// @namespace    https://github.com/D4Enjoyer/PD2-Livesearcher
// @icon         https://www.google.com/s2/favicons?sz=64&domain=projectdiablo2.com
// @version      2.0.0
// @description  Script to run livesearches on the PD2 website by. Includes Push-/Sound- and Tab-notifications.
// @author       A God Gamer with his dear friends Google-search and ChatGPT
// @match        https://projectdiablo2.com/*
// @grant        GM_notification
// @require      https://code.jquery.com/jquery-latest.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

//TODO: check push notifications

//TODO: highlight number when inputInterval become active

// Sound Files
const soundFiles = [
  "https://web.poecdn.com/audio/trade/pulse.mp3", // Pulse
  "https://web.poecdn.com/audio/trade/piano.mp3", // Piano
  "https://web.poecdn.com/audio/trade/chime.mp3", // Chime
  "https://web.poecdn.com/audio/trade/gong.mp3", // Gong
  "https://assets.mixkit.co/active_storage/sfx/1792/1792-preview.mp3", // Bell
  "https://www.myinstants.com/media/sounds/mlg-airhorn.mp3", // Air Horn
  "https://www.myinstants.com/media/sounds/mlg-sniper.mp3", // Sniper
];

// Object to store settings
const settings = {
  intervalSettings: {
    intervalId: undefined,
    interval: 15000,
  },
  sound: {
    volume: 0.3,
    selectedSoundIndex: 0,
  },
  notifications: {
    enablePushNotifications: false,
    enableSoundNotifications: false,
    enableTabNotifications: false,
    enableTabTitleChange: false,
  },
  scriptState: {
    isRunning: false,
    isFirstSearchOfSession: true,
    previousListings: [],
  },
};

// Temporary variables
let tempInterval = settings.intervalSettings.interval;
let tempVolume = settings.sound.volume;
let tempSoundIndex = settings.sound.selectedSoundIndex;
let tempEnablePush = settings.notifications.enablePushNotifications;
let tempEnableSound = settings.notifications.enableSoundNotifications;
let tempEnableTab = settings.notifications.enableTabNotifications;
let tempEnableTitleChange = settings.notifications.enableTabTitleChange;
let defaultTitle;
let customTitle = defaultTitle;
let savedTabName;

// Function to get default title
function getDefaultTitle() {
  const currentTitle = document.title;
  defaultTitle = currentTitle;
  console.log(`Set default Title to: ${currentTitle}`);
}

// Function to apply temporary settings to actual settings
function applyTempSettings() {
  settings.intervalSettings.interval = tempInterval;
  settings.sound.volume = tempVolume;
  settings.sound.selectedSoundIndex = tempSoundIndex;
  settings.notifications.enablePushNotifications = tempEnablePush;
  settings.notifications.enableSoundNotifications = tempEnableSound;
  settings.notifications.enableTabNotifications = tempEnableTab;
  settings.notifications.enableTabTitleChange = tempEnableTitleChange;
  console.log("Settings Applied");
}

// Function to save settings to local storage
function storeSettings() {
  const savedSettings = {
    interval: settings.intervalSettings.interval,
    soundVolume: settings.sound.volume,
    selectedSoundIndex: settings.sound.selectedSoundIndex,
    enablePushNotifications: settings.notifications.enablePushNotifications,
    enableSoundNotifications: settings.notifications.enableSoundNotifications,
    enableTabNotifications: settings.notifications.enableTabNotifications,
    enableTabTitleChange: settings.notifications.enableTabTitleChange,
  };

  try {
    localStorage.setItem("pd2Settings", JSON.stringify(savedSettings));
    console.log("Settings Saved to Local Storage");
  } catch (error) {
    console.error("Error saving settings to Local Storage:", error);
  }
}

// Function to load settings
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem("pd2Settings");

    if (savedSettings) {
      const loadedSettings = JSON.parse(savedSettings);
      // Update the actual settings
      settings.intervalSettings.interval = loadedSettings.interval;
      settings.sound.volume = loadedSettings.soundVolume;
      settings.sound.selectedSoundIndex = loadedSettings.selectedSoundIndex;
      settings.notifications.enablePushNotifications = loadedSettings.enablePushNotifications;
      settings.notifications.enableSoundNotifications = loadedSettings.enableSoundNotifications;
      settings.notifications.enableTabNotifications = loadedSettings.enableTabNotifications;
      settings.notifications.enableTabTitleChange = loadedSettings.enableTabTitleChange;
      console.log("Settings loaded from Local Storage");
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}

function discardTempSettings() {
  tempInterval = settings.intervalSettings.interval;
  tempVolume = settings.sound.volume;
  tempSoundIndex = settings.sound.selectedSoundIndex;
  tempEnablePush = settings.notifications.enablePushNotifications;
  tempEnableSound = settings.notifications.enableSoundNotifications;
  tempEnableTab = settings.notifications.enableTabNotifications;
  tempEnableTitleChange = settings.notifications.enableTabTitleChange;
  console.log("Temp Settings Discarded");
}

// Function to start the script
function startScript() {
  try {
    if (settings.scriptState.isRunning) {
      console.log("Livesearcher is already running.");
      return; // Exit the function if script is already running
    }
    // Start the script by setting up an interval to run the search
    settings.intervalSettings.intervalId = setInterval(runSearch, settings.intervalSettings.interval);
    settings.scriptState.isRunning = true; // Update the script state
    console.log("Livesearcher started.");
    toggleButtonTextAndColor();
  } catch (error) {
    console.error("Error in startScript:", error);
  }
}

// Function to stop the script
function stopScript() {
  try {
    if (!settings.scriptState.isRunning) {
      console.log("Livesearcher is already stopped.");
      return; // Exit the function if script is already stopped
    }
    // Clear the interval and reset script state when stopping
    if (settings.intervalSettings.intervalId) {
      clearInterval(settings.intervalSettings.intervalId);
      settings.intervalSettings.intervalId = null; // Reset intervalId
    }
    settings.scriptState.isRunning = false; // Update the script state
    settings.scriptState.previousListings = []; // Reset previous listings
    settings.scriptState.isFirstSearchOfSession = true;
    console.log("Livesearcher stopped.");
    toggleButtonTextAndColor();
  } catch (error) {
    console.error("Error in stopScript:", error);
  }
}

// Function to restart the interval timer
function restartInterval() {
  if (settings.scriptState.isRunning) {
    clearInterval(settings.intervalSettings.intervalId);
    settings.intervalSettings.intervalId = setInterval(runSearch, settings.intervalSettings.interval);
    console.log("Livesearcher restarted.");
  }
}

// Function to search for items
function runSearch() {
  const button = $('button.gold.mb-2:contains("Search")').first(); // Find the first button that contains "Search"
  if (button.length > 0) {
    button.click(); // Click the button

    // Extract and notify market listing value immediately after the click
    extractAndNotifyMarketListingValue();
  } else {
    console.error("Button not found or unavailable."); // Log an error if the button is not found
  }
}

// Function to log new items
function newItemLog(newListings) {
  let newItemsMessage = "";
  newListings.forEach((newItem) => {
    newItemsMessage += `New Item: ${newItem}\n`;
  });
  console.log(newItemsMessage);
}

// Function to extract listings
function extractListings() {
  // Find elements with the specified class
  const elements = $(".image.flex.justify-center.items-center");
  // Map the href attribute of each element to form an array of current listings
  return elements.toArray().map((element) => element.getAttribute("href"));
}

// Function to handle new listings
function handleNewListings(newListings) {
  // Display a notification if enabled
  if (settings.notifications.enablePushNotifications) {
    showNotification("New Item listed");
  }
  // Play the selected sound if sound notifications are enabled
  if (settings.notifications.enableSoundNotifications) {
    playSelectedSound();
  }
  // Notify the current tab if tab notifications are enabled
  if (settings.notifications.enableTabNotifications) {
    notifyCurrentTab();
  }
  // Log new items
  newItemLog(newListings);
}

// Function to check for new listings and trigger notifications
function checkForNewListings(currentListings) {
  // Check for new listings by comparing the current listings with the previous ones
  const newListings = currentListings.filter((listing) => !settings.scriptState.previousListings.includes(listing));

  // Check if there are new listings
  if (newListings.length > 0) {
    handleNewListings(newListings);
  }
}

// Main function to extract and notify market listing value
function extractAndNotifyMarketListingValue() {
  try {
    // Check if first search, then store initial Listings
    const currentListings = extractListings();
    if (settings.scriptState.isFirstSearchOfSession) {
      settings.scriptState.previousListings = currentListings;
      settings.scriptState.isFirstSearchOfSession = false;
    } else {
      // Check for new listings and trigger notifications
      checkForNewListings(currentListings);
      // Update previous listings
      settings.scriptState.previousListings = currentListings;
    }
  } catch (error) {
    // Log any errors occurred during the process
    console.error("Error in extractAndNotifyMarketListingValue:", error);
  }
}

// Function to play the selected test sound
function playTestSound() {
  // Create an Audio object with the selected sound file
  const audio = new Audio(soundFiles[tempSoundIndex]);
  // Set the volume for the audio
  audio.volume = tempVolume;
  // Play the audio
  audio.play();
}

// Function to play the selected sound
function playSelectedSound() {
  // Create an Audio object with the selected sound file
  const audio = new Audio(soundFiles[settings.sound.selectedSoundIndex]);
  // Set the volume for the audio
  audio.volume = settings.sound.volume;
  // Play the audio
  audio.play();
}

function changeFavicon(src) {
  var $link = $("<link>", {
    id: "dynamic-favicon",
    rel: "shortcut icon",
    href: src,
  });

  var $oldLink = $("#dynamic-favicon");
  if ($oldLink.length) {
    $oldLink.remove();
  }

  $("head").append($link);
}

function notifyCurrentTab() {
  try {
    if (!document.hidden) return;

    changeFavicon("https://hotemoji.com/images/emoji/x/1bhnnpa1j5ajx.png");

    $(document).one("visibilitychange", function () {
      if (!document.hidden) {
        // Remove the changed favicon
        changeFavicon("https://projectdiablo2.com/favicon.ico");
      }
    });
  } catch (error) {
    console.error("Error in notifyCurrentTab:", error);
  }
}

function notifyTestTab() {
  try {
    changeFavicon("https://hotemoji.com/images/emoji/x/1bhnnpa1j5ajx.png");
    // Delay changing back the favicon
    setTimeout(function () {
      changeFavicon("https://projectdiablo2.com/favicon.ico");
    }, 1000);
  } catch (error) {
    console.error("Error in notifyTestTab:", error);
  }
}

// Function to show a push notification
function showNotification(message) {
  try {
    const options = {
      body: message,
      icon: "https://live.projectdiablo2.com/image/portal.png",
    };
    const notification = new Notification("PD2 Market: New Item found", options);
  } catch (error) {
    console.error("Error displaying notification:", error);
  }
}

// Function to inject custom CSS styles
function addCustomStyles() {
  const customStyles = `
    /* Prevent spinners on number inputs */
    .no-spinners::-webkit-outer-spin-button,
    .no-spinners::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    /* For Firefox */
    .no-spinners {
      -moz-appearance: textfield;
    }
  `;

  const style = document.createElement("style");
  style.textContent = customStyles;
  document.head.appendChild(style);
}

// Function to set a specific title
function setTitle(title) {
  document.title = title;
}

// Function to show a preview of title change
function testTabTitleChange() {
  // Change the tab title
  document.title = "This tab's titel was changed";
  // Revert the tab title
  setTimeout(function () {
    document.title = defaultTitle;
  }, 1000);
}

// Your existing click event handling for the Start button
function handleStartButtonClick() {
  const isTabTitleChangeEnabled = settings.notifications.enableTabTitleChange;

  if (isTabTitleChangeEnabled) {
    openTabNameModal(); // Open the modal for tab name change
  } else {
    // If tab title change is not enabled, start the search directly
    startScript();
  }
}

// Function to handle Stop button click
function handleStopButtonClick() {
  try {
    stopScript(); // Stop the script
    toggleButtonTextAndColor();
    setTitle(defaultTitle);
  } catch (error) {
    console.error("Error in handleStopButtonClick:", error);
  }
}

// Function to handle Settings button click
function handleSettingsButtonClick() {
  try {
    discardTempSettings();
    openSettingsModal(); // Open settings
    $(document).on("keydown", handleKeyPress);
  } catch (error) {
    console.error("Error in handleSettingsButtonClick:", error);
  }
}

// Function to show icon when saving settings
function showSaveIconForTwoSeconds() {
  const saveButton = $("#saveButton");
  const settingsButton = $("#settingsButton");
  const svgIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="h-5/6 absolute" style="display: block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
  settingsButton.empty();
  // Add the SVG icon to the button
  settingsButton.append(svgIcon);
  // Show the icon for 2 seconds
  setTimeout(() => {
    // After 2 seconds, hide the icon and remove it from the button
    settingsButton.find("svg").remove();
    settingsButton.text("Settings");
  }, 2000);
}

// Function to show an icon for two seconds when stopping search
function showStopIconForTwoSeconds() {
  const stopButton = $("#stopButton");
  const svgIcon =
    '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="h-5/6 absolute" style="display: block;"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>';
  stopButton.empty();
  // Add the SVG icon to the button
  stopButton.append(svgIcon);
  // Show the icon for 2 seconds
  setTimeout(() => {
    // After 2 seconds, hide the icon and remove it from the button
    stopButton.find("svg").remove();
    stopButton.text("Stop");
  }, 2000);
}

// Function to show icons on start or stop
function toggleButtonTextAndColor() {
  const startButton = $("#startButton");
  const stopButton = $("#stopButton");
  const isRunning = settings.scriptState.isRunning;

  if (isRunning) {
    startButton.empty(); // Clear existing content inside the button
    const svgIconRun =
      '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true" class="animate-spin h-5/6 absolute" style="display: block;"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>';
    startButton.append(svgIconRun);
    stopButton.text("Stop");
  } else {
    startButton.text("Start");
    showStopIconForTwoSeconds();
  }
}

function createButtons() {
  // Create Buttons
  var buttons = [
    // Settings Button
    '<button id="settingsButton" class="button mb-6" data-v-0463c62d="" style="background-color: #87600d;" onmouseover="this.style.backgroundColor=\'#684b0b\'" onmouseout="this.style.backgroundColor=\'#87600d\'"><span class="" data-v-0463c62d="">Settings</span></button>',
    // Stop Button
    '<button id="stopButton" class="button mb-2" data-v-0463c62d="" style="background-color: #aa2800;" onmouseover="this.style.backgroundColor=\'#862000\'" onmouseout="this.style.backgroundColor=\'#aa2800\'"><span class="" data-v-0463c62d="">Stop</span></button>',
    // Start Button
    '<button id="startButton" class="button mb-2" data-v-0463c62d="" style="background-color: #0d8727;" onmouseover="this.style.backgroundColor=\'#0d6e23\'" onmouseout="this.style.backgroundColor=\'#0d8727\'"><span class="" data-v-0463c62d="">Start</span></button>',
  ];
  var parentElement = $(".flex.flex-col.w-full");
  // Loop through the buttons array and prepend each button HTML to the parent element
  buttons.forEach(function (buttonHTML) {
    parentElement.prepend(buttonHTML);
  });

  // Add click event listeners to the buttons
  $("#settingsButton").on("click", handleSettingsButtonClick);
  $("#stopButton").on("click", handleStopButtonClick);
  $("#startButton").on("click", handleStartButtonClick);
}

const handlePushCheckboxChange = function () {
  const isChecked = this.checked;
  tempEnablePush = isChecked;
  if (isChecked) {
    // Show test push notification
    showNotification("This is a test notification for Push Notifications.");
  }
};

const handleSoundCheckboxChange = function () {
  const isChecked = this.checked;
  tempEnableSound = isChecked;

  // Play test sound notification
  if (isChecked) {
    playTestSound();
  }
};

const handleTabCheckboxChange = function () {
  const isChecked = this.checked;
  tempEnableTab = isChecked;
  //Show test tab notification
  if (isChecked) {
    notifyTestTab();
  }
};

const handleTabTitleChange = function () {
  const isChecked = this.checked;
  tempEnableTitleChange = isChecked;
  //Show test tab notification
  if (isChecked) {
    testTabTitleChange();
  }
};

const handleVolumeInputChange = function () {
  const inputVolume = parseFloat($(this).val());
  tempVolume = inputVolume * 0.1;
  // Play the sound only when sound notifications are enabled
  if (tempEnableSound) {
    playTestSound();
  }
};

const handleSoundSelectChange = function () {
  tempSoundIndex = parseInt($(this).val());
  // Play the sound only when sound notifications are enabled
  if (tempEnableSound) {
    playTestSound();
  }
};

const handleIntervalInputChange = function () {
  $(this).on("blur", function () {
    let inputValInSeconds = parseInt($(this).val());

    // Ensure the input value is at least 5 seconds
    if (inputValInSeconds < 5) {
      inputValInSeconds = 5;
      $(this).val(inputValInSeconds); // Update the input field
    }

    // Convert seconds to milliseconds for the interval
    const inputValInMilliseconds = inputValInSeconds * 1000;

    // Update the temporary interval only when the input field loses focus
    tempInterval = inputValInMilliseconds;
  });
};

const handleSaveButtonClick = function () {
  showSaveIconForTwoSeconds();
  applyTempSettings();
  storeSettings();
  closeSettingsModal();
  restartInterval();
};

const handleCancelButtonClick = function () {
  discardTempSettings();
  closeSettingsModal(); // Close the settings modal after saving
};

// Event handler for Enter and Esc keys
const handleKeyPress = function (event) {
  if (event.which === 13) {
    // Enter key
    handleSaveButtonClick(); // Trigger click event on the save button
  }
  if (event.which === 27) {
    // Esc key
    handleCancelButtonClick(); // Trigger click event on the cancel button
  }
};

// Function to close the settings modal
function closeSettingsModal() {
  $(".settings-modal").remove();
  $(document).off("keydown", handleKeyPress);
  console.log("Menu Closed");
}

// Function to open the settings modal
function openSettingsModal() {
  // Create the modal overlay
  const modal = $("<div>")
    .addClass("settings-modal")
    .css({
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "9999",
    })
    .on("click", function (event) {
      // Check if the click is outside the settings box
      if (!$(event.target).closest(settingsBox).length) {
        handleCancelButtonClick(); // Call the cancel action
      }
    });

  const settingsBox = $("<div>").css({
    position: "absolute",
    width: "320px",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "lightgrey",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    zIndex: "10000",
  });

  // Close and save buttons
  const cancelButton = $("<button>")
    .text("Cancel")
    .css({
      float: "right",
      marginTop: "20px",
    })
    .on("click", handleCancelButtonClick);

  const saveButton = $("<button>")
    .text("Save")
    .attr("id", "saveButton")
    .css({
      float: "left",
      marginTop: "20px",
    })
    .on("click", handleSaveButtonClick);

  const createCheckboxInputWithLabel = (labelText, checked, onChange) => {
    const container = $("<div>").css({
      display: "flex",
      alignItems: "left",
      justifyContent: "space-between",
      marginBottom: "10px", // Add some margin between checkboxes
    });

    const checkboxLabel = $("<label>").text(labelText).css({
      color: "black",
      order: "1",
    });

    const checkbox = $("<input>")
      .attr({
        type: "checkbox",
      })
      .prop("checked", checked)
      .css({
        width: "auto",
        order: "2",
      })
      .on("change", onChange);

    container.append(checkboxLabel, checkbox); // Append label before checkbox

    return container;
  };

  // Volume abels and inputs creation
  const volumeContainer = $("<div>").css({
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "10px", // Adjust top margin as needed
    color: "black",
  });

  const volumeLabel = $("<label>").text("Volume:").css({
    marginRight: "10px", // Add space between label and input
  });

  const volumeInput = $("<input>")
    .attr({
      type: "range",
      min: "0",
      max: "1",
      step: "0.01",
      value: settings.sound.volume.toString(),
    })
    .css({
      width: "70%",
    })
    .on("change", handleVolumeInputChange);

  // Append label and input to the volume container
  volumeContainer.append(volumeLabel, volumeInput);

  // Create a container for sound selection label and dropdown
  const soundSelectContainer = $("<div>").css({
    display: "flex",
    alignItems: "left",
    justifyContent: "space-between",
    marginTop: "10px", // Adjust top margin as needed
    color: "black",
  });

  const soundSelectLabel = $("<label>").text("Select Sound:").css({
    marginRight: "10px", // Add space between label and dropdown
  });

  const soundSelect = $("<select>")
    .css({
      width: "40%",
      marginBottom: "10px",
      textAlign: "center",
    })
    .on("change", handleSoundSelectChange);

  // Populate sound selection options
  const soundNames = ["Pulse", "Piano", "Chime", "Gong", "Bell", "Air Horn", "Sniper"];
  for (let i = 0; i < soundFiles.length; i++) {
    const option = $("<option>").attr("value", i.toString()).text(soundNames[i]);
    soundSelect.append(option);
  }
  soundSelect.val(settings.sound.selectedSoundIndex.toString()); // Set the default selected value

  // Append label and dropdown to the sound select container
  soundSelectContainer.append(soundSelectLabel, soundSelect);

  // Create a container for the interval input label and input
  const intervalContainer = $("<div>").css({
    display: "flex",
    alignItems: "left",
    justifyContent: "space-between", // Align items with space between them
    marginTop: "10px", // Adjust top margin as needed
    color: "black",
  });

  const intervalLabel = $("<label>").text("Interval:").css({
    marginRight: "10px", // Add space between label and input
  });

  const intervalInput = $("<input>")
    .addClass("no-spinners") // Add a class for styling
    .attr({
      type: "number",
      min: "5",
      inputmode: "numeric", // Prevents increment/decrement arrows
      pattern: "[0-9]*", // For browsers not supporting inputmode
      value: (settings.intervalSettings.interval / 1000).toString(),
    })
    .css({
      width: "25%",
      textAlign: "center",
    })
    .on("input", handleIntervalInputChange);

  const intervalSuffix = $("<label>").text("seconds").css({
    marginLeft: "10px", // Add space between label and input
  });

  // Append label and input to the interval container
  intervalContainer.append(intervalLabel, intervalInput, intervalSuffix);

  // Appending elements to the settings box
  settingsBox.append(
    createCheckboxInputWithLabel("Push Notifications:", settings.notifications.enablePushNotifications, handlePushCheckboxChange),
    createCheckboxInputWithLabel("Sound Notifications:", settings.notifications.enableSoundNotifications, handleSoundCheckboxChange),
    createCheckboxInputWithLabel("Tab Notifications:", settings.notifications.enableTabNotifications, handleTabCheckboxChange),
    createCheckboxInputWithLabel("Change Tab Title", settings.notifications.enableTabTitleChange, handleTabTitleChange),
    volumeContainer,
    soundSelectContainer,
    intervalContainer,
    cancelButton,
    saveButton
  );

  // Appending settings box to modal and to the body
  modal.append(settingsBox);
  $("body").append(modal);
  saveButton.focus();
}

function openTabNameModal() {
  const modal = $("<div>")
    .addClass("tab-name-modal")
    .css({
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: "9999",
    })
    .on("click", function (event) {
      if ($(event.target).hasClass("tab-name-modal")) {
        modal.remove(); // Close the modal when clicking outside the content area
      }
    });

  const modalContent = $("<div>")
    .css({
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: "lightgray",
      padding: "20px",
      borderRadius: "8px",
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    })
    .on("keydown", function (event) {
      if (event.which === 13) {
        // Check for Enter key press
        confirmButton.click(); // Trigger click event on the confirm button
      }
      if (event.which === 27) {
        // Check for Esc key press
        closeButton.click(); // Trigger click event on the confirm button
      }
    });

  const inputField = $("<input>")
    .attr({
      type: "text",
      id: "tabNameModal",
      placeholder: "Enter search name",
    })
    .css({
      width: "100%",
      marginBottom: "10px",
    })
    .val(savedTabName);

  const confirmButton = $("<button>")
    .text("Start")
    .on("click", function () {
      savedTabName = $("#tabNameModal").val();
      customTitle = savedTabName;
      setTitle(customTitle);
      startScript(); // Start the search process after changing the title
      modal.remove(); // Close the modal after saving
    });

  const closeButton = $("<button>")
    .text("Close")
    .css({
      float: "right", // Align the button to the right
    })
    .on("click", function () {
      modal.remove(); // Remove the modal when the close button is clicked
    });

  modalContent.append(inputField, confirmButton, closeButton);
  modal.append(modalContent);
  $("body").append(modal);
  saveButton.focus(); // Focus on the input field when the modal opens
}

// Call loadSettings function after creating the menu
waitForKeyElements("h2.heading.white.sm.mt-4.text-center:contains('Search to see results')", function () {
  addCustomStyles();
  createButtons();
  loadSettings();
  getDefaultTitle();
});
