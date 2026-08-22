import os
import cv2
import numpy as np
import base64
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from ultralytics import YOLO

app = FastAPI()

# Configuration
# Note: Ensure this path is correct for where the script is run
model_path = os.path.join(os.path.dirname(__file__), "my_model", "train", "weights", "best.pt")

if not os.path.exists(model_path):
    print(f"Warning: Model not found at {model_path}. Please update the path.")
    # Initialize a dummy model or handle gracefully in production
    model = None
else:
    model = YOLO(model_path, task='detect')
    labels = model.names

@app.websocket("/ws/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    print("Client connected to Advanced Focus Mode websocket.")
    try:
        while True:
            # Receive base64 image string from extension
            data = await websocket.receive_text()
            
            # The data usually starts with 'data:image/jpeg;base64,'
            if data.startswith("data:image"):
                base64_data = data.split(",")[1]
            else:
                base64_data = data

            # Decode base64 to OpenCV image
            img_data = base64.b64decode(base64_data)
            np_arr = np.frombuffer(img_data, np.uint8)
            frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

            if frame is None:
                continue

            status = "focused"

            if model:
                # Run inference
                results = model(frame, verbose=False)
                detections = results[0].boxes

                best_conf = 0.0
                best_class = None
                
                for i in range(len(detections)):
                    conf = detections[i].conf.item()
                    if conf > best_conf:
                        best_conf = conf
                        classidx = int(detections[i].cls.item())
                        best_class = labels[classidx]

                distraction_detected = (best_class is not None and best_class.lower() == "distracted" and best_conf > 0.5)

                if distraction_detected:
                    status = "distracted"

            print(f"Prediction: {status} (Best Class: {best_class}, Confidence: {best_conf:.2f})")
            # Send back the result
            await websocket.send_text(status)

    except WebSocketDisconnect:
        print("Client disconnected.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    import uvicorn
    # Run the server on port 8000
    print("Starting FastAPI server on ws://localhost:8000")
    uvicorn.run(app, host="0.0.0.0", port=8000)
