const WEBSOCKET_URL = "ws://localhost:8000/ws/detect";
let ws = null;
let intervalId = null;
let videoElement = null;
let canvasElement = null;
let canvasCtx = null;

async function initCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 } // Keep resolution low to save bandwidth and compute
    });
    
    videoElement = document.getElementById('webcam');
    canvasElement = document.getElementById('canvas');
    
    videoElement.srcObject = stream;
    
    videoElement.onloadedmetadata = () => {
      canvasElement.width = videoElement.videoWidth;
      canvasElement.height = videoElement.videoHeight;
      canvasCtx = canvasElement.getContext('2d');
      startStreaming();
    };
  } catch (error) {
    console.error("Error accessing webcam:", error);
    // Send a message to background script to request permissions via a new tab
    chrome.runtime.sendMessage({
      action: "CAMERA_PERMISSION_DENIED"
    });
  }
}

function startStreaming() {
  connectWebSocket();
  
  // Capture a frame every 1 second
  intervalId = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN && canvasCtx) {
      canvasCtx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);
      const dataUrl = canvasElement.toDataURL('image/jpeg', 0.5); // Use JPEG with 50% quality
      ws.send(dataUrl);
    }
  }, 1000);
}

function connectWebSocket() {
  ws = new WebSocket(WEBSOCKET_URL);
  
  ws.onopen = () => {
    console.log("WebSocket connected for Focus Mode");
  };
  
  ws.onmessage = (event) => {
    const status = event.data;
    if (status === "distracted") {
      // Notify background script
      chrome.runtime.sendMessage({
        action: "ADV_FOCUS_RESULT",
        status: status
      });
    }
  };
  
  ws.onclose = () => {
    console.log("WebSocket disconnected. Attempting to reconnect...");
    setTimeout(connectWebSocket, 3000);
  };
  
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (intervalId) clearInterval(intervalId);
  if (ws) ws.close();
  if (videoElement && videoElement.srcObject) {
    videoElement.srcObject.getTracks().forEach(track => track.stop());
  }
});

// Initialize
initCamera();
