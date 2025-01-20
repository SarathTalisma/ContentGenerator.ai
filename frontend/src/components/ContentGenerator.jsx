import React, { useState, useEffect } from 'react';
import {
    Twitter,
    Linkedin,
    Instagram,
    Copy,
    Wand2,
    Image as ImageIcon,
    X,
    ExternalLink,
    Plus,
    Sun,
    SunMoon 
} from 'lucide-react';
import './ContentGenerator.css';
import GalleryIcon from '../assets/gallery.gif';
import SearchIcon from '../assets/search.gif';
import AIIcon from '../assets/Icon.gif';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
    console.error('Missing Unsplash API key in environment variables');
}

const ImageSearch = ({ onClick, showImageSearch }) => (
    <button
        onClick={onClick}
        className="px-6 h-12 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-purple-700 to-pink-700 text-white hover:from-purple-600 hover:to-pink-600"
    >
        <img src={GalleryIcon} alt="Gallery" className="w-5 h-5" />
        {showImageSearch ? 'Hide Images' : 'Add Image'}
    </button>
);

const ContentGenerator = () => {
    const [prompt, setPrompt] = useState('');
    const [platform, setPlatform] = useState('twitter');
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [showImageSearch, setShowImageSearch] = useState(false);
    const [images, setImages] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageSearch, setImageSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [darkMode, setDarkMode] = useState(() => {
        // Check if window is defined (client-side)
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark';
        }
        return false;
    });

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const toggleTheme = () => {
        setDarkMode(!darkMode);
    };

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt');
            return;
        }

        setLoading(true);
        setError('');
        setGeneratedContent('');

        try {
            const response = await fetch('http://localhost:3001/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt, platform }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setGeneratedContent(data.content);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const searchImages = async (pageNum = 1, append = false) => {
        if (!imageSearch.trim() || !UNSPLASH_ACCESS_KEY) return;

        setImageLoading(true);
        setError('');

        if (pageNum === 1 && !append) {
            setImages([]);
            setHasMore(true);
        }

        try {
            const response = await fetch(
                `https://api.unsplash.com/search/photos?query=${encodeURIComponent(imageSearch)}&page=${pageNum}&per_page=12`,
                {
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setTotalPages(Math.ceil(data.total / 12));
            setHasMore(pageNum < Math.ceil(data.total / 12));

            if (append) {
                setImages((prev) => [...prev, ...data.results]);
            } else {
                setImages(data.results);
            }
        } catch (error) {
            setError(`Failed to fetch images: ${error.message}`);
        } finally {
            setImageLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        searchImages(nextPage, true);
    };

    const handleInitialSearch = () => {
        setPage(1);
        searchImages(1, false);
    };

    const handleCopy = async () => {
        try {
            const contentToCopy = selectedImage
                ? `${generatedContent}\n\nImage: ${selectedImage.urls.regular}`
                : generatedContent;

            await navigator.clipboard.writeText(contentToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            setError('Failed to copy to clipboard');
        }
    };

    const handleImageSearch = (e) => {
        if (e.key === 'Enter') {
            handleInitialSearch();
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'twitter':
                return <Twitter className="w-5 h-5 text-blue-400" />;
            case 'linkedin':
                return <Linkedin className="w-5 h-5 text-blue-700" />;
            case 'instagram':
                return <Instagram className="w-5 h-5 text-pink-700" />;
            default:
                return null;
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-6xl mx-auto p-6">
                <div className={`overflow-hidden shadow-xl rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <img src={AIIcon} alt="AI Icon" className="w-12 h-12" />
                                <h1 className="text-4xl">
                                    <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent">AI</span>
                                    <span className={`mx-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Content</span>
                                    <span className="bg-gradient-to-r from-pink-700 to-purple-700 bg-clip-text text-transparent">Generator</span>
                                </h1>
                            </div>
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-lg transition-colors duration-200 ${darkMode
                                    ? 'hover:bg-gray-700 bg-gray-700 text-yellow-500'
                                    : 'hover:bg-gray-0 bg-gray-100 text-gray-500'
                                    }`}
                            >
                                {darkMode ? <Sun className="w-6 h-6" /> : <SunMoon className="w-6 h-6" />}
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className={`flex-1 max-w-[200px] h-12 px-4 rounded-lg border transition-colors duration-200 ${darkMode
                                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500'
                                        : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500'
                                        }`}
                                >
                                    <option value="twitter">Twitter</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="instagram">Instagram</option>
                                </select>

                                <ImageSearch
                                    onClick={() => setShowImageSearch(!showImageSearch)}
                                    showImageSearch={showImageSearch}
                                />
                            </div>

                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="e.g., Write a post about artificial intelligence..."
                                className={`w-full min-h-[150px] p-4 rounded-lg border transition-colors duration-200 ${darkMode
                                    ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                    : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                    }`}
                            />
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !prompt}
                                className="h-10 px-6 bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4" />
                                )}
                                {loading ? 'Generating...' : 'Generate'}
                            </button>

                            {error && (
                                <div className={`p-4 rounded-lg ${darkMode
                                    ? 'bg-red-900/50 text-red-200'
                                    : 'bg-red-50 text-red-700'
                                    }`}>
                                    {error}
                                </div>
                            )}

                            {generatedContent && (
                                <div className="flex flex-col md:flex-row gap-4">
                                    {selectedImage && (
                                        <div className={`relative w-full max-w-[300px] h-[400px] border rounded-lg overflow-hidden ${darkMode
                                            ? 'border-gray-600 bg-gray-700'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}>
                                            <img
                                                src={selectedImage.urls.regular}
                                                alt={selectedImage.alt_description || 'Selected image'}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => setSelectedImage(null)}
                                                className={`absolute top-2 right-2 p-2 rounded-full shadow-lg transition-colors duration-200 ${darkMode
                                                    ? 'bg-white hover:bg-gray-100'
                                                    : 'bg-white hover:bg-gray-100'
                                                    }`}
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'
                                                }`}>
                                                Generated Content
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {getPlatformIcon(platform)}
                                                <span className={`text-sm capitalize ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    {platform}
                                                </span>
                                            </div>
                                        </div>

                                        <div className={`overflow-y-auto max-h-[400px] p-4 rounded-lg border ${darkMode
                                            ? 'bg-gray-700 border-gray-600 text-gray-200'
                                            : 'bg-gray-50 border-gray-200 text-gray-800'
                                            }`}>
                                            <p>{generatedContent}</p>
                                        </div>

                                        <button
                                            onClick={handleCopy}
                                            className={`w-full h-12 border rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group ${darkMode
                                                ? 'border-gray-600 hover:bg-gray-700 text-gray-200'
                                                : 'border-gray-200 hover:bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            <Copy className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                                            {copied ? 'Copied!' : 'Copy to Clipboard'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {showImageSearch && (
                                <div className="space-y-6 animate-fadeIn">
                                    <div className="flex gap-2">
                                        <div className={`flex-1 relative ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            <input
                                                type="text"
                                                value={imageSearch}
                                                onChange={(e) => setImageSearch(e.target.value)}
                                                onKeyDown={handleImageSearch}
                                                placeholder="Search for images..."
                                                className={`w-full h-12 px-4 rounded-lg border transition-all duration-200 
                                                ${darkMode
                                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                                    }
                                                hover:border-purple-400`}
                                            />
                                        </div>
                                        <button
                                            onClick={handleInitialSearch}
                                            disabled={imageLoading || !imageSearch.trim()}
                                            className="px-8 h-12 bg-gradient-to-r from-purple-700 to-pink-700 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {imageLoading && page === 1 ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <>
                                                    <img src={SearchIcon} alt="Search" className="w-5 h-5" />
                                                    Search
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {images.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {images.map((image) => (
                                                    <div
                                                        key={image.id}
                                                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group ${selectedImage?.id === image.id ? 'ring-4 ring-purple-700' : ''}`}
                                                        onClick={() => setSelectedImage(selectedImage?.id === image.id ? null : image)}
                                                    >
                                                        <img
                                                            src={image.urls.small}
                                                            alt={image.alt_description || 'Search result'}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {selectedImage?.id === image.id && (
                                                            <div className="absolute inset-0 bg-purple-700/20 flex items-center justify-center">
                                                                <div className="bg-white dark:bg-gray-800 rounded-full p-1">
                                                                    <ImageIcon className="w-6 h-6 text-purple-700" />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {hasMore && (
                                                <div className="flex justify-center mt-8">
                                                    <button
                                                        onClick={handleLoadMore}
                                                        disabled={imageLoading}
                                                        className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-sm transition-all duration-200
                                                                ${darkMode ?
                                                                'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600' :
                                                                'bg-gray-200 border-gray-200 text-black-500 hover:bg-gray-50'}
                                                                  disabled:opacity-50 disabled:cursor-not-allowed`}
                                                    >
                                                        {imageLoading ? (
                                                            <div
                                                                className={`w-5 h-5 border-2 rounded-full animate-spin ${darkMode
                                                                    ? 'border-purple-400 border-t-transparent'
                                                                    : 'border-purple-700 border-t-transparent'
                                                                    }`}
                                                            />
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <Plus
                                                                    className={`w-5 h-5 ${darkMode
                                                                        ? 'text-purple-400'
                                                                        : 'text-purple-700'
                                                                        }`}
                                                                />
                                                                <span>
                                                                    Load More Images
                                                                </span>
                                                            </div>
                                                        )}
                                                    </button>

                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContentGenerator;