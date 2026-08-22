import { useEffect, useRef } from "react"

const WEBSOCKET_URL = "ws://localhost:8000/ws/detect"

export default function Offscreen() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const intervalRef = useRef<any>(null)

  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        })
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            if (canvasRef.current && videoRef.current) {
              canvasRef.current.width = videoRef.current.videoWidth
              canvasRef.current.height = videoRef.current.videoHeight
              startStreaming()
            }
          }
        }
      } catch (error) {
        console.error("Error accessing webcam:", error)
        chrome.runtime.sendMessage({ action: "CAMERA_PERMISSION_DENIED" })
      }
    }

    function startStreaming() {
      connectWebSocket()
      
      intervalRef.current = setInterval(() => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && canvasRef.current && videoRef.current) {
          const ctx = canvasRef.current.getContext('2d')
          if (ctx) {
            ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
            const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.5)
            wsRef.current.send(dataUrl)
          }
        }
      }, 1000)
    }

    function connectWebSocket() {
      const ws = new WebSocket(WEBSOCKET_URL)
      wsRef.current = ws
      
      ws.onopen = () => console.log("WebSocket connected for Focus Mode")
      
      ws.onmessage = (event) => {
        if (event.data === "distracted") {
          chrome.runtime.sendMessage({
            action: "ADV_FOCUS_RESULT",
            status: event.data
          })
        }
      }
      
      ws.onclose = () => {
        console.log("WebSocket disconnected. Attempting to reconnect...")
        setTimeout(connectWebSocket, 3000)
      }
      
      ws.onerror = (error) => console.error("WebSocket error:", error)
    }

    initCamera()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (wsRef.current) wsRef.current.close()
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted style={{ display: "none" }} />
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  )
}
