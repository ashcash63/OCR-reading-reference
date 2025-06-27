import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { searchText, getVideos, processVideo, type SearchResult, type Video } from "./lib/api";
import { useToast } from "./hooks/use-toast";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SearchBar from "./components/SearchBar";
import ResultsArea from "./components/ResultsArea";
import VideoPlayerModal from "./components/VideoPlayerModal";

function Header({ onHome, searchQuery, setSearchQuery, onSearch, isLoading }) {
  return (
    <header className="w-full flex items-center justify-between px-4 py-2 bg-card border-b border-border shadow-sm z-50 h-14">
      <div className="flex items-center gap-2">
        <img src="/security-camera.png" alt="Security Camera Logo" className="w-7 h-7" />
        <button className="text-lg font-bold text-primary" onClick={onHome}>
          Deja View
        </button>
      </div>
      <div className="w-80 max-w-full">
        <form onSubmit={e => { e.preventDefault(); onSearch(); }} className="flex items-center gap-0">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 rounded-l bg-muted text-foreground border border-border border-r-0 focus:outline-none text-sm w-48 h-8"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`px-4 h-8 bg-primary text-primary-foreground rounded-r text-base font-semibold hover:opacity-90 transition-opacity ${isLoading ? 'opacity-70' : ''}`}
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}

const queryClient = new QueryClient();

function App() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<SearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load available videos when component mounts
    const loadVideos = async () => {
      try {
        const videoList = await getVideos();
        setVideos(videoList);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load videos",
          variant: "destructive",
        });
      }
    };

    loadVideos();
  }, []);

  const handleSearch = async (filters) => {
    if (!searchQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a search term",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setHasSearched(true);
    try {
      const results = await searchText(searchQuery, filters);
      setSearchResults(results);
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayVideo = (result: SearchResult) => {
    setSelectedVideo(result);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const handleHome = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
    setSelectedVideo(null);
    setIsModalOpen(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        {hasSearched ? (
          <>
            <Header
              onHome={handleHome}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              isLoading={isLoading}
            />
            <div className="min-h-screen bg-background">
              <div className="container mx-auto px-4 py-8 relative z-10">
                <div className="max-w-4xl mx-auto">
                  <ResultsArea
                    searchQuery={searchQuery}
                    isLoading={isLoading}
                    results={searchResults}
                    hasSearched={hasSearched}
                    onPlayVideo={handlePlayVideo}
                  />
                  {selectedVideo && (
                    <VideoPlayerModal
                      isOpen={isModalOpen}
                      onClose={handleCloseModal}
                      videoUrl={selectedVideo.source_video}
                      result={selectedVideo}
                    />
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="min-h-screen flex flex-col items-center justify-start bg-background relative overflow-hidden pt-20">
            <div className="homepage-bg" />
            <img src="/security-camera.png" alt="Security Camera" className="w-20 h-20 mb-4 z-10" />
            <h1 className="text-4xl font-bold text-primary mb-1 z-10">Deja View</h1>
            <h2 className="text-base text-muted-foreground mb-3 z-10 text-center max-w-xl mx-auto">
              Video Forensic Search
            </h2>
            <p className="text-lg text-muted-foreground mb-6 z-10 text-center max-w-xl mx-auto">
              The AI-powered search engine that pinpoints critical moments and evidence in your surveillance footage.
            </p>
            <div className="w-full max-w-xl z-10">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSearch={handleSearch}
                isLoading={isLoading}
                compact
              />
            </div>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
