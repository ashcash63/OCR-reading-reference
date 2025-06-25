README: Video Forensics Search
This README documents the necessary steps to get the "Ctrl+F for Video" application up and running.

What is this repository for?
Quick Summary: This project is a proof-of-concept for a powerful video analysis tool. It ingests video footage from sources like security cameras, uses Optical Character Recognition (OCR) to identify text within the frames, and indexes this text against its timestamp. The result is a simple web interface that allows a user to instantly search hours of footage for a specific keyword (e.g., a pallet ID, a license plate, a warning sign) and view the exact video clip where it appears. We call it "Ctrl+F for the Real World."

Version: 0.1.0 (Hackathon Prototype)

How do I get set up?
This project consists of two main parts: a Python backend (for video processing and search) and a React frontend (for the user interface).

Summary of Set Up

Clone the repository.

Set up the Python backend environment.

Set up the Node.js frontend environment.

Run the backend server.

Run the frontend development server.

Dependencies

Backend (Python 3.9+):

fastapi: For building the API.

uvicorn: For running the API server.

opencv-python: For video frame extraction.

easyocr: For text recognition.

chromadb: For the vector/metadata database.

Install all dependencies using pip:

pip install -r requirements.txt 

(You will need to create a requirements.txt file from your environment)

Frontend (Node.js 16+):

react: For building the user interface.

tailwindcss: For styling.

Install all dependencies from the frontend directory:

cd frontend
npm install

Database Configuration

This project uses ChromaDB, which is initiated within the Python backend script.

By default, it runs in-memory or creates a local, file-based database in the project directory.

No manual database configuration is required for the prototype to run. The backend script handles the creation and connection automatically.

How to Run the Application

Start the Backend Server: From the project root directory, run the FastAPI server using Uvicorn.

uvicorn main:app --reload

The backend API will now be running, typically at http://127.0.0.1:8000.

Start the Frontend Application: In a separate terminal, navigate to the frontend directory and start the React development server.

cd frontend
npm start

The user interface will now be accessible in your web browser, typically at http://localhost:3000.

Deployment Instructions

For the hackathon, the application is run locally using the development servers as described above. A production deployment would involve building the static React files and serving them, and running the FastAPI backend with a production-grade server like Gunicorn behind a reverse proxy like Nginx.

Contribution Guidelines
Code Review: All new features should be developed on separate branches and submitted as pull requests to main. At least one other team member must review and approve the pull request before merging.

Writing Tests: While formal unit tests are not a primary focus for this 48-hour prototype, all backend API endpoints should be manually tested with a tool like Postman (Arun's responsibility). All frontend components should be visually verified for functionality and responsiveness.

Code Style: Follow standard PEP 8 for Python and the Prettier style guide for React/JavaScript to maintain consistency.

Who do I talk to?
Project Lead & Vision: Siddarth (PM)

Backend Architecture & API: Sammy (Backend SWE)

Frontend UI/UX & Components: Aashi (Frontend SWE)

Testing, Data & Quality Assurance: Arun (QA Engineer)