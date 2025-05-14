/**
 * Tavily search tool for the agent system
 * Handles searching for medical information using the Tavily API
 */

/**
 * Execute a search query using the Tavily API
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @param {boolean} options.includeRawContent - Whether to include the raw content in the response
 * @param {boolean} options.includeImages - Whether to include images in the response
 * @param {string} options.searchDepth - The search depth (basic or comprehensive)
 * @param {number} options.maxResults - The maximum number of results to return
 * @param {Array<string>} options.includeDomains - Domains to include in the search
 * @returns {Promise<Object>} - The search results
 */
export async function tavilySearch(query, options = {}) {
  console.log(`Tavily search for query: ${query}`);
  
  // Default trusted medical domains for healthcare searches
  const defaultMedicalDomains = [
    "cdc.gov", 
    "medlineplus.gov", 
    "nih.gov", 
    "mayoclinic.org", 
    "webmd.com", 
    "familydoctor.org", 
    "health.harvard.edu", 
    "drugs.com", 
    "merckmanuals.com"
  ];
  
  // If we don't have a Tavily API key, we'll perform a mock search
  if (!process.env.TAVILY_API_KEY) {
    console.log('No Tavily API key found. Returning mock search results.');
    return mockSearch(query);
  }
  
  try {
    const searchOptions = {
      api_key: process.env.TAVILY_API_KEY,
      query,
      search_depth: options.searchDepth || "comprehensive",
      include_raw_content: options.includeRawContent || false,
      include_domains: options.includeDomains || defaultMedicalDomains,
      exclude_domains: options.excludeDomains || [],
      max_results: options.maxResults || 5,
      include_images: options.includeImages || false,
    };
    
    console.log(`Using include domains: ${searchOptions.include_domains.join(', ')}`);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchOptions),
    });
    
    if (!response.ok) {
      console.error(`Tavily API returned status: ${response.status}. Falling back to mock results.`);
      return mockSearch(query);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching with Tavily:', error);
    // Fall back to mock search if the API fails
    console.log('Using mock search results instead');
    return mockSearch(query);
  }
}

/**
 * Provide mock search results when the Tavily API is not available
 * @param {string} query - The search query
 * @returns {Object} - Mock search results
 */
function mockSearch(query) {
  // Generate dynamic search results based on the query
  const results = [
    {
      title: `Information about: ${query}`,
      url: `https://example.com/search?q=${encodeURIComponent(query)}`,
      content: `This is simulated search content for "${query}". In a real environment, this would contain relevant information from trusted medical sources about ${query}.`,
      score: 0.95
    },
    {
      title: `Medical advice for: ${query}`,
      url: `https://example.com/medical?q=${encodeURIComponent(query)}`,
      content: `Medical professionals typically recommend consulting with a healthcare provider about "${query}". This simulated result would contain general medical information related to your query.`,
      score: 0.85
    },
    {
      title: `Latest research on: ${query}`,
      url: `https://example.com/research?q=${encodeURIComponent(query)}`,
      content: `Recent studies related to "${query}" would be shown here. This is a simulated result that would normally contain summaries of relevant medical research.`,
      score: 0.80
    }
  ];
  
  return {
    results,
    query,
    search_depth: "mock",
    max_results: results.length,
    _mock: true
  };
} 