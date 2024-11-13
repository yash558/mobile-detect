import pandas as pd
import numpy as np
import os
import tensorflow as tf

class DataGenerator(tf.keras.utils.Sequence):
    def __init__(self, csv_file, img_dir, batch_size=32, dim=(128, 128), n_channels=3, shuffle=True, seed=None, mode="regression"):
        """
        Initialize the data generator.

        Parameters:
        - csv_file: Path to CSV file with labels.
        - img_dir: Directory containing images.
        - batch_size: Batch size.
        - dim: Dimensions of the image.
        - n_channels: Number of channels (3 for RGB).
        - shuffle: Whether to shuffle indexes after each epoch.
        - seed: Random seed for shuffling.
        - mode: "regression" or "classification" to specify the type of task.
        """
        # Load CSV and filter out rows where the image file doesn't exist
        self.csv_file = pd.read_csv(csv_file)
        self.img_dir = img_dir
        self.batch_size = batch_size
        self.dim = dim
        self.n_channels = n_channels
        self.shuffle = shuffle
        self.seed = seed
        self.mode = mode  # Mode: "regression" or "classification"

        # Filter to keep only rows with images that exist
        self.csv_file = self.csv_file[self.csv_file['image'].apply(lambda img: os.path.exists(os.path.join(self.img_dir, img + '.jpg')))]
        self.n = len(self.csv_file)  # Updated count after filtering
        self.indexes = np.arange(self.n)  # Index array for shuffling
        
        # For classification mode, set up class labels and one-hot encoding
        if self.mode == "classification":
            self.class_labels = sorted(self.csv_file['label'].unique())
            self.class_indices = {label: idx for idx, label in enumerate(self.class_labels)}
            self.num_classes = len(self.class_labels)
            self.csv_file['label'] = self.csv_file['label'].map(self.class_indices)  # Map labels to indices

        self.on_epoch_end()  # Shuffle if specified

    def summary(self):
        # Print a summary of the DataGenerator configuration
        print("DataGenerator Summary:")
        print(f"Mode: {self.mode}")
        print(f"Number of samples: {self.n}")
        print(f"Batch size: {self.batch_size}")
        print(f"Image dimensions: {self.dim}")
        print(f"Number of channels: {self.n_channels}")
        print(f"Shuffle: {self.shuffle}")
        print(f"Seed: {self.seed}")
        if self.mode == "classification":
            print(f"Number of classes: {self.num_classes}")

    def __len__(self):
        # Number of batches per epoch
        return int(np.ceil(self.n / self.batch_size))  # Use ceil for partial batches

    def __getitem__(self, index):
        # Generate indexes for the batch
        start_idx = index * self.batch_size
        end_idx = min((index + 1) * self.batch_size, self.n)
        indexes = self.indexes[start_idx:end_idx]
        
        # Get batch data from the DataFrame
        batch = self.csv_file.iloc[indexes]
        X, y = self.__data_generation(batch)
        return X, y

    def __data_generation(self, batch):
        # Determine the actual size of the batch
        current_batch_size = len(batch)
        
        # Initialize batch arrays
        X = np.empty((current_batch_size, *self.dim, self.n_channels), dtype=np.float32)
        
        if self.mode == "regression":
            y = np.empty((current_batch_size, 4), dtype=np.float32)  # 4 regression outputs
        elif self.mode == "classification":
            y = np.zeros((current_batch_size, self.num_classes), dtype=np.float32)  # One-hot encoded labels

        for i, (_, row) in enumerate(batch.iterrows()):
            img_path = os.path.join(self.img_dir, row['image'] + '.jpg')
            
            # Check if image file exists (should always be true due to filtering in __init__)
            if not os.path.exists(img_path):
                print(f"Warning: Image file {img_path} not found.")
                continue

            # Load, resize, and normalize image
            img = tf.keras.utils.load_img(img_path, target_size=self.dim)
            img = tf.keras.utils.img_to_array(img) / 255.0  # Scale pixel values to [0, 1]
            
            # Assign image to batch array
            X[i,] = img
            
            # Assign labels based on mode
            if self.mode == "regression":
                y[i,] = row[['Efficiency and Ease to use', 'Color Contrast', 'Readability', 'Simplicity']].values
            elif self.mode == "classification":
                label_index = row['label']
                y[i, label_index] = 1  # One-hot encode the label

        return X, y

    def on_epoch_end(self):
        # Shuffle indexes at the end of each epoch if shuffle is True
        if self.shuffle:
            rng = np.random.default_rng(self.seed)
            self.indexes = rng.permutation(self.indexes)  # Shuffle indexes with seed
