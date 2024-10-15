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



from flask_sqlalchemy import SQLAlchemy

from sqlalchemy import text
from geoalchemy2 import Raster

import math

# Load environment variables from .env file
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)
logging.basicConfig(level=logging.DEBUG)


DB_USERNAME = 'postgres'
DB_PASSWORD = 'fathom-science-postgis'
DB_HOST = '98.81.173.175'
DB_PORT = '5432'
DB_NAME = 'ocean_data_db'

app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql://{DB_USERNAME}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

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




class OceanDataSST(db.Model):
    __tablename__ = 'ocean_data_sst'
    id = db.Column(db.Integer, primary_key=True)
    rast = db.Column(Raster)
    base_date = db.Column(db.Date)
    lead_day = db.Column(db.Integer)
    filename = db.Column(db.Text)

from datetime import datetime
from dateutil import parser
import traceback

@app.route('/get_at_point', methods=['GET'])
def get_at_point():
    try:
        # Log incoming request parameters
        logger.info(f"Received request with parameters: {request.args}")

        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        date_str = request.args.get('date')
        lead_day = request.args.get('lead_day', type=int)
        active_overlay = request.args.get('overlay', type=str)
        depth = request.args.get('depth', type=float)


        depth_mapping = {
                0: 0.49399998784065247,
                10: 77.85389709472656,
                22: 643.5667724609375
            }
            
        if depth in depth_mapping:
            mapped_depth = depth_mapping[depth]
            logger.info(f"Mapped depth {depth} to {mapped_depth}")
        else:
            mapped_depth = depth
            logger.info(f"Using original depth value: {depth}")
            
        depth = mapped_depth
        

        # Validate required parameters
        if lat is None or lon is None:
            logger.error("Missing latitude or longitude")
            return jsonify({'error': 'Latitude and longitude must be provided'}), 400

        # Parse the date string if provided
        if date_str:
            try:
                date = parser.parse(date_str).date()
                logger.info(f"Parsed date: {date}")
            except ValueError as e:
                logger.error(f"Error parsing date: {e}")
                return jsonify({'error': f'Invalid date format: {date_str}'}), 400
        else:
            date = None
            logger.info("No date provided, will use most recent data")

        # If date or lead_day are not provided, get the most recent data
        if date is None or lead_day is None:
            try:
                most_recent_query = text("""
                    SELECT base_date, lead_day 
                    FROM ocean_data_sst 
                    ORDER BY base_date DESC, lead_day ASC 
                    LIMIT 1
                """)
                most_recent = db.session.execute(most_recent_query).fetchone()
                if most_recent:
                    date = most_recent.base_date
                    lead_day = most_recent.lead_day
                    logger.info(f"Using most recent data: date={date}, lead_day={lead_day}")
                else:
                    logger.error("No data available in the database")
                    return jsonify({'error': 'No data available in the database'}), 404
            except Exception as e:
                logger.error(f"Error querying for most recent data: {e}")
                return jsonify({'error': 'Error retrieving most recent data'}), 500

        # Log the final parameters being used for the query
        logger.info(f"Querying with parameters: lat={lat}, lon={lon}, date={date}, lead_day={lead_day}, overlay={active_overlay}, depth={depth}")

        # Prepare the query based on the active overlay
        if active_overlay == 'speed':
            if depth is None:
                logger.error("Depth is required for speed overlay")
                return jsonify({'error': 'Depth must be provided for speed overlay'}), 400
            query = text(f"SELECT * FROM get_speed_at_point(:lat, :lon, :date, :lead_day, :depth)")
            query_params = {'lat': lat, 'lon': lon, 'date': date, 'lead_day': lead_day, 'depth': depth}
        else:
            query = text(f"SELECT * FROM get_{active_overlay}_at_point(:lat, :lon, :date, :lead_day)")
            query_params = {'lat': lat, 'lon': lon, 'date': date, 'lead_day': lead_day}

        logger.info(f"Executing query: {query}")
        result = db.session.execute(query, query_params).fetchone()

        if result:
            # Check if the data is NaN and log it
            if result.o_data is None or math.isnan(result.o_data):
                logger.warning(f"NaN value encountered for coordinates: lat={lat}, lon={lon}, date={date}, lead_day={lead_day}")
                return jsonify({'error': 'No valid data found for the given parameters'}), 404
            
            response_data = {
                'latitude': lat,
                'longitude': lon,
                'data': float(result.o_data),
                'matched_latitude': float(result.o_matched_lat),
                'matched_longitude': float(result.o_matched_lon),
                'distance': float(result.o_distance),
                'date': date.isoformat(),
                'lead_day': lead_day,
                'overlay': active_overlay
            }
            if active_overlay == 'speed':
                response_data['depth'] = depth
            logger.info(f"Successful query, returning data: {response_data}")
            return jsonify(response_data)
        else:
            logger.warning("No data found for the given parameters")
            return jsonify({'error': 'No data found for the given parameters'}), 404

    except Exception as e:
        logger.error(f"Unexpected error in get_at_point: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500
    



@app.route('/get_all_lead_days', methods=['GET'])
def get_all_lead_days():
    try:
        # Log incoming request parameters
        logger.info(f"Received request with parameters: {request.args}")

        lat = request.args.get('lat', type=float)
        lon = request.args.get('lon', type=float)
        date_str = request.args.get('base_date')
        active_overlay = request.args.get('overlay', type=str)
        depth = request.args.get('depth', type=float)

        # Validate required parameters
        if lat is None or lon is None:
            logger.error("Missing latitude or longitude")
            return jsonify({'error': 'Latitude and longitude must be provided'}), 400

        # Parse the base date string if provided
        if date_str:
            try:
                # Parse the base_date string
                base_date = parser.parse(date_str).date()
                logger.info(f"Parsed base_date: {base_date}")
            except ValueError as e:
                logger.error(f"Error parsing base_date: {e}")
                return jsonify({'error': f'Invalid date format: {date_str}'}), 400
        else:
            logger.error("Missing base_date")
            return jsonify({'error': 'Base date must be provided'}), 400

        # Handle depth for speed overlay
        if active_overlay == 'speed':
            if depth is None:
                logger.error("Depth is required for speed overlay")
                return jsonify({'error': 'Depth must be provided for speed overlay'}), 400
            # Convert depth 0 to 0.49399998784065247
            depth_mapping = {
                0: 0.49399998784065247,
                10: 77.85389709472656,
                22: 643.5667724609375
            }
            
            if depth in depth_mapping:
                mapped_depth = depth_mapping[depth]
                logger.info(f"Mapped depth {depth} to {mapped_depth}")
            else:
                mapped_depth = depth
                logger.info(f"Using original depth value: {depth}")
            
            depth = mapped_depth
        else:
            depth = None

        # Log the final parameters being used for the query
        logger.info(f"Querying with parameters: lat={lat}, lon={lon}, base_date={base_date}, overlay={active_overlay}, depth={depth}")

        # Prepare the query based on the active overlay
        if active_overlay == 'speed':
            query = text("SELECT * FROM get_speed_all_lead_days(:lat, :lon, :base_date, :depth)")
            query_params = {'lat': lat, 'lon': lon, 'base_date': base_date, 'depth': depth}
        else:
            query = text(f"SELECT * FROM get_{active_overlay}_all_lead_days(:lat, :lon, :base_date)")
            query_params = {'lat': lat, 'lon': lon, 'base_date': base_date}

        # Execute the query
        results = db.session.execute(query, query_params).fetchall()

        # Check if results are found
        if results:
            data_values = []
            for row in results:
                data_values.append({
                    'base_date': row.base_date.isoformat(),
                    'lead_day': row.lead_day,
                    'data_value': float(row.data_value)
                })

            response_data = {
                'latitude': lat,
                'longitude': lon,
                'data_values': data_values
            }
            if active_overlay == 'speed':
                response_data['depth'] = depth
            logger.info(f"Successful query, returning data: {response_data}")
            return jsonify(response_data)
        else:
            logger.warning("No data found for the given parameters")
            return jsonify({'error': 'No data found for the given parameters'}), 404

    except Exception as e:
        logger.error(f"Unexpected error in get_all_lead_days: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': 'An unexpected error occurred', 'details': str(e)}), 500











@app.route('/download_data', methods = ['GET'])
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
