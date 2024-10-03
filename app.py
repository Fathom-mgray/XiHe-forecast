from flask import Flask, jsonify, request, send_file, make_response, after_this_request
import os
import fsspec
from dotenv import load_dotenv
from flask_cors import CORS
import logging
import json
from datetime import datetime, timedelta
import xarray as xr
from fsspec.implementations.reference import LazyReferenceMapper, ReferenceFileSystem
import io
import tempfile

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

@app.route('/download-data', methods = ['GET'])
def download_data():
    
    s3_url = "s3://fathom-xihe-app/XiHe_model_outputs/combined.parq"
    fs = ReferenceFileSystem(
        s3_url,
        remote_protocol="s3",
        target_protocol="s3",
        lazy=True,
        key=os.environ['AWS_ACCESS_KEY_ID'], secret=os.environ['AWS_SECRET_ACCESS_KEY']
    )
    ds = xr.open_dataset(
        fs.get_mapper(), engine="zarr", backend_kwargs={"consolidated": False}, decode_times=False
    )
    print(request.args.get('baseDate'))
    left_lon = min(int(request.args.get('west')), int(request.args.get('east')))
    right_lon = max(int(request.args.get('west')), int(request.args.get('east')))
    top_lat = max(int(request.args.get('south')), int(request.args.get('north')))
    bottom_lat = min(int(request.args.get('south')), int(request.args.get('north')))
    ds_var = ds[request.args.get('overlayType')].sel(time = request.args.get('baseDate'), longitude = slice(left_lon, right_lon), latitude = slice(bottom_lat, top_lat), lead_day = int(request.args.get('dateDifference')))
    if 'depth' in ds_var.dims:
        ds_var = ds.isel(depth = int(request.args.get('depth')))
    ds_var = ds_var.drop_vars('time') 
    with tempfile.NamedTemporaryFile(delete=False, suffix='.nc') as tmp_file:
        tmp_filename = tmp_file.name  # Get the name of the temporary file
        # Write the xarray dataset to the temporary file
        ds_var.to_netcdf(tmp_filename, mode='w')  # Specify format if needed
    
    if left_lon < 0:
        left_lon_name = f"{abs(left_lon)}w"
    else:
        left_lon_name = f"{left_lon}e"

    if right_lon < 0:
        right_lon_name = f"{abs(right_lon)}w"
    else:
        right_lon_name = f"{right_lon}e"
    if top_lat < 0:
        top_lat_name = f"{abs(top_lat)}s"
    else:
        top_lat_name = f"{top_lat}n"
    if bottom_lat < 0:
        bottom_lat_name = f"{abs(bottom_lat)}s"
    else:
        bottom_lat_name = f"{bottom_lat}n"
    

    download_name = f"date_init_{request.args.get('baseDate')}_leadday_{request.args.get('dateDifference')}_var_{request.args.get('overlayType')}_depth_{request.args.get('depth')}_east_{right_lon_name}_west_{left_lon_name}_north_{top_lat_name}_south_{bottom_lat_name}.nc"
    # Send the temporary file as a response
    print(download_name)
    response = send_file(tmp_filename, as_attachment=True, download_name=download_name, mimetype='application/x-netcdf')

    # Cleanup: Remove the temporary file after sending the response
    @after_this_request
    def cleanup(response):
        try:
            os.remove(tmp_filename)
        except Exception as e:
            app.logger.error("Error removing temporary file: %s", e)
        return response
    response.headers['file-name'] = download_name
    print(response.headers)
    return response
    # Send the buffer as a file download
    # return send_file(buffer, as_attachment=True, download_name='dataset.nc', mimetype='application/x-netcdf')
    


if __name__ == "__main__":
#    app.run(ssl_context=('./certs/fullchain.pem', './certs/privkey.pem'), debug=True)
    app.run(debug=True)
