import { Pinecone } from "@pinecone-database/pinecone";

// Singleton implementation to avoid exhausting connections in dev
declare global {
  // eslint-disable-next-line no-var
  var _pineconeClient: Pinecone | undefined;
}

let pineconeClient: Pinecone;

if (process.env.NODE_ENV === "development") {
  if (!global._pineconeClient) {
    global._pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }
  pineconeClient = global._pineconeClient;
} else {
  pineconeClient = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY || "",
  });
}

/**
 * Returns the configured Pinecone index for EdAI LMS.
 * Index configuration must be: dimension: 1536, metric: cosine.
 */
export function getPineconeIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME || "edai-lms-index";
  return pineconeClient.index(indexName);
}

export default pineconeClient;
