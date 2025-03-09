from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import os
from io import BytesIO
from datetime import datetime
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model
model = tf.keras.models.load_model(os.path.join(os.getcwd(), "model/usability_accessibility_regression_model.h5"))

# Define the image size as required by the model
IMG_SIZE = (128, 128)

# Store predictions in a JSON file
PREDICTIONS_FILE = 'predictions_history.json'

def load_predictions_history():
    if os.path.exists(PREDICTIONS_FILE):
        with open(PREDICTIONS_FILE, 'r') as f:
            return json.load(f)
    return []

def save_prediction(filename, predictions):
    history = load_predictions_history()
    history.append({
        'filename': filename,
        'predictions': predictions,
        'timestamp': datetime.now().isoformat()
    })
    # Keep only last 50 predictions
    history = history[-50:]
    with open(PREDICTIONS_FILE, 'w') as f:
        json.dump(history, f)

@app.route('/predictions/history', methods=['GET'])
def get_prediction_history():
    try:
        history = load_predictions_history()
        return jsonify({'history': history})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Route to handle image prediction
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file:
        try:
            # Load the image and preprocess
            img = tf.keras.preprocessing.image.load_img(BytesIO(file.read()), target_size=IMG_SIZE)
            img_array = tf.keras.preprocessing.image.img_to_array(img)
            img_array = np.expand_dims(img_array, axis=0) / 255.0
            
            # Predict using the model
            predictions = model.predict(img_array)
            response = predictions[0].tolist()
            
            # Save prediction to history
            save_prediction(file.filename, response)
            
            return jsonify({
                'predictions': response,
                'filename': file.filename,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file'}), 400

if __name__ == "__main__":
    app.run(debug=True)
