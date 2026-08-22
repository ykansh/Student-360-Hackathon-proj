import { useState } from "react"
import "../style.css"

export default function Permissions() {
  const [status, setStatus] = useState("")
  const [statusColor, setStatusColor] = useState("#9CA3AF")

  const handleRequest = async () => {
    setStatus("Requesting permission...")
    setStatusColor("#9CA3AF")
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      
      setStatus("Permission granted! You can close this tab now and the camera will work.")
      setStatusColor("#4ADE80") // green
      
      setTimeout(() => {
        window.close()
      }, 3000)
    } catch (error) {
      setStatus("Permission denied. Please allow camera access in your browser settings (click the icon in the address bar).")
      setStatusColor("#F87171") // red
      console.error("Camera permission error:", error)
    }
  }

  return (
    <div style={{
      fontFamily: "system-ui, -apple-system, sans-serif",
      backgroundColor: "#0F172A",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      margin: 0,
      textAlign: "center"
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.1)",
        padding: "40px",
        borderRadius: "20px",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        <h1>Camera Permission Required</h1>
        <p>Student 360 needs camera access to enable the Advanced Focus Mode distraction detection.</p>
        <button 
          onClick={handleRequest}
          style={{
            backgroundColor: "#3B82F6",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            fontSize: "16px",
            cursor: "pointer",
            marginTop: "20px"
          }}
        >
          Grant Permission
        </button>
        <p style={{ marginTop: "16px", fontSize: "14px", color: statusColor }}>
          {status}
        </p>
      </div>
    </div>
  )
}
