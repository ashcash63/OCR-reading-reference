# backend/process_video.py

import cv2
import easyocr
import time
import sys
import chromadb

# --- Database Setup ---
# This will create a new directory 'db_data' to store the database persistently.
client = chromadb.PersistentClient(path="db_data")

# Get or create a "collection" (like a table in a traditional database).
# If the collection already exists, it will use the existing one.
collection = client.get_or_create_collection(name="video_text_search")
print("ChromaDB collection 'video_text_search' loaded/created.")


# --- OCR Setup ---
print("Initializing EasyOCR... This may take a moment on the first run.")
try:
    reader = easyocr.Reader(['en']) 
    print("EasyOCR initialized successfully.")
except Exception as e:
    print(f"Error initializing EasyOCR: {e}")
    sys.exit()


# --- Configuration ---
VIDEO_FILE_NAME = "OCR-Video.mp4" 
PROCESS_INTERVAL_SECONDS = 1
# This is a sample Camera ID. In a real system, this would be dynamic.
CAMERA_ID = "CAM_01"


try:
    # 1. Open the video file
    cap = cv2.VideoCapture(VIDEO_FILE_NAME)
    if not cap.isOpened():
        print(f"Error: Could not open video file '{VIDEO_FILE_NAME}'")
        sys.exit()

    fps = cap.get(cv2.CAP_PROP_FPS)
    frames_to_skip = int(fps * PROCESS_INTERVAL_SECONDS)
    
    print("\n--- Video Processing Started ---")
    print(f"Processing one frame every {PROCESS_INTERVAL_SECONDS} second(s).")
    print("--------------------------------\n")

    frame_count = 0
    
    # 2. Loop through the video
    while True:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_count)
        success, frame = cap.read()
        if not success:
            break # End of video

        current_timestamp_seconds = frame_count / fps
        detected_text_list = reader.readtext(frame, detail=0, paragraph=True)
        
        # 3. Save results to the database if any text was found
        if detected_text_list:
            print(f"Timestamp: {current_timestamp_seconds:.2f}s - Saving detected text: {detected_text_list}")
            
            # ChromaDB needs a unique ID for each piece of data.
            # We'll generate one based on the video, frame, and text index.
            ids_to_add = [f"{VIDEO_FILE_NAME}_{frame_count}_{i}" for i in range(len(detected_text_list))]
            
            # We store the timestamp and camera ID as "metadata".
            metadatas_to_add = [{
                'timestamp': current_timestamp_seconds,
                'camera_id': CAMERA_ID,
                'source_video': VIDEO_FILE_NAME
            } for _ in detected_text_list]

            # Add the detected text strings (as "documents") and their metadata to the database
            collection.add(
                documents=detected_text_list,
                metadatas=metadatas_to_add,
                ids=ids_to_add
            )

        frame_count += frames_to_skip

    print("\n--- Processing Complete ---")

    # --- Verification Step ---
    # Now, let's test if the data was saved by querying the database.
    print("\n--- Running Verification Query ---")
    
    # CHANGE THIS to a keyword you expect to be in your video
    QUERY_TEXT = "MSI-123" 
    
    print(f"Querying for text similar to: '{QUERY_TEXT}'")
    
    results = collection.query(
        query_texts=[QUERY_TEXT],
        n_results=5  # Ask for the top 5 most similar results
    )
    
    if not results or not results['documents'][0]:
        print("No results found for the query text.")
    else:
        print("\n--- Query Results ---")
        for i, doc in enumerate(results['documents'][0]):
            metadata = results['metadatas'][0][i]
            print(f"- Found: '{doc}'")
            print(f"  - Timestamp: {metadata['timestamp']:.2f}s")
            print(f"  - Camera: {metadata['camera_id']}")
        print("--------------------")


except Exception as e:
    print(f"An unexpected error occurred: {e}")

finally:
    # 4. Clean up
    if 'cap' in locals() and cap.isOpened():
        cap.release()
    print("Resources released.")