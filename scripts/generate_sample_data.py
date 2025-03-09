import numpy as np
from PIL import Image
import os
import logging
import argparse
from pathlib import Path
from tqdm import tqdm

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_directories(base_dir="data/Regression"):
    """Create necessary directories if they don't exist."""
    dirs = ["train", "valid", "test"]
    for dir_name in dirs:
        dir_path = Path(base_dir) / dir_name
        dir_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {dir_path}")
    return base_dir

def generate_sample_image(
    size=(128, 128),
    name="sample_image",
    save_dir="data/Regression/train",
    format="jpg",
    seed=None
):
    """
    Generate a random colored image and save it.
    
    Args:
        size (tuple): Image dimensions (width, height)
        name (str): Base name for the image file
        save_dir (str): Directory to save the image
        format (str): Image format (jpg, png)
        seed (int, optional): Random seed for reproducibility
    
    Returns:
        str: Path to the saved image
    """
    try:
        # Set random seed if provided
        if seed is not None:
            np.random.seed(seed)
        
        # Input validation
        if not isinstance(size, tuple) or len(size) != 2:
            raise ValueError("Size must be a tuple of (width, height)")
        if not all(isinstance(x, int) and x > 0 for x in size):
            raise ValueError("Image dimensions must be positive integers")
        
        # Create a random colored image
        img_array = np.random.randint(0, 255, (size[0], size[1], 3), dtype=np.uint8)
        img = Image.fromarray(img_array)
        
        # Ensure directory exists
        save_dir = Path(save_dir)
        save_dir.mkdir(parents=True, exist_ok=True)
        
        # Save the image
        format = format.lower()
        if format not in ['jpg', 'jpeg', 'png']:
            raise ValueError("Unsupported image format. Use 'jpg' or 'png'")
        
        file_path = save_dir / f"{name}.{format}"
        img.save(file_path, format=format.upper(), quality=95)
        logger.debug(f"Generated image: {file_path}")
        return str(file_path)
        
    except Exception as e:
        logger.error(f"Error generating image {name}: {str(e)}")
        raise

def main(args):
    """Main function to generate sample images."""
    try:
        base_dir = setup_directories()
        
        # Generate training images
        logger.info("Generating training images...")
        for i in tqdm(range(1, args.train_samples + 1), desc="Training"):
            generate_sample_image(
                size=args.size,
                name=f"sample_image_{i:04d}",
                save_dir=f"{base_dir}/train",
                format=args.format,
                seed=args.seed + i if args.seed else None
            )

        # Generate validation images
        logger.info("Generating validation images...")
        for i in tqdm(range(1, args.valid_samples + 1), desc="Validation"):
            generate_sample_image(
                size=args.size,
                name=f"sample_image_{i:04d}",
                save_dir=f"{base_dir}/valid",
                format=args.format,
                seed=args.seed + args.train_samples + i if args.seed else None
            )

        # Generate test images
        logger.info("Generating test images...")
        for i in tqdm(range(1, args.test_samples + 1), desc="Test"):
            generate_sample_image(
                size=args.size,
                name=f"sample_image_{i:04d}",
                save_dir=f"{base_dir}/test",
                format=args.format,
                seed=args.seed + args.train_samples + args.valid_samples + i if args.seed else None
            )

        logger.info("Sample data generation completed successfully!")
        
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        raise

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate sample images for training")
    parser.add_argument("--train-samples", type=int, default=10, help="Number of training samples")
    parser.add_argument("--valid-samples", type=int, default=5, help="Number of validation samples")
    parser.add_argument("--test-samples", type=int, default=5, help="Number of test samples")
    parser.add_argument("--size", type=int, nargs=2, default=[128, 128], help="Image size (width height)")
    parser.add_argument("--format", type=str, default="jpg", choices=["jpg", "png"], help="Image format")
    parser.add_argument("--seed", type=int, help="Random seed for reproducibility")
    
    args = parser.parse_args()
    main(args)