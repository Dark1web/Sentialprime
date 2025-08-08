from ultralytics import YOLO
import requests
from PIL import Image
import io

class YoloService:
    def __init__(self):
        self.model = YOLO("yolov8n.pt")  # Load an official YOLOv8n model

    def predict_from_url(self, image_url):
        try:
            # Download the image
            response = requests.get(image_url, stream=True)
            response.raise_for_status()
            image = Image.open(io.BytesIO(response.content))

            # Perform prediction
            results = self.model(image)
            
            # Extract bounding boxes, confidences, and class names
            predictions = []
            for result in results:
                for box in result.boxes:
                    predictions.append({
                        "box": box.xyxy[0].tolist(),
                        "confidence": box.conf[0].item(),
                        "class": self.model.names[int(box.cls[0].item())]
                    })
            return predictions
        except Exception as e:
            print(f"Error performing YOLO prediction: {e}")
            return None
