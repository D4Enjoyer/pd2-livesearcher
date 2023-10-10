// ==UserScript==
// @name         PD2 Livesearcher
// @namespace    https://github.com/D4Enjoyer/PD2-Livesearcher
// @icon         https://www.google.com/s2/favicons?sz=64&domain=projectdiablo2.com
// @version      1.4.0
// @description  Script to run livesearches on pd2-trade by simulating clicks on the "Search" button. Includes customizable Browser/Sound/Tab notifications.
// @author       A God Gamer with his dear friends Google-search and ChatGPT
// @match        https://live.projectdiablo2.com/market
// @grant        GM_notification
// ==/UserScript==

(function () {
  'use strict';

  let intervalId;
  let isRunning = false;
  let interval = 5000; // Default interval in milliseconds (5 seconds)
  let previousValue = null;
  let previousSecondValue = null;
  let isFirstSearchOfSession = true;
  let soundVolume = 0.3; // Default sound volume (0 to 1)
  let selectedSoundIndex = 0; // Default sound index (0 to 4)
  let enablePushNotifications = false; // Default setting for push notifications
  let enableSoundNotifications = true; // Default setting for sound notifications
  let enableTabNotifications = true; // Default setting for tab notifications
  const soundFiles = [
    'https://web.poecdn.com/audio/trade/pulse.mp3', // Pulse
    'https://web.poecdn.com/audio/trade/piano.mp3', // Piano
    'https://web.poecdn.com/audio/trade/chime.mp3', // Chime
    'https://web.poecdn.com/audio/trade/gong.mp3', // Gong
    'https://assets.mixkit.co/active_storage/sfx/1792/1792-preview.mp3', // Bell
  ];

  // Function to click the button and extract market listing value
  function clickButton() {
    const buttons = document.querySelectorAll('button.gold.mb-2'); // Update the class to 'button.gold'
    if (buttons.length > 0) {
      buttons[0].click(); // Assuming you want to click the first button found with the specified class

      // Extract and notify market listing value after a click
      setTimeout(extractAndNotifyMarketListingValue, 2000); // Call the function 2 seconds after the click
    }
  }

  // Function to toggle the script on/off
  function toggleScript() {
    if (isRunning) {
      clearInterval(intervalId);
    } else {
      intervalId = setInterval(clickButton, interval);
    }
    isRunning = !isRunning;
  }

  // Function to create the menu and its items
  function createMenu() {
    // Create the menu container
    const menuContainer = document.createElement('div');
    menuContainer.style.position = 'fixed'; // Fixed position
    menuContainer.style.top = '145px'; // Position from the top
    menuContainer.style.right = '30px'; // Position from the right
    menuContainer.style.zIndex = '9999'; // Ensure it's above other elements

    // Create the menu button with HTML icon
    const menuButton = document.createElement('button');
    menuButton.style.width = '50px';
    menuButton.style.height = '50px';
    menuButton.style.background = 'none';
    menuButton.style.border = 'none';
    menuButton.style.borderRadius = '50%';
    menuButton.style.display = 'flex';
    menuButton.style.justifyContent = 'center';
    menuButton.style.alignItems = 'center';
    menuButton.style.color = '#D3D3D3'; // Light grey color
    menuButton.style.fontSize = '35px'; // Increase the font size
    menuButton.innerHTML = '<span style="font-size: 24px;">☰</span>'; // HTML icon for menu

    // Create the menu dropdown
    const menuDropdown = document.createElement('div');
    menuDropdown.style.display = 'none';
    menuDropdown.style.position = 'absolute';
    menuDropdown.style.top = '60px'; // Position it below the button
    menuDropdown.style.right = '0';
    menuDropdown.style.background = 'rgba(255, 255, 255, 0)'; // Transparent background
    menuDropdown.style.border = '0';
    menuDropdown.style.padding = '10px';

    // Create start button
    const startButton = document.createElement('button');
    startButton.innerText = 'Start';
    startButton.style.width = '100%';
    startButton.style.color = '#D3D3D3'; // Light grey color
    startButton.addEventListener('click', function () {
      if (!isRunning) {
        toggleScript();
      }
    });

    // Create stop button
    const stopButton = document.createElement('button');
    stopButton.innerText = 'Stop';
    stopButton.style.width = '100%';
    stopButton.style.color = '#D3D3D3'; // Light grey color
    stopButton.addEventListener('click', function () {
      if (isRunning) {
        toggleScript();
      }
    });

    // Create settings button
    const settingsButton = document.createElement('button');
    settingsButton.innerText = 'Settings';
    settingsButton.style.width = '100%';
    settingsButton.style.color = '#D3D3D3'; // Light grey color
    settingsButton.addEventListener('click', openSettingsModal);

    // Append items to the dropdown
    menuDropdown.appendChild(startButton);
    menuDropdown.appendChild(stopButton);
    menuDropdown.appendChild(settingsButton);

    // Append the menu button and dropdown to the menu container
    menuContainer.appendChild(menuButton);
    menuContainer.appendChild(menuDropdown);

    // Append the menu container to the body
    document.body.appendChild(menuContainer);

    // Hover events for opening and closing the dropdown
    let dropdownTimeout;
    menuContainer.addEventListener('mouseover', function () {
      clearTimeout(dropdownTimeout);
      menuDropdown.style.display = 'block';
    });

    menuContainer.addEventListener('mouseout', function () {
      dropdownTimeout = setTimeout(function () {
        menuDropdown.style.display = 'none';
      }, 800); // Close after 800 milliseconds of no mouse hover
    });
  }

  // Function to open the settings modal
  function openSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'settings-modal'; // Add a class for easy reference
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '9999';

    const settingsBox = document.createElement('div');
    settingsBox.style.position = 'absolute';
    settingsBox.style.top = '50%';
    settingsBox.style.left = '50%';
    settingsBox.style.transform = 'translate(-50%, -50%)';
    settingsBox.style.backgroundColor = 'lightgrey';
    settingsBox.style.padding = '20px';
    settingsBox.style.borderRadius = '8px';
    settingsBox.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    settingsBox.style.zIndex = '10000';

    const closeButton = document.createElement('button');
    closeButton.innerText = 'Close';
    closeButton.style.float = 'right'; // Align to the right
    closeButton.style.marginTop = '10px';
    closeButton.addEventListener('click', closeSettingsModal);

    const saveButton = document.createElement('button');
    saveButton.innerText = 'Save';
    saveButton.style.float = 'left'; // Align to the left
    saveButton.style.marginTop = '10px';
    saveButton.addEventListener('click', function () {
      saveSettings(); // Function to save settings
      closeSettingsModal();
    });

    // Define a function to create checkbox input elements with labels.
    const createCheckboxInputWithLabel = (labelText, checked, onChange) => {
      const container = document.createElement('div');
      container.style.display = 'flex';
      container.style.alignItems = 'center';
      container.style.justifyContent = 'space-between'; // Right-align checkboxes

      const checkboxLabel = document.createElement('label');
      checkboxLabel.style.color = 'black';
      checkboxLabel.style.flex = '1'; // Allow label to take up available space

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = checked;
      checkbox.style.width = 'auto';
      checkbox.addEventListener('change', onChange);

      checkboxLabel.appendChild(document.createTextNode(labelText));
      container.appendChild(checkboxLabel);
      container.appendChild(checkbox);

      return container;
    };

    // Define a function to handle changes in push notification checkbox.
    function handlePushCheckboxChange() {
      enablePushNotifications = this.checked;
      // Send a test push notification when enabling push notifications
      if (enablePushNotifications) {
        showNotification('Test Push Notification');
      }
    }

    // Define a function to handle changes in sound notification checkbox.
    function handleSoundCheckboxChange() {
      enableSoundNotifications = this.checked;
      playSelectedSound(); // Play the selected sound to test
    }

    // Define a function to handle changes in tab notification checkbox.
    function handleTabCheckboxChange() {
      enableTabNotifications = this.checked;
      if (!enableTabNotifications) {
        clearTabNotifications();
      }
    }

    const enablePushContainer = createCheckboxInputWithLabel(
      'Enable Push Notifications:',
      enablePushNotifications,
      handlePushCheckboxChange
    );

    const enableSoundContainer = createCheckboxInputWithLabel(
      'Enable Sound Notifications:',
      enableSoundNotifications,
      handleSoundCheckboxChange
    );

    const enableTabContainer = createCheckboxInputWithLabel(
      'Enable Tab Notifications:',
      enableTabNotifications,
      handleTabCheckboxChange
    );

    const volumeLabel = document.createElement('label');
    volumeLabel.innerText = 'Volume:';
    volumeLabel.style.display = 'block';
    volumeLabel.style.marginTop = '10px';
    volumeLabel.style.color = 'black';

    const volumeInput = document.createElement('input');
    volumeInput.type = 'range';
    volumeInput.min = '0';
    volumeInput.max = '1';
    volumeInput.step = '0.1';
    volumeInput.value = soundVolume.toString();
    volumeInput.style.width = '100%';
    volumeInput.addEventListener('input', function () {
      soundVolume = parseFloat(volumeInput.value);
      playSelectedSound(); // Play the selected sound to test the volume
    });

    const soundSelectLabel = document.createElement('label');
    soundSelectLabel.innerText = 'Select Sound:';
    soundSelectLabel.style.display = 'block';
    soundSelectLabel.style.marginTop = '10px';
    soundSelectLabel.style.color = 'black';

    const soundSelect = document.createElement('select');
    soundSelect.style.width = '100%';
    soundSelect.style.marginBottom = '10px';
    soundSelect.addEventListener('change', function () {
      selectedSoundIndex = parseInt(soundSelect.value);
      playSelectedSound(); // Play the selected sound to test
    });

    // Populate sound selection options
    const soundNames = ['Pulse', 'Piano', 'Chime', 'Gong', 'Bell'];
    for (let i = 0; i < soundFiles.length; i++) {
      const option = document.createElement('option');
      option.value = i.toString();
      option.text = `Sound ${i + 1} (${soundNames[i]})`;
      soundSelect.appendChild(option);
    }

    soundSelect.value = selectedSoundIndex.toString(); // Set the default selected value

    const intervalLabel = document.createElement('label');
    intervalLabel.innerText = 'Interval (milliseconds):';
    intervalLabel.style.display = 'block';
    intervalLabel.style.marginTop = '10px';
    intervalLabel.style.color = 'black';

    const intervalInput = document.createElement('input');
    intervalInput.type = 'number';
    intervalInput.min = '1000';
    intervalInput.value = interval.toString();
    intervalInput.style.width = '100%';

    intervalInput.addEventListener('input', function () {
      interval = parseInt(intervalInput.value);
    });

    settingsBox.appendChild(enablePushContainer);
    settingsBox.appendChild(enableSoundContainer);
    settingsBox.appendChild(enableTabContainer);
    settingsBox.appendChild(volumeLabel);
    settingsBox.appendChild(volumeInput);
    settingsBox.appendChild(soundSelectLabel);
    settingsBox.appendChild(soundSelect);
    settingsBox.appendChild(intervalLabel);
    settingsBox.appendChild(intervalInput);
    settingsBox.appendChild(closeButton);
    settingsBox.appendChild(saveButton); // Add the Save button

    modal.appendChild(settingsBox);
    document.body.appendChild(modal);
  }

  // Function to close the settings modal
  function closeSettingsModal() {
    const modal = document.querySelector('.settings-modal');
    if (modal) {
      modal.parentNode.removeChild(modal);
    }
  }

  // Function to extract and notify market listing value
  function extractAndNotifyMarketListingValue() {
    // Use querySelectorAll to find all elements with the class "image flex justify-center items-center"
    const elements = document.querySelectorAll('.image.flex.justify-center.items-center');

    // Extract the href attribute of the first and second elements, if they exist
    const firstHref = elements.length > 0 ? elements[0].getAttribute('href') : null;
    const secondHref = elements.length > 1 ? elements[1].getAttribute('href') : null;

    // Log the current first and second href values to the console for testing
    // console.log('Current First Href:', firstHref);
    // console.log('Current Second Href:', secondHref);

    // Check if the values have changed from null after the first search of the session
    if (isFirstSearchOfSession) {
      // Update the session flag to indicate that the first search of the session has occurred
      isFirstSearchOfSession = false;
    } else if (!isFirstSearchOfSession && firstHref !== previousValue) {
      // Check if the new first value is not the same as the previous second value
      if (firstHref !== previousSecondValue) {
        // Display a notification
        if (enablePushNotifications) {
          showNotification('New Item listed');
        }

        // Play the selected sound if sound notifications are enabled
        if (enableSoundNotifications) {
          playSelectedSound();
        }

        // Notify the current tab if tab notifications are enabled
        if (enableTabNotifications) {
          notifyCurrentTab();
        }
      }
    }

    // Update the previous values to the new values for comparison in the next cycle
    previousValue = firstHref;
    previousSecondValue = secondHref;
  }

  // Function to play the selected sound
  function playSelectedSound() {
    if (enableSoundNotifications) {
      const audio = new Audio(soundFiles[selectedSoundIndex]);
      audio.volume = soundVolume;
      audio.play();
    }
  }

  // Function to show a browser notification
  function showNotification(message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const options = {
        body: message,
        icon: 'https://live.projectdiablo2.com/image/portal.png', // Replace with your own icon URL
      };
      const notification = new Notification('PD2 Market', options);
    }
  }

  // Function to request notification permission
  function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }

  // Function to save settings
  function saveSettings() {
    const settings = {
      interval: interval,
      soundVolume: soundVolume,
      selectedSoundIndex: selectedSoundIndex,
      enablePushNotifications: enablePushNotifications,
      enableSoundNotifications: enableSoundNotifications,
      enableTabNotifications: enableTabNotifications,
    };

    // Store settings in local storage
    localStorage.setItem('pd2Settings', JSON.stringify(settings));
  }

  // Function to load saved settings
  function loadSettings() {
    const savedSettings = localStorage.getItem('pd2Settings');

    if (savedSettings) {
      const settings = JSON.parse(savedSettings);

      interval = settings.interval;
      soundVolume = settings.soundVolume;
      selectedSoundIndex = settings.selectedSoundIndex;
      enablePushNotifications = settings.enablePushNotifications;
      enableSoundNotifications = settings.enableSoundNotifications;
      enableTabNotifications = settings.enableTabNotifications;
    }
  }

  // Function to notify the current tab with a tab title change
  function notifyCurrentTab() {
    if (!document.hidden) return; // Do not notify if the tab is currently active

    // Check if "(!)" is already present in the tab title
    if (document.title.indexOf('(!) ') !== -1) return;

    document.title = '(!) ' + document.title; // Add (!) to the tab title

    // Listen for tab activation to remove (!)
    const visibilityChangeListener = function () {
      if (!document.hidden) {
        document.removeEventListener('visibilitychange', visibilityChangeListener);
        document.title = document.title.replace('(!) ', ''); // Remove (!) from tab title
      }
    };

    document.addEventListener('visibilitychange', visibilityChangeListener);
  }

  // Function to clear tab notifications from all tabs
  function clearTabNotifications() {
    document.title = document.title.replace('(!) ', ''); // Remove (!) from tab title
  }

  // Load saved settings when the page loads
  loadSettings();

  // Trigger the click function when the page loads and create the menu
  window.addEventListener('load', function () {
    if (window.location.hostname.endsWith('live.projectdiablo2.com') && window.location.pathname === '/market') {
      // Check if the hostname ends with 'live.projectdiablo2.com' and the path is '/market'
      createMenu();
      requestNotificationPermission(); // Request permission on page load
    }
  });
})();
