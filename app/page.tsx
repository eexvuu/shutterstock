"use client";

import { useState, useEffect } from "react";
import { fetchMetadataAction } from "./actions";
import SearchForm from "./components/SearchForm";
import MetadataDisplay from "./components/MetadataDisplay";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

const MAX_HISTORY_ITEMS = 10;

export default function ShutterstockMetaPage() {
  const [url, setUrl] = useState("");
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showHistoryPopover, setShowHistoryPopover] = useState(false);

  useEffect(() => {
    const storedHistory = localStorage.getItem("shutterstockSearchHistory");
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        if (Array.isArray(parsedHistory)) {
          setSearchHistory(parsedHistory);
        }
      } catch (e) {
        console.error("Error parsing search history from localStorage", e);
        setSearchHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "shutterstockSearchHistory",
      JSON.stringify(searchHistory.slice(0, MAX_HISTORY_ITEMS))
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
    setShowHistoryPopover(false);
    const event = { preventDefault: () => {} } as React.FormEvent;
    handleSubmit(event, historyUrl);
  };

  const removeHistoryItem = (urlToRemove: string) => {
    setSearchHistory((prevHistory) =>
      prevHistory.filter((item) => item !== urlToRemove)
    );
  };

  const clearHistory = () => {
    setSearchHistory([]);
    setShowHistoryPopover(false);
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
      if (!forceUrl) {
        addUrlToHistory(currentUrlToFetch);
      }
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

  useEffect(() => {
    const currentUrl = new URL(window.location.href);
    const urlParam = currentUrl.searchParams.get("url");

    const fetchDataForParam = async (fetchUrl: string) => {
      setIsLoading(true);
      setError(null);
      setMetadata(null);
      try {
        const data = await fetchMetadataAction(fetchUrl);
        setMetadata(data);
      } catch (err: any) {
        console.error("Error scraping metadata from URL param:", err);
        setError(
          err.message ||
            "Failed to scrape metadata from URL. Please check the URL and try again."
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (urlParam && urlParam !== url) {
      setUrl(urlParam);
      fetchDataForParam(urlParam);
    }

    const handlePopState = (event: PopStateEvent) => {
      const poppedUrl = new URL(window.location.href);
      const poppedUrlParam = poppedUrl.searchParams.get("url");
      if (poppedUrlParam) {
        if (poppedUrlParam !== url) {
          setUrl(poppedUrlParam);
          fetchDataForParam(poppedUrlParam);
        }
      } else {
        setUrl("");
        setMetadata(null);
        setError(null);
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-4 md:p-8 bg-slate-950 text-slate-200">
      <div className="w-full max-w-3xl space-y-10">
        <header className="text-center pt-8">
          <h1
            className="text-4xl md:text-5xl font-extrabold 
                                   bg-clip-text text-transparent 
                                   bg-gradient-to-r from-purple-500 via-cyan-400 to-sky-500 
                                   pb-2"
          >
            Shutterstock Metadata Scraper
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Instantly fetch and analyze metadata from any Shutterstock URL.
          </p>
        </header>

        <SearchForm
          url={url}
          setUrl={setUrl}
          isLoading={isLoading}
          handleSubmit={handleSubmit}
          searchHistory={searchHistory}
          showHistory={showHistoryPopover}
          setShowHistory={setShowHistoryPopover}
          handleHistoryItemClick={handleHistoryItemClick}
          clearHistory={clearHistory}
          removeHistoryItem={removeHistoryItem}
        />

        {error && (
          <Alert
            variant="destructive"
            className="bg-red-900/30 border-red-700 text-red-200 shadow-lg"
          >
            <AlertCircle className="h-5 w-5 text-red-400" />
            <AlertTitle className="font-semibold text-red-300">
              Scraping Error
            </AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <div className="mt-6 flex flex-col items-center justify-center text-center py-12">
            <Loader2 className="h-16 w-16 animate-spin text-cyan-400 mb-4" />
            <p className="text-slate-300 text-lg">
              Initializing HyperScrape Engine...
            </p>
          </div>
        )}

        {!isLoading && metadata && <MetadataDisplay metadata={metadata} />}
      </div>
    </main>
  );
}
