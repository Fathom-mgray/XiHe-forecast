from flask import Flask, jsonify, request
import os
import fsspec
from dotenv import load_dotenv
from flask_cors import CORS
import logging
import json
from datetime import datetime, timedelta

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

CORS(app)
logging.basicConfig(level=logging.DEBUG)

# S3 configuration using fsspec
s3_fs = fsspec.filesystem(
    's3',
    key=os.getenv('AWS_ACCESS_KEY_ID'),
    secret=os.getenv('AWS_SECRET_ACCESS_KEY')
)

bucket_name = 'fathom-xihe-app'
folder_path = 'XiHe_model_outputs/temp_outputs/'

# Function to generate a URL for the image
def get_image_url(file_key):
    return f'https://{bucket_name}.s3.amazonaws.com/{file_key}'

@app.route('/get-images', methods=['GET'])
def get_images():
    try:
        # List all files in the temp_outputs folder
        files = s3_fs.ls(f'{bucket_name}/{folder_path}')
        
        # Filter for image files (you can add more extensions if needed)
        image_files = [f for f in files if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))]
        
        # Generate URLs for all image files
        image_urls = [get_image_url(file.split(f'{bucket_name}/', 1)[1]) for file in image_files]
        
        return jsonify({"status": "success", "images": image_urls})
    except Exception as e:
        logging.error(f"Error retrieving images: {str(e)}")
        return jsonify({"status": "error", "message": "Failed to retrieve images"}), 500

@app.route('/get-json-data', methods=['GET'])
def get_json_data():
    try:
        # Get query parameters
        file_param = request.args.get('file')
        
        if not file_param:
            return jsonify({"status": "error", "message": "File parameter is missing"}), 400

        # Construct the full file path
        file_path = f'{bucket_name}/{file_param}'

        # Check if the file exists
        if not s3_fs.exists(file_path):
            return jsonify({"status": "error", "message": f"JSON file not found: {file_param}"}), 404

        # Read the JSON file
        with s3_fs.open(file_path, 'r') as file:
            json_data = json.load(file)

        return jsonify({"status": "success", "data": json_data})
    except Exception as e:
        logging.error(f"Error retrieving JSON data: {str(e)}")
        return jsonify({"status": "error", "message": f"Failed to retrieve JSON data: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)