from flask import Flask, jsonify, request, send_file, after_this_request
from flask_cors import CORS
import os
import threading
import cv2
import time
import sys
import tempfile
import easyocr
import chromadb
import multiprocessing

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Global Variables & Constants ---
VIDEO_DIR = "videos"
SCREENSHOT_DIR = "screenshots"
DB_PATH = "db_data"
CONFIDENCE_THRESHOLD = 0.7  # Only save detections with confidence > 70%

# --- OCR and Database Setup ---
# The main EasyOCR reader instance for the main process (e.g., for manual processing requests)
print("Initializing Main EasyOCR Reader...")
try:
    main_reader = easyocr.Reader(['en'], gpu=False) # Use CPU for stability
    print("Main EasyOCR Reader initialized.")
except Exception as e:
    print(f"Fatal Error: Could not initialize EasyOCR: {e}")
    sys.exit()

# --- ChromaDB Client ---
print("Initializing ChromaDB...")
try:
    client = chromadb.PersistentClient(path=DB_PATH)
    # The collection will be fetched by functions as needed, not stored globally.
    print("ChromaDB connection successful.")
except Exception as e:
    print(f"Fatal Error: Could not connect to ChromaDB: {e}")
    sys.exit()


# --- Directory and File Setup ---
for directory in [VIDEO_DIR, SCREENSHOT_DIR]:
    if not os.path.exists(directory):
        os.makedirs(directory)

# --- Core Functions ---

def save_text_data(text, metadata):
    """Save a single detected text entry to ChromaDB."""
    try:
        # Get a handle to the collection inside the function for thread/process safety
        collection = client.get_collection(name="video_text_search")
        unique_id = f"{metadata['camera_id']}_{metadata['source_video']}_{text}_{metadata['timestamp']}"
        collection.add(documents=[text], metadatas=[metadata], ids=[unique_id])
        return True
    except Exception as e:
        # This can fail if an identical entry is processed, which is fine.
        if "ID already exists" not in str(e):
            print(f"Error saving data to ChromaDB: {e}")
        return False

def search_text_data(query):
    """Search for text using ChromaDB with a specific filter."""
    try:
        # Get a fresh handle to the collection to ensure it exists
        collection = client.get_collection(name="video_text_search")
        # Use where_document for specific substring matching, which is what users expect.
        results = collection.query(
            query_texts=[query],
            where_document={"$contains": query},
            n_results=50  # Retrieve more results to ensure we have enough matches
        )
        
        if not results or not results['documents'] or not results['documents'][0]:
            return []

        # Format results for the frontend
        formatted_results = []
        for i, doc in enumerate(results['documents'][0]):
            meta = results['metadatas'][0][i]
            formatted_result = {
                'text': doc,
                'timestamp': meta.get('timestamp'),
                'camera_id': meta.get('camera_id'),
                'source_video': meta.get('source_video'),
                'screenshot_filename': os.path.basename(meta.get('screenshot_path', ''))
            }
            formatted_results.append(formatted_result)
        
        return formatted_results
    except Exception as e:
        print(f"Error querying ChromaDB: {e}")
        return []

def capture_screenshot_with_highlight(frame, bbox, text, timestamp, camera_id):
    """Capture a screenshot and highlight the detected text."""
    try:
        highlighted_frame = frame.copy()
        (tl, tr, br, bl) = bbox
        tl = (int(tl[0]), int(tl[1]))
        br = (int(br[0]), int(br[1]))
        # Draw the green highlight box
        cv2.rectangle(highlighted_frame, tl, br, (0, 255, 0), 2)
        
        safe_text = "".join(c for c in text if c.isalnum())[:20]
        timestamp_str = f"{timestamp:.1f}s".replace('.', '_')
        filename = f"{safe_text}_{camera_id}_{timestamp_str}.png"
        filepath = os.path.join(SCREENSHOT_DIR, filename)
        
        cv2.imwrite(filepath, highlighted_frame)
        print(f"  → Highlighted screenshot saved: {filename}")
        return filepath
    except Exception as e:
        print(f"Error saving highlighted screenshot: {e}")
        return None

# --- Multiprocessing Functions ---

# Global variable to hold the EasyOCR reader for each worker process
worker_reader = None

def init_worker():
    """Initializer for each worker process in the pool."""
    global worker_reader
    print(f"Initializing EasyOCR reader in worker process {os.getpid()}...")
    # Each process gets its own reader instance to avoid conflicts.
    worker_reader = easyocr.Reader(['en'], gpu=False)
    print(f"Worker {os.getpid()} initialized.")

def process_video_task(video_path):
    """Worker task to process a single video file using EasyOCR."""
    global worker_reader
    if worker_reader is None:
        print("Error: Worker not initialized.")
        return

    video_file = os.path.basename(video_path)
    camera_id = os.path.splitext(video_file)[0] # Use filename as camera_id
    interval_seconds = 1 # Process one frame per second

    try:
        print(f"Processing video: {video_file} (Camera ID: {camera_id})")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file '{video_path}'")
            return

        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0: fps = 30
        frames_to_skip = int(fps * interval_seconds)
        
        frame_count = 0
        while True:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
            success, frame = cap.read()
            if not success:
                break

            current_timestamp = frame_count / fps
            ocr_results = worker_reader.readtext(frame)
            
            for (bbox, text, confidence) in ocr_results:
                if confidence >= CONFIDENCE_THRESHOLD:
                    screenshot_path = capture_screenshot_with_highlight(
                        frame, bbox, text, current_timestamp, camera_id
                    )
                    metadata = {
                        'timestamp': current_timestamp,
                        'camera_id': camera_id,
                        'source_video': video_file,
                        'confidence': float(confidence),
                        'screenshot_path': screenshot_path or ''
                    }
                    save_text_data(text, metadata)

            frame_count += frames_to_skip

        print(f"Completed processing {video_file}")
    except Exception as e:
        print(f"Error in process_video_task for {video_file}: {e}")
    finally:
        if 'cap' in locals() and cap.isOpened():
            cap.release()

