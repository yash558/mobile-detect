import tensorflow as tf
from utils.data_loader import DataGenerator

# Load the model
model = tf.keras.models.load_model('../model/usability_accessibility_regression_model.h5')

# Validation data generator
val_generator = DataGenerator(csv_file='../data/Regression/labels.csv',
                              img_dir='../data/Regression/valid',
                              batch_size=32)

# Evaluate the model
test_loss, test_mae = model.evaluate(val_generator)
print(f"Test MAE: {test_mae:.2f}")
