from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import os
import json
import threading
import cv2
import time
import sys

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Simple JSON-based storage
DB_FILE = "video_text_data.json"
VIDEO_DIR = "videos"  # Directory to store videos
SCREENSHOT_DIR = "screenshots"  # Directory to store screenshots

# Create required directories if they don't exist
for directory in [VIDEO_DIR, SCREENSHOT_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# Initialize the database file if it doesn't exist
if not os.path.exists(DB_FILE):
    # Sample data for development
    sample_data = [
        {
            "text": "MSI-123",
            "timestamp": 10.5,
            "camera_id": "CAM_01",
            "source_video": "OCR-Video.mp4"
        },
        {
            "text": "SAMPLE-456",
            "timestamp": 25.2,
            "camera_id": "CAM_01",
            "source_video": "OCR-Video.mp4"
        }
    ]
    
    with open(DB_FILE, 'w') as f:
        json.dump(sample_data, f, indent=2)

# Videos to process automatically at startup
VIDEOS_TO_PROCESS = [
    {"id": "CAM_01", "path": "OCR-Video.mp4"},
    # Add more videos here as needed
]

def save_text_data(texts, metadata):
    """Save detected text data to JSON file"""
    try:
        # Load existing data
        with open(DB_FILE, 'r') as f:
            data = json.load(f)
        
        # Add new entries
        for text in texts:
            entry = {
                'text': text,
                'timestamp': metadata['timestamp'],
                'camera_id': metadata['camera_id'],
                'source_video': metadata['source_video']
            }
            data.append(entry)
        
        # Save updated data
        with open(DB_FILE, 'w') as f:
            json.dump(data, f, indent=2)
            
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

def search_text_data(query):
    """Search for text in the JSON database"""
    try:
        with open(DB_FILE, 'r') as f:
            data = json.load(f)
        
        # Simple case-insensitive search
        query = query.lower()
        results = [
            item for item in data 
            if query in item['text'].lower()
        ]
        
        return results
    except Exception as e:
        print(f"Error searching data: {e}")
        return []

def capture_screenshot(frame, text, timestamp, camera_id):
    """Capture and save a screenshot of the detected text"""
    try:
        # Create a clean filename based on text and timestamp
        safe_text = "".join(c for c in text if c.isalnum())[:20]
        timestamp_str = f"{timestamp:.1f}s".replace('.', '_')
        filename = f"{safe_text}_{camera_id}_{timestamp_str}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        
        # Save the frame as an image
        cv2.imwrite(filepath, frame)
        print(f"  → Screenshot saved: {filename}")
        return filename
    except Exception as e:
        print(f"Error saving screenshot: {e}")
        return None

def process_video_task(video_file, camera_id="CAM_01", interval_seconds=1, process_all=True):
    """Background task to process a video file"""
    try:
        video_path = os.path.join(VIDEO_DIR, video_file)
        if not os.path.exists(video_path):
            print(f"Error: Could not find video file '{video_path}'")
            # For demo purposes, use mock data if the file doesn't exist
            if not process_all:
                return
            
            print(f"Using mock data for '{video_file}'")
            # Sample detected texts at different timestamps
            sample_detections = [
                {"frame": 150, "text": ["MSI-123", "SHIPMENT RECEIVED"]},
                {"frame": 300, "text": ["PACKAGE-456", "DELIVERED"]},
                {"frame": 450, "text": ["MSI-789", "IN TRANSIT"]},
                {"frame": 600, "text": ["SAMPLE-456", "ON HOLD"]}
            ]
            
            for detection in sample_detections:
                frame_count = detection["frame"]
                current_timestamp_seconds = frame_count / 30  # Assume 30fps
                detected_text_list = detection["text"]
                
                print(f"Mock data - Timestamp: {current_timestamp_seconds:.2f}s - Detected: {detected_text_list}")
                
                for text in detected_text_list:
                    # Create a fake screenshot filename
                    safe_text = "".join(c for c in text if c.isalnum())[:20]
                    timestamp_str = f"{current_timestamp_seconds:.1f}s".replace('.', '_')
                    screenshot_filename = f"{safe_text}_{camera_id}_{timestamp_str}.png"
                    
                    metadata = {
                        'timestamp': current_timestamp_seconds,
                        'camera_id': camera_id,
                        'source_video': video_file,
                        'screenshot_filename': screenshot_filename
                    }
                    
                    # Save a single text entry
                    save_text_data([text], metadata)
            
            return
        
        print(f"Processing video: {video_file} (Camera ID: {camera_id})")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file '{video_path}'")
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        frames_to_skip = int(fps * interval_seconds)
        
        print(f"Video FPS: {fps}, Total frames: {total_frames}")
        print(f"Processing one frame every {interval_seconds} second(s)")
        
        frame_count = 0
        processed_frames = 0
        
        while frame_count < total_frames:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
            success, frame = cap.read()
            if not success:
                break # End of video
                
            processed_frames += 1
            if processed_frames % 10 == 0:
                print(f"Processed {processed_frames} frames... ({frame_count}/{total_frames})")

            current_timestamp_seconds = frame_count / fps
            
            # In a real implementation with EasyOCR:
            # detected_text_list = reader.readtext(frame, detail=0, paragraph=True)
            
            # For demo purposes, let's simulate text detection at certain timestamps
            detected_text_list = []
            
            # Simulate finding text at specific frame ranges
            if 150 <= frame_count <= 155:
                detected_text_list = ["MSI-123", "SHIPMENT RECEIVED"]
            elif 300 <= frame_count <= 305:
                detected_text_list = ["PACKAGE-456", "DELIVERED"]
            elif 450 <= frame_count <= 455:
                detected_text_list = ["MSI-789", "IN TRANSIT"]
            elif 600 <= frame_count <= 605:
                detected_text_list = ["SAMPLE-456", "ON HOLD"]
            
            if detected_text_list:
                print(f"Timestamp: {current_timestamp_seconds:.2f}s - Detected: {detected_text_list}")
                
                for text in detected_text_list:
                    # Save a screenshot of this frame
                    screenshot_filename = capture_screenshot(
                        frame, text, current_timestamp_seconds, camera_id
                    )
                    
                    metadata = {
                        'timestamp': current_timestamp_seconds,
                        'camera_id': camera_id,
                        'source_video': video_file,
                        'screenshot_filename': screenshot_filename
                    }
                    
                    # Save a single text entry
                    save_text_data([text], metadata)

            frame_count += frames_to_skip

        print(f"Completed processing {video_file}")

    except Exception as e:
        print(f"Error processing video: {e}")
    finally:
        if 'cap' in locals() and cap.isOpened():
            cap.release()

def process_all_videos():
    """Process all videos in the configured list"""
    print("\n--- Starting automatic video processing ---")
    for video_info in VIDEOS_TO_PROCESS:
        camera_id = video_info["id"]
        video_path = video_info["path"]
        
        # Process each video in a separate thread
        thread = threading.Thread(
            target=process_video_task,
            args=(video_path, camera_id, 1, True)
        )
        thread.daemon = True
        thread.start()
    
    print("Video processing started in background threads")

# Start processing videos when the server starts
process_all_videos()
    
# Routes
@app.route('/api/screenshot/<filename>', methods=['GET'])
def get_screenshot(filename):
    """Endpoint to serve screenshot images"""
    
    # Set the directory where screenshots are stored
    screenshot_dir = "screenshots"
    
    # For security, validate the filename does not contain path traversal
    if '..' in filename or '/' in filename:
        return jsonify({"error": "Invalid filename"}), 400
    
    file_path = os.path.join(screenshot_dir, filename)
    
    if os.path.exists(file_path):
        return send_file(file_path, mimetype='image/png')
    else:
        # If the exact file is not found, look for similar filenames for demo purposes
        # In production, you would just return a 404
        for file in os.listdir(screenshot_dir) if os.path.exists(screenshot_dir) else []:
            # Return the first image file as a fallback
            if file.endswith(('.png', '.jpg', '.jpeg')):
                return send_file(os.path.join(screenshot_dir, file), mimetype='image/png')
        
        # If the directory doesn't exist or no image files are found
        return jsonify({"error": "Screenshot not found"}), 404

@app.route('/api/search', methods=['GET'])
def search_text():
    """Endpoint for searching text in videos"""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        results = search_text_data(query)
        
        # Add screenshot filenames to each result
        for result in results:
            # Generate a placeholder screenshot filename based on the text and timestamp
            safe_text = ''.join(c for c in result['text'] if c.isalnum())[:20]
            timestamp_str = f"{result['timestamp']:.1f}s".replace('.', '_')
            result['screenshot_filename'] = f"{safe_text}_{result['camera_id']}_{timestamp_str}.png"
        
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/videos', methods=['GET'])
def list_videos():
    """Endpoint to list available videos"""
    # Return the configured list of videos
    videos = [
        {"id": video_info["id"], "name": os.path.basename(video_info["path"]), "camera_id": video_info["id"]}
        for video_info in VIDEOS_TO_PROCESS
    ]
    return jsonify({"videos": videos})

@app.route('/api/process', methods=['POST'])
def process_video():
    """Endpoint to manually trigger video processing"""
    data = request.json
    video_file = data.get('video_file', 'OCR-Video.mp4')
    camera_id = data.get('camera_id', 'CAM_01')
    
    video_path = os.path.join(VIDEO_DIR, video_file)
    
    # For demo purposes, if the video doesn't exist, consider it a success anyway
    # In a real app, you'd check for actual files
    try:
        # Start processing in a background thread
        thread = threading.Thread(
            target=process_video_task,
            args=(video_file, camera_id)
        )
        thread.daemon = True
        thread.start()
        
        return jsonify({
            "status": "processing", 
            "video": video_file,
            "message": "Video processing started in the background"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/video_segment', methods=['GET'])
def get_video_segment():
    """Endpoint to get a video segment based on timestamp"""
    video_path = request.args.get('video_path', '')
    start_time = float(request.args.get('start_time', 0))
    end_time = float(request.args.get('end_time', 0))
    
    if not video_path:
        return jsonify({"error": "No video path provided"}), 400
    
    # For the demo, we'll just return a placeholder message
    # In a real implementation, you would extract the video segment and return it
    return jsonify({
        "status": "success",
        "message": f"Video segment from {start_time} to {end_time} from {video_path} would be served here"
    })

@app.route('/')
def index():
    return "MSI Video Tracker API is running! Videos are being processed automatically."

if __name__ == '__main__':
    print("Starting MSI Video Tracker API server...")
    
    # Start video processing at startup
    process_all_videos()
    
    # Now start the Flask app
    app.run(debug=True, port=5000)
    # For Flask >= 2.0, @app.before_first_request is deprecated
    # We'll directly trigger the video processing at startup
    process_all_videos()
    
    app.run(debug=True, port=5000)
