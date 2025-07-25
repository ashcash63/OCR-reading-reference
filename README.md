This application processes videos to extract text using OCR, stores the results, and allows searching through the extracted text.

## Setup Instructions

### Prerequisites
- Python 3.8 or higher
- Node.js 16 or higher
- A video file named "OCR-Video.mp4" placed in the backend directory

### Backend Setup

1. Create and activate a virtual environment:
   ```bash
   cd backend
   python -m venv venv
   
   # On Windows:
   .\venv\Scripts\activate
   
   # On macOS/Linux:
   source venv/bin/activate
   ```

2. Install Python dependencies:
   ```bash
   # Make sure your virtual environment is activated (you should see (venv) at the beginning of your command line)
   pip install flask flask-cors
   
   # Only install these if needed for video processing:
   # pip install opencv-python easyocr
   ```

3. Start the backend server:
   ```bash
   # Make sure you're in the backend directory with the virtual environment activated
   python app.py
   ```

### Frontend Setup

1. Install Node.js dependencies:
   ```bash
   # From the project root directory
   npm install
   ```

2. Start the frontend server:
   ```bash
   npm run dev  # For Vite-based projects
   # OR
   npm start    # For Create React App projects
   ```

## Usage

1. Place your video file in the `backend` directory and ensure it's named `OCR-Video.mp4`.
2. Start the backend and frontend servers using the setup instructions above.
3. Access the application in your web browser (usually at `http://localhost:3000` for the frontend).
4. Upload your video and start the processing.
5. Once processing is complete, use the search functionality to find text within the video.

## Note
- Ensure that the video file is in the correct format and is not corrupted.
- The application may take some time to process the video depending on its length and complexity.
