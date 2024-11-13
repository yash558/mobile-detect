import tensorflow as tf
from utils.data_loader import DataGenerator

# Parameters
input_shape = (128, 128, 3)
output_shape = 4  # Number of regression targets

# Model Definition
model = tf.keras.Sequential([
    tf.keras.layers.Conv2D(32, (3, 3), activation='relu', input_shape=input_shape),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
    tf.keras.layers.Conv2D(64, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
    tf.keras.layers.Conv2D(128, (3, 3), activation='relu'),
    tf.keras.layers.MaxPooling2D(pool_size=(2, 2)),
    tf.keras.layers.Flatten(),
    tf.keras.layers.Dense(128, activation='relu'),
    tf.keras.layers.Dropout(0.5),
    tf.keras.layers.Dense(output_shape, activation='linear')  # Linear activation for regression
])

model.compile(optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
              loss='mean_squared_error',
              metrics=['mae'])

# Data generators for training and validation
train_generator = DataGenerator(csv_file='../data/Regression/labels.csv',
                                img_dir='../data/Regression/train',
                                batch_size=32)

val_generator = DataGenerator(csv_file='../data/Regression/labels.csv',
                              img_dir='../data/Regression/valid',
                              batch_size=32)

# Train the model
history = model.fit(
    train_generator,
    validation_data=val_generator,
    epochs=15
)

# Save the model
model.save('../model/usability_accessibility_regression_model.h5')
print("Model saved at ../model/usability_accessibility_regression_model.h5")
