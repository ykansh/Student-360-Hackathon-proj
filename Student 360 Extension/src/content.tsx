import cssText from "data-text:./style.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { useStorage } from "@plasmohq/storage/hook"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Keep getStyle to prevent Plasmo from crashing, but we'll manually inject styles into the host page
export const getStyle = () => {
  const style = document.createElement("style")
  return style
}

export default function Student360Overlay() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDistracted, setIsDistracted] = useState(false)
  const [reelsCount] = useStorage("reelsCount", 0)
  const [focusMode, setFocusMode] = useStorage("focusMode", false)
  const [advancedFocusMode, setAdvancedFocusMode] = useStorage("advancedFocusMode", false)

  // --- Blocker State ---
  const [currentPath, setCurrentPath] = useState(window.location.pathname)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [typedPhrase, setTypedPhrase] = useState("")

  const getVideoId = (path: string) => {
    const match = path.match(/\/(?:shorts|reels|reel)\/([^/?]+)/);
    return match ? match[1] : null;
  }

  // Monitor SPA navigation
  useEffect(() => {
    const interval = setInterval(() => {
      const newPath = window.location.pathname;
      if (newPath !== currentPath) {
        const oldId = getVideoId(currentPath);
        const newId = getVideoId(newPath);
        
        setCurrentPath(newPath)
        
        if (oldId !== newId) {
          // If transitioning from generic /reels/ feed to a specific video ID, keep it unlocked.
          if (oldId === null && newId !== null) {
            // Keep unlocked status
          } else {
            setIsUnlocked(false)
            setTypedPhrase("")
          }
        }
      }
    }, 300)
    return () => clearInterval(interval)
  }, [currentPath])

  useEffect(() => {
    // Notify background script about the change
    chrome.runtime.sendMessage({
      action: "TOGGLE_ADV_FOCUS",
      enabled: advancedFocusMode
    })
  }, [advancedFocusMode])

  useEffect(() => {
    // Manually inject styles into the host document head so the portal can use them
    const hostStyle = document.createElement("style")
    hostStyle.textContent = cssText
    document.head.appendChild(hostStyle)

    const messageListener = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
      if (message.action === "TOGGLE_UI") {
        setIsVisible(prev => !prev)
        sendResponse({ success: true })
      } else if (message.action === "SHOW_DISTRACTION_ALERT") {
        setIsDistracted(true)
      } else if (message.action === "HIDE_DISTRACTION_ALERT") {
        setIsDistracted(false)
      }
    }
    chrome.runtime.onMessage.addListener(messageListener)
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener)
      hostStyle.remove()
    }
  }, [])

  // --- Beep Logic for Distraction ---
  useEffect(() => {
    let timeouts: number[] = []
    const audios: HTMLAudioElement[] = []

    if (isDistracted) {
      // 8000Hz, 0.15s duration sine wave at 880Hz encoded in base64
      const beepBase64 = "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"
      
      const playSingleBeep = () => {
        const audio = new Audio("data:audio/wav;base64," + beepBase64)
        audio.volume = 0.5
        audio.play().catch(e => console.warn("Could not play beep:", e))
        audios.push(audio)
      }

      // Play 14 beeps (every 500ms) to cover 7 seconds
      for (let i = 0; i < 14; i++) {
        const timeout = window.setTimeout(() => {
          playSingleBeep()
        }, i * 500)
        timeouts.push(timeout)
      }
    }

    return () => {
      // Clear any remaining beeps if the user looks back early
      timeouts.forEach(clearTimeout)
      audios.forEach(audio => {
        audio.pause()
        audio.currentTime = 0
      })
    }
  }, [isDistracted])

  // --- Blocker Logic ---
  const isShortOrReel = currentPath.includes("/shorts/") || currentPath.includes("/reels/") || currentPath.includes("/reel/")
  const shouldBlock = focusMode && isShortOrReel && !isUnlocked

  const TARGET_PHRASE = "i want to unlock, it's urgent"

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTypedPhrase(val)
    if (val.toLowerCase() === TARGET_PHRASE.toLowerCase()) {
      setIsUnlocked(true)
      // Increment counter when they succumb to temptation
      try {
        chrome.runtime.sendMessage({ action: "INCREMENT_REEL_COUNT" })
      } catch (error) {
        console.warn("Could not send message, extension context might be invalidated. Please refresh the page.", error)
      }
    }
  }

  // Pause video behind the overlay when blocked
  useEffect(() => {
    if (shouldBlock) {
      document.body.style.overflow = "hidden"
      const videos = Array.from(document.querySelectorAll("video"))
      videos.forEach(v => {
        if (!v.paused) v.pause()
      })
    } else {
      document.body.style.overflow = ""
    }
  }, [shouldBlock, currentPath])

  // --- Blocker UI ---
  const blockerOverlay = shouldBlock ? (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center"
      style={{
        fontFamily: "'Montserrat', sans-serif",
        backgroundColor: "rgba(0, 0, 0, 0.4)" // Light tint so the card's blur works!
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          width: "100%",
          maxWidth: "512px",
          padding: "32px",
          borderRadius: "28px",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.35)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 2px 8px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div
          className="flex items-center justify-center font-bold"
          style={{ width: "56px", height: "56px", borderRadius: "50%", marginBottom: "20px", fontSize: "24px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "2px solid rgba(239, 68, 68, 0.8)", color: "#EF4444", textShadow: "0 2px 8px rgba(239, 68, 68, 0.4)" }}
        >
          !
        </div>

        <h1
          className="text-white font-bold tracking-tight text-center"
          style={{ fontSize: "24px", marginBottom: "12px", lineHeight: "32px", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          Touch grass. 🌱
        </h1>

        <p
          className="text-center px-2"
          style={{ fontSize: "14px", marginBottom: "24px", lineHeight: "1.6", color: "rgba(245,245,240,0.6)" }}
        >
          Doomscrolling? In this economy? You're caught in the infinite loop. Disconnect from the algorithm and go romanticize your studies. If you literally need this to survive, drop the phrase below.
        </p>

        <div
          className="w-full text-center relative overflow-hidden"
          style={{ padding: "16px", borderRadius: "16px", marginBottom: "20px", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent"></div>
          <span
            className="uppercase tracking-widest font-semibold block"
            style={{ fontSize: "10px", marginBottom: "8px", color: "rgba(96, 165, 250, 0.8)" }}
          >
            Unlock Phrase
          </span>
          <span
            className="font-mono font-bold tracking-wide select-none"
            style={{ fontSize: "14px", color: "#60A5FA" }}
          >
            {TARGET_PHRASE}
          </span>
        </div>

        <input
          type="text"
          placeholder="Type exactly..."
          value={typedPhrase}
          onChange={handleType}
          className="w-full text-white text-center font-mono focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
          style={{ padding: "16px", borderRadius: "16px", fontSize: "14px", backgroundColor: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.15)" }}
          autoFocus
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    </div>
  ) : null;

  // --- Distraction UI ---
  const distractionAlertOverlay = isDistracted ? (
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center"
      style={{
        fontFamily: "'Montserrat', sans-serif",
        backgroundColor: "rgba(0, 0, 0, 0.4)" // Light tint so the card's blur works!
      }}
    >
      <div
        className="flex flex-col items-center"
        style={{
          width: "100%",
          maxWidth: "512px",
          padding: "32px",
          borderRadius: "28px",
          backgroundColor: "rgba(0, 0, 0, 0.35)",
          backdropFilter: "blur(24px) saturate(150%)",
          WebkitBackdropFilter: "blur(24px) saturate(150%)",
          borderTop: "1px solid rgba(255, 255, 255, 0.35)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
          borderRight: "1px solid rgba(255, 255, 255, 0.08)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8), 0 2px 8px rgba(0, 0, 0, 0.2)"
        }}
      >
        <div
          className="flex items-center justify-center font-bold"
          style={{ width: "56px", height: "56px", borderRadius: "50%", marginBottom: "20px", fontSize: "24px", backgroundColor: "rgba(239, 68, 68, 0.15)", border: "2px solid rgba(239, 68, 68, 0.8)", color: "#EF4444", textShadow: "0 2px 8px rgba(239, 68, 68, 0.4)" }}
        >
          ☁️
        </div>

        <h1
          className="text-white font-bold tracking-tight text-center"
          style={{ fontSize: "24px", marginBottom: "12px", lineHeight: "32px", textShadow: "0 1px 12px rgba(0,0,0,0.5)" }}
        >
          Daydreaming?
        </h1>

        <p
          className="text-center px-2"
          style={{ fontSize: "14px", marginBottom: "24px", lineHeight: "1.6", color: "rgba(245,245,240,0.6)" }}
        >
          Get back to reality and focus! Please look back at your screen to dismiss this message.
        </p>

        <button 
          onClick={() => {
            setIsDistracted(false)
            chrome.runtime.sendMessage({ action: "MANUAL_DISMISS_ALERT" }).catch(() => {})
          }}
          style={{
            marginTop: "10px",
            padding: "10px 24px",
            fontSize: "14px",
            fontWeight: "600",
            color: "white",
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.3)"
            e.currentTarget.style.transform = "scale(1.05)"
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.15)"
            e.currentTarget.style.transform = "scale(1)"
          }}
        >
          I'm focusing now
        </button>
      </div>
    </div>
  ) : null;

  // --- Original Widget UI ---
  const overlayContent = isVisible ? (
    <div
      className="fixed top-4 right-4 z-[999999] flex flex-col gap-3"
      style={{
        fontFamily: "'Montserrat', sans-serif",
        width: 288,
        height: "auto",
        borderRadius: 28,
        padding: "22px 20px 18px",
        backgroundColor: "rgba(0, 0, 0, 0.35)",
        backdropFilter: "blur(24px) saturate(150%)",
        WebkitBackdropFilter: "blur(24px) saturate(150%)",
        borderTop: "1px solid rgba(255, 255, 255, 0.35)",
        borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)"
      }}
    >
      <div>
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: "#F5F5F0",
            margin: 0,
            letterSpacing: "-0.3px",
            textShadow: "0 1px 12px rgba(0,0,0,0.5)"
          }}
        >
          Student 360
        </h1>
        <p
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 500,
            fontSize: 11,
            color: "rgba(245,245,240,0.45)",
            margin: "3px 0 16px",
            letterSpacing: "0.2px"
          }}
        >
          AI Study Buddy
        </p>

        <div
          className="glass-card"
          style={{
            borderRadius: 20,
            padding: "18px 16px",
            textAlign: "center",
            transition: "transform 0.25s ease",
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.02)")}
          onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        >
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600,
              fontSize: 9,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(245,245,240,0.45)",
              margin: "0 0 6px"
            }}
          >
            Distractions Today
          </p>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 800,
              fontSize: 52,
              color: "#F5F5F0",
              lineHeight: 1,
              textShadow: "0 2px 20px rgba(0,0,0,0.6)"
            }}
          >
            {reelsCount}
          </div>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 9,
              color: "rgba(245,245,240,0.38)",
              margin: "6px 0 0"
            }}
          >
            Reels / Shorts Watched
          </p>
        </div>
      </div>

      <div
        className="glass-card"
        style={{
          borderRadius: 20,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#F5F5F0",
              margin: 0,
              textShadow: "0 1px 8px rgba(0,0,0,0.4)"
            }}
          >
            Focus Mode
          </h2>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 9,
              color: "rgba(245,245,240,0.4)",
              margin: "3px 0 0"
            }}
          >
            Block scrolling traps
          </p>
        </div>

        <label style={{ cursor: "pointer" }}>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className="sr-only"
              checked={focusMode}
              onChange={(e) => setFocusMode(e.target.checked)}
            />
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                backgroundColor: focusMode ? "#00CFFF" : "rgba(255,255,255,0.12)",
                border: `1px solid ${focusMode ? "rgba(0,207,255,0.5)" : "rgba(255,255,255,0.15)"}`,
                boxShadow: focusMode
                  ? "0 0 16px rgba(0,207,255,0.7), inset 0 0 8px rgba(0,207,255,0.3)"
                  : "none",
                transition: "all 0.3s ease",
                position: "relative"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#F5F5F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                transform: focusMode ? "translateX(20px)" : "translateX(0px)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        </label>
      </div>

      <div
        className="glass-card"
        style={{
          borderRadius: 20,
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              fontSize: 13,
              color: "#F5F5F0",
              margin: 0,
              textShadow: "0 1px 8px rgba(0,0,0,0.4)"
            }}
          >
            Advanced Focus Mode
          </h2>
          <p
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 500,
              fontSize: 9,
              color: "rgba(245,245,240,0.4)",
              margin: "3px 0 0"
            }}
          >
            Camera monitoring
          </p>
        </div>

        <label style={{ cursor: "pointer" }}>
          <div style={{ position: "relative" }}>
            <input
              type="checkbox"
              className="sr-only"
              checked={advancedFocusMode}
              onChange={(e) => setAdvancedFocusMode(e.target.checked)}
            />
            <div
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                backgroundColor: advancedFocusMode ? "#00CFFF" : "rgba(255,255,255,0.12)",
                border: `1px solid ${advancedFocusMode ? "rgba(0,207,255,0.5)" : "rgba(255,255,255,0.15)"}`,
                boxShadow: advancedFocusMode
                  ? "0 0 16px rgba(0,207,255,0.7), inset 0 0 8px rgba(0,207,255,0.3)"
                  : "none",
                transition: "all 0.3s ease",
                position: "relative"
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 4,
                left: 4,
                width: 16,
                height: 16,
                borderRadius: "50%",
                backgroundColor: "#F5F5F0",
                boxShadow: "0 1px 4px rgba(0,0,0,0.5)",
                transform: advancedFocusMode ? "translateX(20px)" : "translateX(0px)",
                transition: "transform 0.3s ease",
              }}
            />
          </div>
        </label>
      </div>
    </div>
  ) : null;

  return createPortal(
    <>
      {blockerOverlay}
      {distractionAlertOverlay}
      {overlayContent}
    </>,
    document.body
  )
}