def process_all_videos_multiprocess():
    """Finds all videos and processes them using a multiprocessing pool."""
    print("\n--- Starting Automatic Video Processing using Multiprocessing ---")
    
    try:
        print("Clearing old data from ChromaDB collection...")
        client.delete_collection(name="video_text_search")
        # Recreate it immediately so workers can access it
        client.get_or_create_collection(name="video_text_search")
        print("Collection cleared and recreated.")
    except Exception as e:
        print(f"Could not clear collection (it may not have existed): {e}")
        # Ensure the collection exists for the workers
        client.get_or_create_collection(name="video_text_search")

    video_files = [os.path.join(VIDEO_DIR, f) for f in os.listdir(VIDEO_DIR) if f.endswith(('.mp4', '.mov', '.avi'))]
    if not video_files:
        print("No video files found in the 'videos' directory.")
        return

    print(f"Found {len(video_files)} videos to process: {[os.path.basename(f) for f in video_files]}")

    # Use a multiprocessing Pool to process videos in parallel
    # We limit processes to 4 to avoid overwhelming the system. Adjust as needed.
    num_processes = min(multiprocessing.cpu_count(), 4)
    with multiprocessing.Pool(processes=num_processes, initializer=init_worker) as pool:
        pool.map(process_video_task, video_files)
    
    print("--- All video processing tasks dispatched ---")

# --- Flask API Routes ---

@app.route('/api/search', methods=['GET'])
def search_text():
    """Endpoint for searching text in videos."""
    query = request.args.get('query', '')
    if not query:
        return jsonify({"error": "No query provided"}), 400
    
    try:
        results = search_text_data(query)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@app.route('/api/videos', methods=['GET'])
def list_videos():
    """Endpoint to list available videos"""
    # Dynamically list videos from the video directory
    try:
        video_files = [f for f in os.listdir(VIDEO_DIR) if f.endswith(('.mp4', '.mov', '.avi'))]
        videos = [{"id": f, "name": f, "camera_id": os.path.splitext(f)[0]} for f in video_files]
        return jsonify({"videos": videos})
    except FileNotFoundError:
        return jsonify({"videos": []})


@app.route('/api/process', methods=['POST'])
def process_video():
    """Endpoint to manually trigger processing for a single video."""
    data = request.json
    video_file = data.get('video_file')
    if not video_file:
        return jsonify({"error": "No video_file provided"}), 400
        
    video_path = os.path.join(VIDEO_DIR, video_file)
    if not os.path.exists(video_path):
        return jsonify({"error": f"Video file not found: {video_path}"}), 404

    try:
        # Use the main process's reader for single requests
        thread = threading.Thread(target=process_video_task, args=(video_path,))
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
    video_path_arg = request.args.get('video_path', '')
    start_time = float(request.args.get('start_time', 0))
    end_time = float(request.args.get('end_time', 0))
    
    if not video_path_arg:
        return jsonify({"error": "No video path provided"}), 400
    
    source_video_path = os.path.join(VIDEO_DIR, video_path_arg)
    if not os.path.exists(source_video_path):
        return jsonify({"error": f"Video file not found: {video_path_arg}"}), 404

    try:
        cap = cv2.VideoCapture(source_video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps == 0:
            fps = 30 # Default fps if not available
            
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')

        start_frame = int(start_time * fps)
        end_frame = int(end_time * fps)

        # Create a temporary file to store the video segment
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_video:
            temp_video_path = temp_video.name
        
        writer = cv2.VideoWriter(temp_video_path, fourcc, fps, (width, height))

        cap.set(cv2.CAP_PROP_POS_FRAMES, start_frame)
        
        current_frame = start_frame
        while current_frame <= end_frame:
            success, frame = cap.read()
            if not success:
                break
            writer.write(frame)
            current_frame += 1
        
        cap.release()
        writer.release()

        # Schedule the temporary file to be deleted after the request is handled
        @after_this_request
        def cleanup(response):
            try:
                os.remove(temp_video_path)
            except Exception as error:
                app.logger.error("Error removing temporary file: %s", error)
            return response

        return send_file(temp_video_path, mimetype='video/mp4')

    except Exception as e:
        print(f"Error creating video segment: {e}")
        return jsonify({"error": "Failed to create video segment"}), 500

@app.route('/')
def index():
    return "MSI Video Tracker API is running! Videos are being processed automatically."

if __name__ == '__main__':
    # This needs to be here for multiprocessing on Windows
    multiprocessing.freeze_support()
    
    print("Starting MSI Video Tracker API server...")
    
    # Start video processing at startup
    process_all_videos_multiprocess()
    
    # Now start the Flask app.
    app.run(debug=True, port=5000, use_reloader=False)
