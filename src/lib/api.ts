const API_URL = 'http://localhost:5000/api';

export interface SearchResult {
  text: string;
  timestamp: number;
  camera_id: string;
  source_video: string;
  screenshot_filename?: string;
}

export interface Video {
  id: string;
  name: string;
  camera_id: string;
}

export const searchText = async (query: string): Promise<SearchResult[]> => {
  try {
    const response = await fetch(`${API_URL}/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching text:', error);
    
    // For demo/development purposes, return mock data if API call fails
    if (query.toLowerCase().includes('msi')) {
      return [
        {
          text: 'MSI-123',
          timestamp: 10.5,
          camera_id: 'CAM_01',
          source_video: 'OCR-Video.mp4',
          screenshot_filename: 'MSI123_CAM_01_10_5s.png'
        }
      ];
    }
    
    return [];
  }
};

export const getVideos = async (): Promise<Video[]> => {
  try {
    const response = await fetch(`${API_URL}/videos`);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const data = await response.json();
    return data.videos || [];
  } catch (error) {
    console.error('Error getting videos:', error);
    // Return mock data for development
    return [
      { id: "OCR-Video.mp4", name: "OCR Video", camera_id: "CAM_01" }
    ];
  }
};

export const processVideo = async (videoFile: string): Promise<{status: string; message?: string}> => {
  try {
    const response = await fetch(`${API_URL}/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ video_file: videoFile }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error processing video:', error);
    // Return mock response for development
    return {
      status: "success",
      message: "Video processing simulation complete (mock response)"
    };
  }
};

export const getVideoSegmentUrl = (
  videoPath: string, 
  startTime: number, 
  endTime: number
): string => {
  return `${API_URL}/video_segment?video_path=${encodeURIComponent(videoPath)}&start_time=${startTime}&end_time=${endTime}`;
};

// Add a function to get screenshot URL
export const getScreenshotUrl = (filename: string | undefined): string => {
  if (!filename) return '';
  return `${API_URL}/screenshot/${encodeURIComponent(filename)}`;
};
