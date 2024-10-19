import axios from 'axios';

interface WebsiteContent {
  url: string;
  content: string;
}

export async function fetchWebsiteContent(url: string): Promise<WebsiteContent> {
  const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;

  try {
    const response = await axios.get(jinaUrl, {
      responseType: 'text'
    });

    return {
      url: url,
      content: response.data
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Error fetching content for ${url}:`, error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
    } else {
      console.error(`Unexpected error for ${url}:`, error);
    }
    throw error;
  }
}

// Example usage
async function main() {
  try {
    const result = await fetchWebsiteContent('https://meditatewithtucker.com/');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();