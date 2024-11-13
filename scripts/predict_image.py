import tensorflow as tf
import numpy as np


def classify_image(model_path, img_path):
    model = tf.keras.models.load_model(model_path)
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=(128, 128))
    img_array = tf.keras.preprocessing.image.img_to_array(img) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    predictions = model.predict(img_array)
    class_idx = np.argmax(predictions)
    label_map = {v: k for k, v in tf.keras.preprocessing.image.train_generator.class_indices.items()}
    return label_map[class_idx], predictions[0][class_idx]

# Example usage
label, confidence = classify_image('../model/usability_accessibility_model.h5', 'path/to/test_image.png')
print(f"Predicted Class: {label} with confidence {confidence:.2f}")
