import { useEffect } from "react"
import { useStorage } from "@plasmohq/storage/hook"
import "./src/style.css"

function IndexPopup() {
  const [advancedFocusMode, setAdvancedFocusMode] = useStorage(
    "advancedFocusMode",
    false
  )

  useEffect(() => {
    // Notify background script about the change
    chrome.runtime.sendMessage({
      action: "TOGGLE_ADV_FOCUS",
      enabled: advancedFocusMode
    })
  }, [advancedFocusMode])

  return (
    <div className="flex flex-col items-center justify-center w-64 p-4 bg-slate-900 text-white">
      <h1 className="text-xl font-bold mb-4">Student 360</h1>
      
      <div className="flex items-center justify-between w-full p-2 bg-slate-800 rounded-lg">
        <span className="text-sm font-medium">Advanced Focus Mode</span>
        
        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            className="sr-only peer" 
            checked={advancedFocusMode}
            onChange={(e) => setAdvancedFocusMode(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
        </label>
      </div>

      <p className="text-xs text-slate-400 mt-4 text-center">
        {advancedFocusMode 
          ? "Camera is active. Monitoring focus..." 
          : "Focus mode is inactive."}
      </p>
    </div>
  )
}

export default IndexPopup
