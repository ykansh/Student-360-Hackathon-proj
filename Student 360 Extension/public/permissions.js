document.getElementById("request-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("status");
  statusEl.innerText = "Requesting permission...";
  
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    // Stop the stream immediately after getting permission
    stream.getTracks().forEach(track => track.stop());
    
    statusEl.innerText = "Permission granted! You can close this tab now and the camera will work.";
    statusEl.style.color = "#4ADE80"; // green
    
    // Attempt to close the tab automatically
    setTimeout(() => {
      window.close();
    }, 3000);
  } catch (error) {
    statusEl.innerText = "Permission denied. Please allow camera access in your browser settings (click the icon in the address bar).";
    statusEl.style.color = "#F87171"; // red
    console.error("Camera permission error:", error);
  }
});
