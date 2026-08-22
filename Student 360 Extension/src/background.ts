import { Storage } from "@plasmohq/storage"

const storage = new Storage()

// Initialize storage on installation
chrome.runtime.onInstalled.addListener(async () => {
  const currentCount = await storage.get("reelsCount")
  if (currentCount === undefined) {
    await storage.set("reelsCount", 0)
  }

  const focusMode = await storage.get("focusMode")
  if (focusMode === undefined) {
    await storage.set("focusMode", false)
  }
})

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "INCREMENT_REEL_COUNT") {
    handleIncrement()
      .then(newCount => sendResponse({ success: true, newCount }))
      .catch(error => sendResponse({ success: false, error: error.message }))
    return true // Indicates we will send response asynchronously
  }
})

// Toggle UI when action icon is clicked
chrome.action.onClicked.addListener((tab) => {
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_UI" }).catch(err => {
      console.log("Failed to toggle UI:", err)
    })
  }
})

async function handleIncrement() {
  const currentCount = (await storage.get<number>("reelsCount")) || 0
  const newCount = currentCount + 1
  await storage.set("reelsCount", newCount)

  // Example of calling the sync function
  syncDataToBackend({
    timestamp: Date.now(),
    reelsCount: newCount
  }).catch(err => console.error("Sync failed:", err))

  return newCount
}

interface SyncPayload {
  timestamp: number
  reelsCount: number
}

// Placeholder for syncing data to backend API
async function syncDataToBackend(payload: SyncPayload) {
  console.log("Simulating sync to backend API with payload:", payload)
}

// =========================================================================
// 24/7 BACKGROUND ACTIVITY TRACKING
// =========================================================================

// In-memory state for tracking
let activeTabId: number | null = null;
let activeUrl: string | null = null;
let activeTitle: string | null = null;
let activeStartTime: number | null = null;

// Helper to format date as YYYY-MM-DD
function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Flush time to storage
async function flushActiveTime() {
  if (!activeUrl || !activeStartTime) return;

  const timeSpentSeconds = Math.floor((Date.now() - activeStartTime) / 1000);
  if (timeSpentSeconds < 1) return; // Ignore very brief flashes

  const dateStr = getTodayDateString();
  const storageKey = `analytics_${dateStr}`;

  // Fetch current data for today
  const dailyData = (await storage.get<Record<string, any>>(storageKey)) || {};

  // Initialize URL entry if it doesn't exist
  if (!dailyData[activeUrl]) {
    dailyData[activeUrl] = {
      date: dateStr,
      url: activeUrl,
      title: activeTitle || new URL(activeUrl).hostname || "Unknown",
      timeSpentSeconds: 0,
      category: "pending_analysis"
    };
  }

  // Add the new time spent
  dailyData[activeUrl].timeSpentSeconds += timeSpentSeconds;

  // Save back to storage
  await storage.set(storageKey, dailyData);
  console.log(`Logged ${timeSpentSeconds}s for ${activeUrl}. Total today: ${dailyData[activeUrl].timeSpentSeconds}s`);

  // Reset timer
  activeStartTime = Date.now();
}

// Start tracking a new tab
async function startTrackingTab(tabId: number) {
  try {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url || tab.url.startsWith("chrome://")) {
      // Don't track internal chrome pages
      activeTabId = null;
      activeUrl = null;
      activeTitle = null;
      activeStartTime = null;
      return;
    }

    activeTabId = tabId;
    activeUrl = tab.url;
    activeTitle = tab.title || null;
    activeStartTime = Date.now();
  } catch (err) {
    console.error("Error starting tracking for tab", tabId, err);
  }
}

// 1. Tab Switched
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  await flushActiveTime();
  startTrackingTab(activeInfo.tabId);
});

// 2. URL Updated in current tab
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    await flushActiveTime();
    startTrackingTab(tabId);
  }
});

