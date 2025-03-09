import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ImageUpload() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('upload');
    const [showTooltip, setShowTooltip] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Calculate average scores from history
    const calculateAverages = () => {
        if (history.length === 0) return Array(4).fill(0);
        const sums = history.reduce((acc, item) => {
            item.predictions.forEach((pred, idx) => {
                acc[idx] = (acc[idx] || 0) + pred;
            });
            return acc;
        }, []);
        return sums.map(sum => (sum / history.length).toFixed(2));
    };

    // Get min and max scores from history
    const getMinMaxScores = () => {
        if (history.length === 0) return { min: Array(4).fill(0), max: Array(4).fill(0) };
        const scores = {
            min: Array(4).fill(Number.MAX_VALUE),
            max: Array(4).fill(Number.MIN_VALUE)
        };
        history.forEach(item => {
            item.predictions.forEach((pred, idx) => {
                scores.min[idx] = Math.min(scores.min[idx], pred);
                scores.max[idx] = Math.max(scores.max[idx], pred);
            });
        });
        return {
            min: scores.min.map(score => score.toFixed(2)),
            max: scores.max.map(score => score.toFixed(2))
        };
    };

    // Fetch prediction history
    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:5000/predictions/history');
            setHistory(response.data.history);
        } catch (error) {
            console.error("Error fetching history:", error);
        }
    };

    // Load history when component mounts
    useEffect(() => {
        fetchHistory();
    }, []);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        handleFile(file);
    };

    const handleFile = (file) => {
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file (PNG, JPG)');
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            setError('File size should be less than 10MB');
            return;
        }

        setSelectedFile(file);
        setPredictions(null);
        setError(null);
        
        // Create preview URL for the image
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!selectedFile) return;

        setIsLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', selectedFile);

        try {
            const response = await axios.post('http://127.0.0.1:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setPredictions(response.data.predictions);
            // Refresh history after new prediction
            fetchHistory();
        } catch (error) {
            console.error("Error with the prediction!", error);
            setError("Failed to get predictions. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    // Cleanup preview URL when component unmounts or when new file is selected
    React.useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString();
    };

    const metricDescriptions = {
        simplicity: "Measures how clean and uncluttered the interface is. Higher scores indicate better visual organization.",
        efficiency: "Evaluates how easy it is to accomplish tasks. Higher scores suggest better user workflow.",
        contrast: "Assesses color contrast ratios for better readability. Higher scores indicate better accessibility.",
        readability: "Measures how easy it is to read text elements. Higher scores mean better text clarity."
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50">
            {/* Header Section */}
            <header className="bg-white shadow-lg py-6 px-8 mb-8">
                <div className="max-w-7xl mx-auto">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Mobile Detection Tool</h1>
                    <p className="text-gray-600">Powered by Machine Learning - Detecting mobile devices from images</p>
                </div>
            </header>

            {/* Main Navigation */}
            <div className="max-w-7xl mx-auto px-4 mb-8">
                <nav className="flex justify-center space-x-4">
                    {['upload', 'analytics', 'history'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                {activeTab === 'upload' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload Interface Image</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div
                                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
                                        isDragging 
                                            ? 'border-blue-500 bg-blue-50' 
                                            : 'border-blue-200 hover:border-blue-300'
                                    }`}
                                    onDragEnter={handleDragEnter}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-upload"
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center space-y-2"
                                    >
                                        <svg className={`w-12 h-12 transition-colors duration-200 ${
                                            isDragging ? 'text-blue-600' : 'text-blue-500'
                                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                                        </svg>
                                        <span className={`transition-colors duration-200 ${
                                            isDragging ? 'text-blue-600' : 'text-gray-600'
                                        }`}>
                                            {isDragging ? 'Drop your image here' : 'Click to upload or drag and drop'}
                                        </span>
                                        <span className="text-sm text-gray-400">PNG, JPG up to 10MB</span>
                                    </label>
                                </div>

                                {previewUrl && (
                                    <div className="relative rounded-lg overflow-hidden shadow-lg">
                                        <img
                                            src={previewUrl}
                                            alt="Preview"
                                            className="w-full h-auto object-contain"
                                            style={{ maxHeight: '300px' }}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={!selectedFile || isLoading}
                                    className={`w-full py-3 rounded-lg font-semibold text-white transition-all ${
                                        !selectedFile || isLoading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : 'Analyze Interface'}
                                </button>
                            </form>
                        </div>

                        {/* Results Section */}
                        <div className="space-y-6">
                            {error && (
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {predictions && (
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Analysis Results</h3>
                                    <div className="space-y-4">
                                        {['Simplicity', 'Efficiency and Ease to use', 'Color Contrast', 'Readability'].map((metric, index) => (
                                            <div
                                                key={index}
                                                className="relative"
                                                onMouseEnter={() => setShowTooltip(index)}
                                                onMouseLeave={() => setShowTooltip(null)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-gray-700 font-medium">{metric}</span>
                                                    <span className="text-blue-600 font-bold">{(predictions[index] * 10).toFixed(1)}/10</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                    <div
                                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                        style={{ width: `${predictions[index] * 100}%` }}
                                                    ></div>
                                                </div>
                                                {showTooltip === index && (
                                                    <div className="absolute z-10 w-64 p-2 mt-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg">
                                                        {metricDescriptions[metric.toLowerCase().split(' ')[0]]}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analytics Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Average Scores */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Average Scores</h3>
                                <div className="space-y-3">
                                    {calculateAverages().map((avg, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-gray-600">
                                                {index === 0 ? "Simplicity" :
                                                 index === 1 ? "Efficiency" :
                                                 index === 2 ? "Contrast" : "Readability"}
                                            </span>
                                            <span className="font-medium text-blue-600">{avg}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Min/Max Scores */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Score Ranges</h3>
                                <div className="space-y-3">
                                    {['Simplicity', 'Efficiency', 'Contrast', 'Readability'].map((metric, index) => (
                                        <div key={index} className="flex justify-between items-center">
                                            <span className="text-gray-600">{metric}</span>
                                            <span className="font-medium text-blue-600">
                                                {getMinMaxScores().min[index]} - {getMinMaxScores().max[index]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Analysis History</h2>
                        <div className="space-y-6">
                            {history.slice().reverse().map((item, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h4 className="font-medium text-gray-800">{item.filename}</h4>
                                            <p className="text-sm text-gray-500">{formatDate(item.timestamp)}</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {item.predictions.map((pred, predIndex) => (
                                            <div key={predIndex} className="bg-gray-50 rounded p-2">
                                                <span className="text-sm text-gray-600">
                                                    {predIndex === 0 ? "Simplicity" :
                                                     predIndex === 1 ? "Efficiency" :
                                                     predIndex === 2 ? "Contrast" : "Readability"}
                                                </span>
                                                <div className="font-medium text-blue-600">{(pred * 10).toFixed(1)}/10</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ImageUpload;
