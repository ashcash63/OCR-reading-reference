# backend/process_video.py

import cv2
import easyocr
import os
import sys
import chromadb
import numpy as np

# --- Configuration ---
# List of video files to process. Add all your video files here.
VIDEOS_TO_PROCESS = [
    {"id": "Vid_0", "path": "my_test_video.mp4"},
    {"id": "Vid_1", "path": "OCR-Video.mp4"},
    {"id": "Vid_2", "path": "OCR-Video2.mp4"},
    {"id": "Vid_3", "path": "OCR-Video3.mp4"},
    {"id": "Vid_4", "path": "OCR-Video4.mp4"},
    {"id": "Vid_5", "path": "OCR-Video5.mp4"},
    {"id": "Vid_6", "path": "OCR-Video6.mp4"},
    {"id": "Vid_7", "path": "OCR-Video7.mp4"},
]

# How often to process a frame. A smaller number is more thorough but slower.
PROCESS_EVERY_NTH_FRAME = 10 # Approx. 3 frames per second for a 30fps video

# Directory to save the highlighted keyword screenshots
SCREENSHOT_DIR = "screenshots"
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

# Color for the highlight box (in BGR format)
HIGHLIGHT_COLOR = (0, 255, 0) # Bright Green
HIGHLIGHT_THICKNESS = 2


# --- Database & OCR Setup ---
try:
    client = chromadb.PersistentClient(path="db_data")
    # Let's clear the old collection to start fresh with our new data structure
    # In a real app, you might migrate data, but for the hackathon, starting clean is easier.
    client.delete_collection(name="video_text_search")
    collection = client.get_or_create_collection(name="video_text_search")
    print("ChromaDB connection successful. Old collection cleared.")
    
    print("Initializing EasyOCR...")
    reader = easyocr.Reader(['en'])
    print("EasyOCR initialized.")
except Exception as e:
    print(f"Error during setup: {e}")
    sys.exit()


def search_videos_for_keyword(target_keyword, confidence_threshold=0.7):
    """
    Processes all videos in the list, searching specifically for the target_keyword.
    """
    print(f"\nStarting search for keyword: '{target_keyword}' with confidence > {confidence_threshold:.0%}")
    
    total_detections = 0
    
    for video_info in VIDEOS_TO_PROCESS:
        camera_id = video_info["id"]
        video_path = video_info["path"]
        
        print(f"\n--- Analyzing Video: {video_path} (Camera: {camera_id}) ---")
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"Error: Could not open video file '{video_path}'")
            continue

        fps = cap.get(cv2.CAP_PROP_FPS)
        
        frame_number = 0
        while True:
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            success, frame = cap.read()
            if not success:
                break # End of video

            current_timestamp = frame_number / fps
            
            # Use EasyOCR to get detailed results (bounding box, text, confidence)
            results = reader.readtext(frame)
            
            for (bbox, text, confidence) in results:
                # Check if the detected text contains our target and meets the confidence threshold
                if target_keyword.lower() in text.lower() and confidence >= confidence_threshold:
                    print(f"  -> Match found! Text: '{text}' at {current_timestamp:.2f}s (Confidence: {confidence:.2f})")
                    
                    # Save the highlighted frame as a record
                    save_highlighted_instance(frame, bbox, text, current_timestamp, confidence, camera_id, video_path)
                    total_detections += 1
                    
                    # Optional: To avoid saving multiple very similar frames, we can jump forward in the video
                    # frame_number += int(fps) # Skip 1 second
                    break # Move to the next frame after finding a match in this one

            frame_number += PROCESS_EVERY_NTH_FRAME

        cap.release()

    print(f"\n--- Search Complete ---")
    print(f"Found and saved {total_detections} instances of '{target_keyword}'.")


def save_highlighted_instance(frame, bbox, text, timestamp, confidence, camera_id, video_path):
    """
    Draws a highlight box on the full frame, saves it, and adds the record to ChromaDB.
    """
    # 1. Draw the highlight box on a copy of the frame
    highlighted_frame = frame.copy()
    (tl, tr, br, bl) = bbox
    tl = (int(tl[0]), int(tl[1]))
    br = (int(br[0]), int(br[1]))
    cv2.rectangle(highlighted_frame, tl, br, HIGHLIGHT_COLOR, HIGHLIGHT_THICKNESS)
    
    # 2. Save the highlighted frame to a file
    safe_keyword = "".join(c for c in text if c.isalnum())[:20]
    timestamp_str = f"{timestamp:.1f}s".replace('.', '_')
    filename = f"{safe_keyword}_{camera_id}_{timestamp_str}.png"
    filepath = os.path.join(SCREENSHOT_DIR, filename)
    
    cv2.imwrite(filepath, highlighted_frame)
    
    # 3. Add the record to ChromaDB
    unique_id = f"{camera_id}_{video_path}_{text}_{timestamp}"
    
    collection.add(
        documents=[text], # Store the actual text found
        metadatas=[{
            'camera_id': camera_id,
            'source_video': video_path,
            'timestamp': timestamp,
            'confidence': float(confidence),
            'screenshot_path': filepath
        }],
        ids=[unique_id]
    )


# --- Main Execution ---
if __name__ == "__main__":
    # 1. Get user input first
    target = input("Enter the keyword you want to search for in the videos: ").strip()
    
    if not target:
        print("No keyword provided. Exiting.")
        sys.exit()

    # 2. Run the targeted search
    search_videos_for_keyword(target_keyword=target)

    # 3. Verification
    record_count = collection.count()
    if record_count > 0:
        print("\n--- Verifying saved data ---")
        results = collection.get(limit=5, include=["metadatas", "documents"])
        print("Last 5 records saved to the database:")
        for i, doc in enumerate(results['documents']):
            metadata = results['metadatas'][i]
            print(f"- Found: '{doc}' | Screenshot: {metadata['screenshot_path']}")
    else:
        print("\nNo records were saved to the database for the given keyword.")
