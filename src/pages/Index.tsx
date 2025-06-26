import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import SearchBar from '../components/SearchBar';
import ResultsArea from '../components/ResultsArea';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { searchText, SearchResult, getVideoSegmentUrl } from '../lib/api';

interface EnrichedSearchResult extends SearchResult {
  segment_start_time: number;
  segment_end_time: number;
}

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<EnrichedSearchResult | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (filters?: { dateRange?: { start: string; end: string }, cameraId?: string }) => {
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
      const searchResults = await searchText(searchQuery, filters);
      setResults(searchResults);
      
      if (searchResults.length === 0) {
        toast({
          title: "No results found",
          description: "Try a different search term",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
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
    const enrichedResult = {
      ...result,
      segment_start_time: Math.max(0, result.timestamp - 5),
      segment_end_time: result.timestamp + 5,
    };
    setSelectedVideo(enrichedResult);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  };

  const getVideoUrl = (result: EnrichedSearchResult) => {
    return getVideoSegmentUrl(
      result.source_video,
      result.segment_start_time,
      result.segment_end_time
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-dark via-cyber-darkCard to-cyber-dark relative overflow-hidden">
      {/* Background gradient overlays */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-radial from-cyber-blue/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-radial from-cyber-green/15 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-gradient-radial from-cyan-500/10 to-transparent rounded-full blur-2xl"></div>
      </div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-radial from-cyber-blue/5 to-transparent rounded-full blur-xl"></div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-cyber-gradient bg-clip-text text-transparent relative">
            Video Forensics Search
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto relative">
            Advanced AI-powered video analysis system for forensic investigation and evidence discovery
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearch={handleSearch}
          isLoading={isLoading}
        />

        {/* Results Area */}
        <div className="max-w-4xl mx-auto">
          <ResultsArea
            searchQuery={searchQuery}
            isLoading={isLoading}
            results={results}
            hasSearched={hasSearched}
            onPlayVideo={handlePlayVideo}
          />
        </div>

        {/* Video Player Modal */}
        {selectedVideo && (
          <VideoPlayerModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            videoUrl={getVideoUrl(selectedVideo)}
            result={selectedVideo}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
