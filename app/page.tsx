"use client";

import { useState, useEffect } from "react";
import { fetchMetadataAction } from "./actions";
import { Copy, Check, UserCircle, History, X } from "lucide-react";

const MAX_HISTORY_ITEMS = 10;

export default function ShutterstockMetaPage() {
    const [url, setUrl] = useState("");
    const [metadata, setMetadata] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [keywordsCopied, setKeywordsCopied] = useState(false);
    const [descriptionCopied, setDescriptionCopied] = useState(false);
    const [categoriesCopied, setCategoriesCopied] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    // Load search history from local storage on mount
    useEffect(() => {
        const storedHistory = localStorage.getItem("shutterstockSearchHistory");
        if (storedHistory) {
            setSearchHistory(JSON.parse(storedHistory));
        }
    }, []);

    // Save search history to local storage when it changes
    useEffect(() => {
        localStorage.setItem(
            "shutterstockSearchHistory",
            JSON.stringify(searchHistory)
        );
    }, [searchHistory]);

    const addUrlToHistory = (newUrl: string) => {
        setSearchHistory((prevHistory) => {
            const updatedHistory = [
                newUrl,
                ...prevHistory.filter((item) => item !== newUrl),
            ];
            return updatedHistory.slice(0, MAX_HISTORY_ITEMS);
        });
    };

    const handleHistoryItemClick = (historyUrl: string) => {
        setUrl(historyUrl);
        setShowHistory(false);
        // Trigger submission for the selected history URL
        // We need to ensure handleSubmit is called or its logic is replicated here
        // For now, let's assume user will click the "Get Metadata" button after URL is set
        // Or, we can directly trigger the fetch
        const event = { preventDefault: () => {} } as React.FormEvent;
        handleSubmit(event, historyUrl); // Pass historyUrl to ensure it's used
    };

    const removeHistoryItem = (urlToRemove: string) => {
        setSearchHistory((prevHistory) =>
            prevHistory.filter((item) => item !== urlToRemove)
        );
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem("shutterstockSearchHistory");
        setShowHistory(false);
    };

    const handleSubmit = async (event: React.FormEvent, forceUrl?: string) => {
        event.preventDefault();
        const currentUrlToFetch = forceUrl || url;
        if (!currentUrlToFetch) {
            setError("Please enter a Shutterstock URL.");
            setMetadata(null);
            return;
        }

        setIsLoading(true);
        setError(null);
        setMetadata(null);

        try {
            const data = await fetchMetadataAction(currentUrlToFetch);
            setMetadata(data);
            addUrlToHistory(currentUrlToFetch); // Add to history on success
            const newPath = `/?url=${encodeURIComponent(currentUrlToFetch)}`;
            window.history.pushState({ path: newPath }, "", newPath);
        } catch (err: any) {
            console.error("Error scraping metadata:", err);
            setError(
                err.message ||
                    "Failed to scrape metadata. Please check the URL and try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to handle URL query parameter on initial load and history changes
    useEffect(() => {
        const currentUrl = new URL(window.location.href);
        const urlParam = currentUrl.searchParams.get("url");

        if (urlParam && urlParam !== url) {
            setUrl(urlParam);
            // Automatically submit if URL param exists
            // Create a synthetic event or call a modified submit logic
            // For simplicity, directly calling fetch logic here
            // Ensure this doesn't cause infinite loops if fetchMetadataAction also updates URL

            // We need a way to trigger the fetch without a form event
            // and avoid re-triggering if url state is already correct.
            const fetchDataForParam = async (fetchUrl: string) => {
                setIsLoading(true);
                setError(null);
                setMetadata(null);
                try {
                    const data = await fetchMetadataAction(fetchUrl);
                    setMetadata(data);
                } catch (err: any) {
                    console.error(
                        "Error scraping metadata from URL param:",
                        err
                    );
                    setError(
                        err.message ||
                            "Failed to scrape metadata from URL. Please check the URL and try again."
                    );
                } finally {
                    setIsLoading(false);
                }
            };
            fetchDataForParam(urlParam);
        }

        const handlePopState = (event: PopStateEvent) => {
            const poppedUrl = new URL(window.location.href);
            const poppedUrlParam = poppedUrl.searchParams.get("url");
            if (poppedUrlParam) {
                setUrl(poppedUrlParam);
                // Optionally, re-fetch data for the popped URL.
                // This depends on whether you want back/forward to re-trigger search.
                // For now, just updating the input field.
                // If re-fetch is needed, call fetchDataForParam(poppedUrlParam)
                const fetchDataForParam = async (fetchUrl: string) => {
                    setIsLoading(true);
                    setError(null);
                    setMetadata(null);
                    try {
                        const data = await fetchMetadataAction(fetchUrl);
                        setMetadata(data);
                    } catch (err: any) {
                        console.error(
                            "Error scraping metadata from URL param:",
                            err
                        );
                        setError(
                            err.message ||
                                "Failed to scrape metadata from URL. Please check the URL and try again."
                        );
                    } finally {
                        setIsLoading(false);
                    }
                };
                fetchDataForParam(poppedUrlParam);
            } else {
                // If URL param is removed (e.g. navigating back to root)
                setUrl("");
                setMetadata(null);
                setError(null);
            }
        };

        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("popstate", handlePopState);
        };
    }, []); // Added 'url' to dependency array if direct re-fetch on url change is desired
    // For now, an empty array means it only runs on mount and unmount for popstate.
    // The initial load logic handles the first URL param.

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gray-900 text-white">
            <div className="w-full max-w-2xl">
                <h1 className="text-4xl font-bold mb-8 text-center text-blue-400">
                    Shutterstock Metadata Scraper
                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="mb-8 p-6 bg-gray-800 rounded-lg shadow-xl relative"
                >
                    <div className="mb-6">
                        <label
                            htmlFor="shutterstockUrl"
                            className="block mb-2 text-sm font-medium text-gray-300"
                        >
                            Shutterstock Image or Video URL:
                        </label>
                        <input
                            type="text"
                            id="shutterstockUrl"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="e.g., https://www.shutterstock.com/image-photo/..."
                            className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-3 placeholder-gray-400"
                            required
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-grow text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-800 font-medium rounded-lg text-sm px-5 py-3 text-center disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors duration-150"
                        >
                            {isLoading ? "Scraping..." : "Get Metadata"}
                        </button>
                        {searchHistory.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowHistory(!showHistory)}
                                title="Toggle search history"
                                className="p-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                            >
                                <History size={20} />
                            </button>
                        )}
                    </div>
                    {showHistory && searchHistory.length > 0 && (
                        <div className="absolute z-10 top-full mt-2 w-full bg-gray-700 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                            <div className="p-2 flex justify-between items-center border-b border-gray-600">
                                <h3 className="text-sm font-semibold text-gray-300">
                                    Search History
                                </h3>
                                <button
                                    onClick={clearHistory}
                                    className="text-xs text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600 transition-colors"
                                    title="Clear all history"
                                >
                                    Clear All
                                </button>
                            </div>
                            <ul>
                                {searchHistory.map((historyItem, index) => (
                                    <li
                                        key={index}
                                        className="flex justify-between items-center px-3 py-2 hover:bg-gray-600 cursor-pointer text-sm text-gray-300 transition-colors group"
                                        onClick={() =>
                                            handleHistoryItemClick(historyItem)
                                        }
                                    >
                                        <span
                                            className="truncate group-hover:text-blue-300"
                                            title={historyItem}
                                        >
                                            {historyItem}
                                        </span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent li onClick from firing
                                                removeHistoryItem(historyItem);
                                            }}
                                            className="ml-2 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-gray-500"
                                            title="Remove from history"
                                        >
                                            <X size={14} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {searchHistory.length === 0 && (
                                <p className="p-3 text-center text-sm text-gray-400">
                                    No history yet.
                                </p>
                            )}
                        </div>
                    )}
                </form>

                {error && (
                    <div
                        className="mt-6 p-4 bg-red-800 text-red-100 border border-red-700 rounded-lg shadow-md"
                        role="alert"
                    >
                        <strong className="font-bold">Error:</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                {isLoading && (
                    <div className="mt-6 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-400 mx-auto"></div>
                        <p className="mt-3 text-gray-300">
                            Fetching metadata, please wait...
                        </p>
                    </div>
                )}

                {metadata && !isLoading && (
                    <div className="mt-8 p-6 bg-gray-800 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-semibold mb-6 text-blue-300">
                            Scraped Metadata:
                        </h2>
                        <div className="space-y-4">
                            {metadata.preview && (
                                <div>
                                    <strong className="text-blue-400">
                                        Preview:
                                    </strong>
                                    <div className="mt-1 relative bg-gray-700 p-3 rounded-md flex justify-center">
                                        <img
                                            src={metadata.preview}
                                            alt="Asset preview"
                                            className="max-w-full h-auto max-h-96 rounded"
                                        />
                                    </div>
                                </div>
                            )}
                            {metadata.type && (
                                <div>
                                    <strong className="text-blue-400">
                                        Type:
                                    </strong>
                                    <div className="mt-1 bg-gray-700 p-3 rounded-md">
                                        <p className="text-gray-300 capitalize">
                                            {metadata.type}
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div>
                                <strong className="text-blue-400">
                                    Contributor:
                                </strong>
                                {metadata.contributor ? (
                                    <a
                                        href={`https://www.shutterstock.com/g/${encodeURIComponent(
                                            metadata.contributor
                                                .toLowerCase()
                                                .replace(/\s+/g, "-")
                                        )}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-1 flex items-center gap-2 text-gray-300 bg-gray-700 p-3 rounded-md hover:bg-gray-600 transition-colors group"
                                    >
                                        <UserCircle
                                            size={20}
                                            className="text-blue-400 group-hover:text-blue-300 transition-colors flex-shrink-0"
                                        />
                                        <span className="group-hover:text-blue-300 group-hover:underline transition-colors">
                                            {metadata.contributor}
                                        </span>
                                    </a>
                                ) : (
                                    <p className="mt-1 flex items-center gap-2 text-gray-500 bg-gray-700 p-3 rounded-md">
                                        <UserCircle
                                            size={20}
                                            className="flex-shrink-0"
                                        />
                                        <span>N/A</span>
                                    </p>
                                )}
                            </div>
                            <div>
                                <strong className="text-blue-400">
                                    Description:
                                </strong>
                                <div className="mt-1 relative bg-gray-700 p-3 rounded-md">
                                    <p className="text-gray-300 whitespace-pre-wrap pr-12">
                                        {metadata.description}
                                    </p>
                                    {metadata.description && (
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    metadata.description
                                                );
                                                setDescriptionCopied(true);
                                                setTimeout(
                                                    () =>
                                                        setDescriptionCopied(
                                                            false
                                                        ),
                                                    2000
                                                );
                                            }}
                                            title={
                                                descriptionCopied
                                                    ? "Copied"
                                                    : "Copy description"
                                            }
                                            className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                                        >
                                            {descriptionCopied ? (
                                                <Check size={16} />
                                            ) : (
                                                <Copy size={16} />
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                            {metadata.keywords &&
                                metadata.keywords.length > 0 && (
                                    <div>
                                        <strong className="text-blue-400">
                                            Keywords:
                                        </strong>
                                        <div className="mt-1 relative bg-gray-700 p-3 rounded-md">
                                            <div className="flex flex-wrap gap-2 pr-12">
                                                {metadata.keywords.map(
                                                    (keyword: string) => (
                                                        <span
                                                            key={keyword}
                                                            className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {keyword}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                            {metadata.keywords &&
                                                metadata.keywords.length >
                                                    0 && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                metadata.keywords.join(
                                                                    ", "
                                                                )
                                                            );
                                                            setKeywordsCopied(
                                                                true
                                                            );
                                                            setTimeout(
                                                                () =>
                                                                    setKeywordsCopied(
                                                                        false
                                                                    ),
                                                                2000
                                                            );
                                                        }}
                                                        title={
                                                            keywordsCopied
                                                                ? "Copied"
                                                                : "Copy keywords"
                                                        }
                                                        className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                                                    >
                                                        {keywordsCopied ? (
                                                            <Check size={16} />
                                                        ) : (
                                                            <Copy size={16} />
                                                        )}
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                )}
                            {metadata.categories &&
                                metadata.categories.length > 0 && (
                                    <div>
                                        <strong className="text-blue-400">
                                            Categories:
                                        </strong>
                                        <div className="mt-1 relative bg-gray-700 p-3 rounded-md">
                                            <div className="flex flex-wrap gap-2 pr-12">
                                                {metadata.categories.map(
                                                    (category: string) => (
                                                        <span
                                                            key={category}
                                                            className="bg-teal-600 text-teal-100 px-3 py-1 rounded-full text-sm"
                                                        >
                                                            {category}
                                                        </span>
                                                    )
                                                )}
                                            </div>
                                            {metadata.categories &&
                                                metadata.categories.length >
                                                    0 && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(
                                                                metadata.categories.join(
                                                                    ", "
                                                                )
                                                            );
                                                            setCategoriesCopied(
                                                                true
                                                            );
                                                            setTimeout(
                                                                () =>
                                                                    setCategoriesCopied(
                                                                        false
                                                                    ),
                                                                2000
                                                            );
                                                        }}
                                                        title={
                                                            categoriesCopied
                                                                ? "Copied"
                                                                : "Copy categories"
                                                        }
                                                        className="absolute top-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md text-sm transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                                                    >
                                                        {categoriesCopied ? (
                                                            <Check size={16} />
                                                        ) : (
                                                            <Copy size={16} />
                                                        )}
                                                    </button>
                                                )}
                                        </div>
                                    </div>
                                )}
                            {/* Fallback for any other metadata properties not explicitly handled */}
                            {/* <div>
                                <strong className="text-blue-400">
                                    Full Metadata:
                                </strong>
                                <pre className="mt-1 bg-gray-900 p-4 rounded-md text-sm text-gray-200 overflow-x-auto custom-scrollbar">
                                    {JSON.stringify(metadata, null, 2)}
                                </pre>
                            </div> */}
                        </div>
                    </div>
                )}
            </div>
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                    height: 8px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #2d3748; /* bg-gray-800 */
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #4a5568; /* bg-gray-600 */
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #718096; /* bg-gray-500 */
                }
            `}</style>
        </main>
    );
}
