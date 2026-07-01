const API = (() => {
  const DDG_BASE = 'https://api.duckduckgo.com/';
  const WIKI_BASE = 'https://es.wikipedia.org/api/rest_v1/page/summary/';
  const WIKI_SEARCH = 'https://es.wikipedia.org/w/api.php';

  let cache = new Map();
  const CACHE_TTL = 1000 * 60 * 20;
  const MAX_CACHE = 200;

  function getCached(key) {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.time < CACHE_TTL) return entry.data;
    cache.delete(key);
    return null;
  }

  function setCache(key, data) {
    cache.set(key, { data, time: Date.now() });
    if (cache.size > MAX_CACHE) {
      const oldest = cache.keys().next().value;
      cache.delete(oldest);
    }
  }

  async function fetchWithTimeout(url, timeout = 8000, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'X0GPT/5.0 (Educational AI Assistant)' }
        });
        clearTimeout(timer);
        if (response.ok) return response;
        if (response.status === 429 && attempt < retries) {
          await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
          continue;
        }
        return response;
      } catch (e) {
        clearTimeout(timer);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 800 * Math.pow(2, attempt)));
          continue;
        }
        throw e;
      }
    }
  }

  async function searchDuckDuckGo(query) {
    const cached = getCached(`ddg:${query}`);
    if (cached) return cached;

    try {
      const url = `${DDG_BASE}?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
      const response = await fetchWithTimeout(url);
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('json')) {
        return { source: 'duckduckgo', abstract: '', answer: '', relatedTopics: [], definitions: [], confidence: 0, error: 'Non-JSON response' };
      }
      const data = await response.json();

      const results = {
        source: 'duckduckgo',
        abstract: data.AbstractText || '',
        abstractURL: data.AbstractURL || '',
        abstractSource: data.AbstractSource || '',
        answer: data.Answer || '',
        answerType: data.AnswerType || '',
        heading: data.Heading || '',
        image: data.Image || '',
        relatedTopics: [],
        definitions: [],
        infobox: null,
        confidence: 0
      };

      if (data.Infobox && data.Infobox.content) {
        results.infobox = {
          title: data.Infobox.heading || data.Heading,
          fields: {}
        };
        for (const field of data.Infobox.content) {
          if (field.label && field.value) {
            results.infobox.fields[field.label] = field.value;
          }
        }
      }

      if (data.Definitions && Array.isArray(data.Definitions)) {
        for (const def of data.Definitions.slice(0, 3)) {
          if (def.Text) {
            results.definitions.push({ text: def.Text, source: def.Source || '', url: def.FirstURL || '' });
          }
        }
      }

      const seenTexts = new Set();
      if (data.RelatedTopics && Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics.slice(0, 12)) {
          if (topic.Text && !seenTexts.has(topic.Text)) {
            seenTexts.add(topic.Text);
            results.relatedTopics.push({ text: topic.Text, url: topic.FirstURL || '', icon: topic.Icon?.URL || '' });
          }
          if (topic.Topics && Array.isArray(topic.Topics)) {
            for (const sub of topic.Topics.slice(0, 4)) {
              if (sub.Text && !seenTexts.has(sub.Text)) {
                seenTexts.add(sub.Text);
                results.relatedTopics.push({ text: sub.Text, url: sub.FirstURL || '', icon: sub.Icon?.URL || '' });
              }
            }
          }
        }
      }

      results.confidence = calculateDDGConfidence(results);
      setCache(`ddg:${query}`, results);
      return results;

    } catch (error) {
      console.warn('DuckDuckGo API error:', error.message);
      return { source: 'duckduckgo', abstract: '', answer: '', relatedTopics: [], definitions: [], confidence: 0, error: error.message };
    }
  }

  function calculateDDGConfidence(results) {
    let score = 0;
    if (results.answer) score += 0.4;
    if (results.abstract && results.abstract.length > 50) score += 0.2;
    if (results.abstract && results.abstract.length > 200) score += 0.1;
    if (results.abstract && results.abstract.length > 500) score += 0.05;
    if (results.heading) score += 0.1;
    if (results.relatedTopics.length > 0) score += 0.1;
    if (results.definitions.length > 0) score += 0.05;
    if (results.infobox) score += 0.05;
    return Math.min(score, 1);
  }

  async function searchWikipedia(query) {
    const cached = getCached(`wiki:${query}`);
    if (cached) return cached;

    try {
      const url = `${WIKI_BASE}${encodeURIComponent(query)}`;
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        const searchResult = await searchWikipediaBySearch(query);
        if (searchResult) {
          setCache(`wiki:${query}`, searchResult);
          return searchResult;
        }
        return { source: 'wikipedia', title: '', extract: '', url: '', confidence: 0 };
      }

      const data = await response.json();
      const result = {
        source: 'wikipedia',
        title: data.title || '',
        extract: data.extract || '',
        url: data.content_urls?.desktop?.page || '',
        thumbnail: data.thumbnail?.source || '',
        description: data.description || '',
        confidence: 0.85
      };

      setCache(`wiki:${query}`, result);
      return result;

    } catch (error) {
      console.warn('Wikipedia API error:', error.message);
      return { source: 'wikipedia', title: '', extract: '', url: '', confidence: 0, error: error.message };
    }
  }

  async function searchWikipediaBySearch(query) {
    try {
      const params = new URLSearchParams({
        action: 'query', list: 'search', srsearch: query, srlimit: '3', format: 'json', origin: '*'
      });
      const response = await fetchWithTimeout(`${WIKI_SEARCH}?${params}`);
      const data = await response.json();

      if (data.query?.search?.length > 0) {
        // Fetch top 2 results in parallel
        const results = data.query.search.slice(0, 2);
        const summaries = await Promise.allSettled(
          results.map(r => fetchWithTimeout(`${WIKI_BASE}${encodeURIComponent(r.title)}`).then(res => res.ok ? res.json() : null))
        );
        for (const summary of summaries) {
          if (summary.status === 'fulfilled' && summary.value?.extract) {
            return {
              source: 'wikipedia',
              title: summary.value.title || '',
              extract: summary.value.extract || '',
              url: summary.value.content_urls?.desktop?.page || '',
              thumbnail: summary.value.thumbnail?.source || '',
              description: summary.value.description || '',
              confidence: 0.75
            };
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  function combineResults(ddgResults, wikiResults) {
    const combined = {
      sources: [],
      answer: '',
      details: '',
      confidence: 0,
      urls: [],
      infobox: null,
      definitions: []
    };

    if (ddgResults.answer) {
      combined.answer = ddgResults.answer;
      combined.confidence = Math.max(combined.confidence, ddgResults.confidence);
    } else if (wikiResults.extract) {
      combined.answer = wikiResults.extract.length > 1500
        ? wikiResults.extract.substring(0, 1500) + '...'
        : wikiResults.extract;
      combined.confidence = Math.max(combined.confidence, wikiResults.confidence);
      combined.sources.push(`Wikipedia: ${wikiResults.title}`);
      if (wikiResults.url) combined.urls.push(wikiResults.url);
    } else if (ddgResults.abstract) {
      combined.answer = ddgResults.abstract;
      combined.confidence = Math.max(combined.confidence, ddgResults.confidence * 0.8);
    }

    if (wikiResults.extract && combined.answer && !combined.answer.includes(wikiResults.extract.substring(0, 50))) {
      const excerpt = wikiResults.extract.length > 800
        ? wikiResults.extract.substring(0, 800) + '...'
        : wikiResults.extract;
      combined.details = excerpt;
    }

    if (ddgResults.heading) combined.sources.push(`DuckDuckGo: ${ddgResults.heading}`);
    if (ddgResults.abstractURL) combined.urls.push(ddgResults.abstractURL);
    if (ddgResults.definitions?.length > 0) combined.definitions = ddgResults.definitions;

    let topicText = '';
    const answerLower = combined.answer.toLowerCase();
    for (const topic of ddgResults.relatedTopics.slice(0, 4)) {
      if (topic.text && !answerLower.includes(topic.text.substring(0, 40).toLowerCase())) {
        topicText += '\n• ' + topic.text;
      }
    }
    if (topicText && !combined.details) combined.details = topicText.trim();

    if (ddgResults.infobox) combined.infobox = ddgResults.infobox;
    if (combined.sources.length > 1) combined.confidence = Math.min(combined.confidence * 1.1, 1);

    return combined;
  }

  async function search(query) {
    const cacheKey = `search:${query.toLowerCase()}`;
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const [ddgResults, wikiResults] = await Promise.allSettled([
      searchDuckDuckGo(query),
      searchWikipedia(query)
    ]);

    const ddg = ddgResults.status === 'fulfilled' ? ddgResults.value : { abstract: '', answer: '', relatedTopics: [], definitions: [], confidence: 0 };
    const wiki = wikiResults.status === 'fulfilled' ? wikiResults.value : { extract: '', confidence: 0 };

    const combined = combineResults(ddg, wiki);
    setCache(cacheKey, combined);
    return combined;
  }

  async function searchWithAlternatives(query) {
    const primary = await search(query);
    if (primary.confidence > 0.5) return primary;

    const keywords = NLP.extractKeywords(query);
    if (keywords.length > 2) {
      const altQuery = keywords.slice(0, 3).join(' ');
      const alternative = await search(altQuery);
      if (alternative.confidence > primary.confidence) return alternative;
    }

    const expansions = NLP.expandQuery(query);
    if (expansions.length > 0 && keywords.length > 0) {
      const expQuery = expansions[0] + ' ' + keywords.slice(0, 2).join(' ');
      const expanded = await search(expQuery);
      if (expanded.confidence > primary.confidence) return expanded;
    }

    const simplified = query
      .replace(/\b(por favor|porfa|plis|pls)\b/gi, '')
      .replace(/\b(que|como|donde|cuando|quien|por que|cuanto|cual)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (simplified.length > 3 && simplified !== query) {
      const simpleResult = await search(simplified);
      if (simpleResult.confidence > primary.confidence) return simpleResult;
    }

    return primary;
  }

  function formatAnswer(web) {
    if (!web || web.confidence < 0.15) return null;

    let out = '';

    if (web.answer) {
      out += web.answer;
    } else if (web.details) {
      out += web.details.length > 1200 ? web.details.substring(0, 1200) + '...' : web.details;
    }

    if (!out && web.definitions?.length > 0) {
      out = web.definitions.map(d => d.text).join('\n\n');
    }

    if (web.infobox && web.infobox.fields && Object.keys(web.infobox.fields).length > 0) {
      let infoText = '\n\n**Información destacada:**\n';
      for (const [key, value] of Object.entries(web.infobox.fields).slice(0, 6)) {
        infoText += `• **${key}**: ${value}\n`;
      }
      if (out.length + infoText.length < 1800) out += infoText;
    }

    if (web.sources?.length > 0) {
      out += '\n\n**Fuentes:** ' + web.sources.join(' | ');
    }

    return out.trim() || null;
  }

  function isOnline() { return navigator.onLine; }
  function clearCache() { cache.clear(); }
  function getCacheStats() { return { size: cache.size, keys: Array.from(cache.keys()) }; }

  return {
    search,
    searchDuckDuckGo,
    searchWikipedia,
    searchWithAlternatives,
    combineResults,
    formatAnswer,
    isOnline,
    clearCache,
    getCacheStats
  };
})();

if (typeof module !== 'undefined') module.exports = API;
