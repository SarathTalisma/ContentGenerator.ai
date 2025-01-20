import React, { useState, useRef, useEffect } from 'react';
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
    Moon
} from 'lucide-react';
import GalleryIcon from '../assets/gallery.gif';
import SearchIcon from '../assets/search.gif';

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

if (!UNSPLASH_ACCESS_KEY) {
    console.error('Missing Unsplash API key in environment variables');
}

const ImageSearch = ({ onClick, showImageSearch }) => (
    <button
        onClick={onClick}
        className="px-6 h-12 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
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
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' || 
                   (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
        }
        return false;
    });
    
    const imageSearchRef = useRef(null);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    const handleToggleTheme = () => {
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

    const handleImageSearchToggle = () => {
        const newState = !showImageSearch;
        setShowImageSearch(newState);
        if (newState) {
            // Use setTimeout to ensure the input is rendered before focusing
            setTimeout(() => {
                imageSearchRef.current?.focus();
            }, 100);
        }
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'twitter':
                return <Twitter className="w-5 h-5 text-blue-400" />;
            case 'linkedin':
                return <Linkedin className="w-5 h-5 text-blue-700" />;
            case 'instagram':
                return <Instagram className="w-5 h-5 text-pink-600" />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:via-purple-900 dark:to-violet-900 p-6 transition-colors duration-200">
            <div className="max-w-6xl mx-auto overflow-hidden transition-all duration-300 shadow-xl transform bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <Wand2 className="w-12 h-12 text-purple-600 dark:text-purple-400 animate-pulse" />
                            <h1 className="text-4xl font-bold">
                                <span className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">AI</span>
                                <span className="mx-2 text-gray-800 dark:text-gray-100">Content</span>
                                <span className="bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">Generator</span>
                            </h1>
                        </div>
                        <button
                            onClick={handleToggleTheme}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                            aria-label="Toggle theme"
                        >
                            {darkMode ? (
                                <Sun className="w-6 h-6 text-yellow-400" />
                            ) : (
                                <Moon className="w-6 h-6 text-gray-600" />
                            )}
                        </button>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="flex-1 max-w-[200px] h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                            >
                                <option value="twitter">Twitter</option>
                                <option value="linkedin">LinkedIn</option>
                                <option value="instagram">Instagram</option>
                            </select>

                            <ImageSearch
                                onClick={handleImageSearchToggle}
                                showImageSearch={showImageSearch}
                            />
                        </div>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., Write a post about artificial intelligence..."
                            className="w-full min-h-[150px] p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 resize-y placeholder-gray-400 dark:placeholder-gray-500"
                        />

                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !prompt}
                                className="h-10 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4" />
                                )}
                                {loading ? 'Generating...' : 'Generate'}
                            </button>
                        </div>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-4 rounded-lg animate-fadeIn">
                                {error}
                            </div>
                        )}

                        {generatedContent && (
                            <div className="flex flex-col md:flex-row gap-4 animate-fadeIn">
                                {selectedImage && (
                                    <div className="relative w-full max-w-[300px] h-[400px] border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-700">
                                        <img
                                            src={selectedImage.urls.regular}
                                            alt={selectedImage.alt_description || 'Selected image'}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => setSelectedImage(null)}
                                            className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                                        >
                                            <X className="w-4 h-4 text-gray-600 dark:text-gray-200" />
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
                                            <a
                                                href={selectedImage.user.links.html}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-white flex items-center justify-end gap-1 hover:underline"
                                            >
                                                Photo by {selectedImage.user.name}
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-medium text-gray-800 dark:text-gray-200">Generated Content</span>
                                        <div className="flex items-center gap-2">
                                            {getPlatformIcon(platform)}
                                            <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">{platform}</span>
                                        </div>
                                    </div>

                                    <div className="overflow-y-auto max-h-[400px] p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                                        <p className="text-gray-800 dark:text-gray-200">{generatedContent}</p>
                                    </div>

                                    <button
                                        onClick={handleCopy}
                                        className="w-full h-12 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 flex items-center justify-center gap-2 group text-gray-800 dark:text-gray-200"
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
                                    <input
                                        ref={imageSearchRef}
                                        type="text"
                                        value={imageSearch}
                                        onChange={(e) => setImageSearch(e.target.value)}
                                        onKeyDown={handleImageSearch}
                                        placeholder="Search for images..."
                                        className="flex-1 h-12 px-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 placeholder-gray-400 dark:placeholder-gray-500"
                                        />
                                    <button
                                        onClick={handleInitialSearch}
                                        disabled={imageLoading || !imageSearch.trim()}
                                        className="px-8 h-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer transition-all duration-200 group ${
                                                        selectedImage?.id === image.id ? 'ring-4 ring-purple-600' : ''
                                                    }`}
                                                    onClick={() => setSelectedImage(selectedImage?.id === image.id ? null : image)}
                                                >
                                                    <img
                                                        src={image.urls.small}
                                                        alt={image.alt_description || 'Search result'}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                    {selectedImage?.id === image.id && (
                                                        <div className="absolute inset-0 bg-purple-600/20 flex items-center justify-center">
                                                            <div className="bg-white rounded-full p-1">
                                                                <ImageIcon className="w-6 h-6 text-purple-600" />
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                                        <a
                                                            href={image.user.links.html}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-white flex items-center justify-end gap-1 hover:underline"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            Photo by {image.user.name}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {hasMore && (
                                            <div className="flex justify-center mt-8">
                                                <button
                                                    onClick={handleLoadMore}
                                                    disabled={imageLoading}
                                                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 font-medium text-gray-700 dark:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                                                >
                                                    {imageLoading ? (
                                                        <div className="w-5 h-5 border-2 border-purple-600 dark:border-purple-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Plus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                            <span>Load More Images</span>
                                                        </>
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
    );
};

export default ContentGenerator;