// 3. Window Focus Changed (User minimized Chrome, or switched apps)
chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Chrome lost focus
    await flushActiveTime();
    activeStartTime = null; // Pause timer
  } else {
    // Chrome gained focus
    if (activeUrl) {
      activeStartTime = Date.now(); // Resume timer
    } else {
      // Find the active tab in the new focused window
      chrome.tabs.query({ active: true, windowId }, (tabs) => {
        if (tabs.length > 0 && tabs[0].id) {
          startTrackingTab(tabs[0].id);
        }
      });
    }
  }
});

// =========================================================================
// ADVANCED FOCUS MODE (OFFSCREEN DOCUMENT)
// =========================================================================

const OFFSCREEN_DOCUMENT_PATH = "tabs/offscreen.html";
let creatingPromise: Promise<void> | null = null;

async function setupOffscreenDocument(path: string) {
  // Check all windows controlled by the service worker to see if one 
  // of them is the offscreen document with the given path
  const offscreenUrl = chrome.runtime.getURL(path);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    return;
  }

  // create offscreen document
  if (creatingPromise) {
    await creatingPromise;
    return;
  }

  creatingPromise = chrome.offscreen.createDocument({
    url: path,
    reasons: [chrome.offscreen.Reason.USER_MEDIA],
    justification: "Recording webcam for Advanced Focus Mode distraction detection"
  });

  await creatingPromise;
  creatingPromise = null;
}

async function closeOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL(OFFSCREEN_DOCUMENT_PATH);
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [chrome.runtime.ContextType.OFFSCREEN_DOCUMENT],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length > 0) {
    await chrome.offscreen.closeDocument();
  }
}

let lastNotificationTime = 0;
let distractionStartTime: number | null = null;
let hideTimeoutId: number | null = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "TOGGLE_ADV_FOCUS") {
    if (message.enabled) {
      setupOffscreenDocument(OFFSCREEN_DOCUMENT_PATH).catch(console.error);
    } else {
      closeOffscreenDocument().catch(console.error);
    }
  } else if (message.action === "ADV_FOCUS_RESULT") {
    if (message.status === "distracted") {
      const now = Date.now();
      
      // Start tracking distraction duration if not already tracking
      if (distractionStartTime === null) {
        distractionStartTime = now;
      }
      
      // Check if distracted continuously for at least 5 seconds
      if (now - distractionStartTime >= 5000) {
        // Clear any pending hide timeouts
        if (hideTimeoutId !== null) {
          clearTimeout(hideTimeoutId);
          hideTimeoutId = null;
        }

        // Throttle notifications to once every 10 seconds
        if (now - lastNotificationTime > 10000) {
          chrome.notifications.create({
            type: "basic",
            iconUrl: chrome.runtime.getURL("assets/icon.png"), // Use getURL for reliable path resolution
            title: "Focus Alert!",
            message: "You seem distracted. Please focus on your studies!"
          }, (notificationId) => {
            if (chrome.runtime.lastError) {
              console.error("Failed to show notification:", chrome.runtime.lastError);
            } else {
              console.log("Notification shown successfully", notificationId);
            }
          });
          
          // Show the in-page overlay
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "SHOW_DISTRACTION_ALERT" }).catch(() => {});
            }
          });
          
          lastNotificationTime = now;
        }
      }
    } else {
      // User is focused, reset the distraction timer
      if (distractionStartTime !== null) {
        // Send HIDE_DISTRACTION_ALERT after 2 seconds
        hideTimeoutId = window.setTimeout(() => {
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0 && tabs[0].id) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "HIDE_DISTRACTION_ALERT" }).catch(() => {});
            }
          });
          hideTimeoutId = null;
        }, 2000);
      }
      distractionStartTime = null;
    }
  } else if (message.action === "CAMERA_PERMISSION_DENIED") {
    // Open a new tab to request camera permission
    chrome.tabs.create({ url: chrome.runtime.getURL("tabs/permissions.html") });
  }
});
