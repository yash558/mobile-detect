import matplotlib.pyplot as plt

def plot_training_history(history):
    plt.figure(figsize=(14, 5))
    
    # Check if accuracy is available in history for classification tasks
    if 'accuracy' in history.history:
        # Plot Accuracy for Classification
        plt.subplot(1, 2, 1)
        plt.plot(history.history['accuracy'], label='Training Accuracy')
        plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
        plt.title('Model Accuracy')
        plt.xlabel('Epoch')
        plt.ylabel('Accuracy')
        plt.legend()
    elif 'mae' in history.history:
        # Plot Mean Absolute Error (MAE) for Regression
        plt.subplot(1, 2, 1)
        plt.plot(history.history['mae'], label='Training MAE')
        plt.plot(history.history['val_mae'], label='Validation MAE')
        plt.title('Model MAE')
        plt.xlabel('Epoch')
        plt.ylabel('MAE')
        plt.legend()
    
    # Plot Loss (should be available for both regression and classification)
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()
    
    plt.show()
