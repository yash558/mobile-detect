import tensorflow as tf
import os
from utils.data_loader import DataGenerator

# Create directories if they don't exist
os.makedirs("model", exist_ok=True)
os.makedirs("data/Regression/train", exist_ok=True)
os.makedirs("data/Regression/valid", exist_ok=True)

# Generate sample data first
from generate_sample_data import generate_sample_image

# Generate training and validation data
for i in range(1, 11):
    generate_sample_image(name=f"{i:04d}_rico", save_dir="data/Regression/train")
for i in range(11, 16):
    generate_sample_image(name=f"{i:04d}_rico", save_dir="data/Regression/valid")

# Build the model
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D((2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(64, activation='relu'),
    tf.keras.layers.Dense(4)  # 4 outputs for regression
])

# Compile the model
model.compile(optimizer='adam',
              loss='mean_squared_error',
              metrics=['mae'])

# Create data generators
train_generator = DataGenerator(
    csv_file='data/Regression/labels.csv',
    img_dir='data/Regression/train',
    batch_size=32,
    dim=(128, 128)
)

val_generator = DataGenerator(
    csv_file='data/Regression/labels.csv',
    img_dir='data/Regression/valid',
    batch_size=32,
    dim=(128, 128)
)

# Train the model
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=10
)

# Save the model
model.save('model/usability_accessibility_regression_model.h5')
print("Model saved successfully!") 