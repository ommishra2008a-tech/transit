/**
 * Simple Levenshtein distance based fuzzy search utility to handle spelling mistakes
 */
export function fuzzySearch(query, items, keys) {
  if (!query) return items;

  const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const searchStr = normalize(query);

  if (searchStr.length === 0) return items;

  return items.filter(item => {
    return keys.some(key => {
      const val = item[key];
      if (!val) return false;
      
      const targetStr = normalize(String(val));
      
      // Exact substring match
      if (targetStr.includes(searchStr)) return true;

      // Basic fuzzy matching: check if characters of search query appear in target in order
      let searchIdx = 0;
      let targetIdx = 0;
      let matchedChars = 0;

      while (searchIdx < searchStr.length && targetIdx < targetStr.length) {
        if (searchStr[searchIdx] === targetStr[targetIdx]) {
          matchedChars++;
          searchIdx++;
        }
        targetIdx++;
      }

      // Allow 1-2 typos based on length
      const matchThreshold = searchStr.length > 5 ? searchStr.length - 2 : searchStr.length - 1;
      if (matchedChars >= matchThreshold && matchedChars > 0) {
        return true;
      }
      
      return false;
    });
  });
}
