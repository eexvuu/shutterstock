"use server";

import scrapeMetadata from "shutterstock-scraping-metadata";

export async function fetchMetadataAction(url: string): Promise<any> {
  if (!url.startsWith("https://www.shutterstock.com/")) {
    throw new Error(
      'Invalid Shutterstock URL. It should start with "https://www.shutterstock.com/".'
    );
  }
  try {
    const metadata = await scrapeMetadata(url);
    return metadata;
  } catch (error: any) {
    console.error("Server action error scraping metadata:", error);
    // It's often better to throw a new error with a generic message or a specific error object
    // that doesn't leak too much detail to the client.
    throw new Error("Failed to fetch metadata on the server.");
  }
}
