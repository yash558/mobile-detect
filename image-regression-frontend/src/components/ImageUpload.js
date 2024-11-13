import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [predictions, setPredictions] = useState(null);

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setPredictions(null); // Clear previous predictions on new file selection
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Round predictions to 1 decimal place for readability
            const roundedPredictions = response.data.predictions.map(pred => pred.toFixed(1));
            setPredictions(roundedPredictions);
        } catch (error) {
            console.error("Error with the prediction!", error);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gradient-to-b from-blue-100 to-blue-50 min-h-screen">
            <h2 className="text-3xl font-extrabold mb-8 text-blue-700">Upload an Image for Prediction</h2>
            
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6 w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="p-3 border border-blue-300 rounded-lg w-full text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-white file:bg-blue-500 file:hover:bg-blue-600"
                    accept="image/*"
                />
                
                <button
                    type="submit"
                    disabled={!selectedFile}
                    className={`w-full py-3 font-semibold text-white rounded-lg ${selectedFile ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                >
                    Predict
                </button>
            </form>

            {predictions && (
                <div className="mt-8 w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-xl font-bold text-gray-700 mb-4">Predictions:</h3>
                    <ul className="space-y-2 text-gray-700">
                        {predictions.map((pred, index) => (
                            <li key={index} className="text-lg font-medium"> {index == 1 ? "Efficiency and Ease to use" : index == 2 ? "Color Contrast" : index == 3 ? "Readability" : "Simplicity"}: {pred.toFixed(1)}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default ImageUpload;
