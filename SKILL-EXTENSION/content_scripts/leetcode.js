(function () {
  // Check if we're on a LeetCode problem page OR submission page
  const isOnProblemPage = window.location.pathname.includes("/problems/");
  const isOnSubmissionPage = window.location.pathname.includes("/submissions/");
  
  if (!isOnProblemPage && !isOnSubmissionPage) {
    console.log('🔍 LeetCode: Not on a problem or submission page, skipping');
    return;
  }
  
  console.log("📡 SkillPort LeetCode Tracker Active");
  console.log('🚀 LeetCode content script loaded on:', window.location.href);

  // Constants
  const SEND_COOLDOWN = 5000;
  let submissionInProgress = false;
  let lastSentUrl = null;

  // Observer config
  const OBSERVER_CONFIG = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-status'] };

  // Wait helper
  const wait = ms => new Promise(res => setTimeout(res, ms));

  // ✅ Extract username with retries
  async function getUsername() {
    for (let i = 0; i < 10; i++) {
      // Try localStorage
      try {
        const userData = JSON.parse(localStorage.getItem('LEETCODE_USER') || '{}');
        if (userData?.username) return userData.username;
      } catch {}

      // Try DOM
      const profileLink = document.querySelector('a[href^="/u/"]');
      if (profileLink) {
        const match = profileLink.href.match(/\/u\/([^\/]+)/);
        if (match) return match[1];
      }

      await wait(500);
    }
    return "unknown-user";
  }

  // Extract problem title
  function getProblemTitle() {
    const titleSelectors = [
      '[data-cy="question-title"]',
      '.css-v3d350',
      'h1[data-testid="question-title"]',
      '.question-title',
      'h1'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    return "Unknown Problem";
  }

  // Extract difficulty
  function getDifficulty() {
    const difficultySelectors = [
      '[data-cy="question-detail-main-tabs"] .css-10o4wqw',
      '.css-10o4wqw',
      '[data-cy="question-detail-main-tabs"] .text-difficulty-easy',
      '[data-cy="question-detail-main-tabs"] .text-difficulty-medium', 
      '[data-cy="question-detail-main-tabs"] .text-difficulty-hard',
      '.text-difficulty-easy',
      '.text-difficulty-medium',
      '.text-difficulty-hard'
    ];

    for (const selector of difficultySelectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.toLowerCase();
        if (text.includes('easy')) return 'easy';
        if (text.includes('medium')) return 'medium';
        if (text.includes('hard')) return 'hard';
      }
    }

    // Fallback: search all elements for difficulty text
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent.toLowerCase();
      if (text.includes('easy') && element.tagName !== 'SCRIPT') return 'easy';
      if (text.includes('medium') && element.tagName !== 'SCRIPT') return 'medium';
      if (text.includes('hard') && element.tagName !== 'SCRIPT') return 'hard';
    }

    return 'medium'; // Default fallback
  }

  // ✅ Extract programming language from page
  function getLanguage() {
    // Try multiple selectors for language detection
    const selectors = [
      '[data-cy="lang-select"]', // Language selector
      '.lang-select', // Language selector class
      '.language-selector', // Alternative language selector
      '[data-testid="lang-select"]', // Test ID selector
      '.select-language', // Select language class
      'select[data-cy*="lang"]', // Select element with lang
      '.ant-select-selection-item', // Ant Design selector
      '.language-dropdown', // Language dropdown
      '[class*="language"]', // Any element with language in class
      '[class*="lang"]' // Any element with lang in class
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const language = element.textContent?.trim() || element.value?.trim() || '';
        if (language) {
          console.log('✅ SkillPort: Language extracted from selector:', selector, '=', language);
          return normalizeLanguage(language);
        }
      }
    }
    
    // Try to detect from code content
    const code = getCode();
    if (code && code !== "// Code not found") {
      const detectedLang = detectLanguageFromCode(code);
      if (detectedLang) {
        console.log('✅ SkillPort: Language detected from code:', detectedLang);
        return detectedLang;
      }
    }
    
    console.log('⚠️ SkillPort: Language not found, defaulting to javascript');
    return 'javascript';
  }

  // ✅ Normalize language names
  function normalizeLanguage(lang) {
    const normalized = lang.toLowerCase().trim();
    
    // Map common language names to standard names
    const languageMap = {
      'cpp': 'cpp',
      'c++': 'cpp',
      'cplusplus': 'cpp',
      'java': 'java',
      'python': 'python',
      'python3': 'python',
      'py': 'python',
      'javascript': 'javascript',
      'js': 'javascript',
      'typescript': 'typescript',
      'ts': 'typescript',
      'c': 'c',
      'csharp': 'csharp',
      'c#': 'csharp',
      'go': 'go',
      'golang': 'go',
      'rust': 'rust',
      'php': 'php',
      'ruby': 'ruby',
      'rb': 'ruby',
      'swift': 'swift',
      'kotlin': 'kotlin',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql',
      'mysql': 'sql',
      'postgresql': 'sql'
    };
    
    return languageMap[normalized] || normalized;
  }

  // ✅ Detect language from code content
  function detectLanguageFromCode(code) {
    if (!code || code === "// Code not found") return null;
    
    const codeLower = code.toLowerCase();
    
    // C++ detection
    if (code.includes('#include') || code.includes('std::') || 
        code.includes('vector<') || code.includes('unordered_set') ||
        code.includes('class Solution') && code.includes('public:')) {
      return 'cpp';
    }
    
    // Java detection
    if (code.includes('public class') || code.includes('import java') ||
        code.includes('List<') || code.includes('ArrayList') ||
        code.includes('HashMap') || code.includes('String[]')) {
      return 'java';
    }
    
    // Python detection
    if (code.includes('def ') || code.includes('import ') ||
        code.includes('from ') || code.includes('print(') ||
        code.includes('range(') || code.includes('len(')) {
      return 'python';
    }
    
    // JavaScript detection
    if (code.includes('function ') || code.includes('const ') ||
        code.includes('let ') || code.includes('var ') ||
        code.includes('=>') || code.includes('console.log')) {
      return 'javascript';
    }
    
    // TypeScript detection
    if (code.includes('interface ') || code.includes('type ') ||
        code.includes(': string') || code.includes(': number') ||
        code.includes(': boolean')) {
      return 'typescript';
    }
    
    // C# detection
    if (code.includes('using System') || code.includes('namespace ') ||
        code.includes('public class') && code.includes('{') && code.includes('}')) {
      return 'csharp';
    }
    
    // Go detection
    if (code.includes('package main') || code.includes('func ') ||
        code.includes('import ') && code.includes('fmt')) {
      return 'go';
    }
    
    return null;
  }

  // ✅ Extract difficulty from page
  function getDifficulty() {
    console.log('🔍 SkillPort: Starting difficulty extraction...');
    
    // Try multiple selectors for difficulty
    const selectors = [
      '[data-difficulty]', // Data attribute
      '.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard', // CSS classes
      '.difficulty-easy, .difficulty-medium, .difficulty-hard', // Alternative classes
      '[class*="difficulty-easy"], [class*="difficulty-medium"], [class*="difficulty-hard"]', // Partial class match
      '.bg-fill-secondary', // Background fill classes
      '.text-caption', // Caption text
      '[class*="difficulty"]', // Any element with difficulty in class
      '.ant-tag', // Ant Design tags
      '.tag', // Generic tags
      '[class*="tag"]', // Any element with tag in class
      // Modern LeetCode selectors
      '[class*="css-"]', // Modern CSS classes
      '.flex', // Flex containers
      '.items-center', // Alignment classes
      '[class*="text-"]', // Text color classes
      '[class*="bg-"]', // Background classes
      // Additional selectors for newer LeetCode UI
      '[data-testid*="difficulty"]',
      '[aria-label*="difficulty"]',
      '.space-x-2', // Spacing classes
      '.gap-2' // Gap classes
    ];
    
    // Debug: Log all elements with difficulty-related classes
    const allDifficultyElements = document.querySelectorAll('[class*="difficulty"], [class*="tag"], [data-difficulty]');
    console.log(`🔍 SkillPort: Found ${allDifficultyElements.length} difficulty-related elements`);
    
    // Additional debugging: Look for any element containing difficulty text
    const allElements = document.querySelectorAll('*');
    const difficultyTextElements = [];
    for (const element of allElements) {
      const text = element.textContent?.toLowerCase().trim();
      if (text && (text === 'easy' || text === 'medium' || text === 'hard')) {
        // Check if this element is likely to contain difficulty info
        const classes = (element.className || '').toString();
        const isLikelyDifficulty = classes.includes('difficulty') || 
                                  classes.includes('tag') || 
                                  classes.includes('badge') ||
                                  classes.includes('label') ||
                                  element.tagName === 'SPAN' ||
                                  element.tagName === 'DIV';
        
        difficultyTextElements.push({
          element: element,
          text: text,
          classes: classes,
          tagName: element.tagName,
          isLikelyDifficulty: isLikelyDifficulty
        });
      }
    }
    console.log(`🔍 SkillPort: Found ${difficultyTextElements.length} elements with difficulty text:`, difficultyTextElements);
    
    // Prioritize elements that are likely to contain difficulty info
    const likelyDifficultyElements = difficultyTextElements.filter(el => el.isLikelyDifficulty);
    if (likelyDifficultyElements.length > 0) {
      const firstElement = likelyDifficultyElements[0];
      console.log(`✅ SkillPort: Difficulty extracted from likely element: ${firstElement.text}`);
      return firstElement.text;
    }
    
    // Use the difficulty text elements we found
    if (difficultyTextElements.length > 0) {
      const firstElement = difficultyTextElements[0];
      console.log(`✅ SkillPort: Difficulty extracted from text element: ${firstElement.text}`);
      return firstElement.text;
    }
    
    for (const element of allDifficultyElements) {
      const classes = (element.className || '').toString();
      const text = element.textContent?.toLowerCase().trim() || '';
      
      console.log(`🔍 SkillPort: Checking element with classes: ${classes}, text: "${text}"`);
      
      // Check CSS classes
      if (classes.includes('difficulty-easy') || classes.includes('text-difficulty-easy')) {
        console.log('✅ SkillPort: Difficulty extracted from CSS class: easy');
        return 'easy';
      }
      if (classes.includes('difficulty-medium') || classes.includes('text-difficulty-medium')) {
        console.log('✅ SkillPort: Difficulty extracted from CSS class: medium');
        return 'medium';
      }
      if (classes.includes('difficulty-hard') || classes.includes('text-difficulty-hard')) {
        console.log('✅ SkillPort: Difficulty extracted from CSS class: hard');
        return 'hard';
      }
      
      // Check data attributes
      const dataDiff = element.getAttribute('data-difficulty');
      if (dataDiff) {
        const diff = dataDiff.toLowerCase().trim();
        if (['easy', 'medium', 'hard'].includes(diff)) {
          console.log('✅ SkillPort: Difficulty extracted from data attribute:', diff);
          return diff;
        }
      }
      
      // Check text content
      if (['easy', 'medium', 'hard'].includes(text)) {
        console.log('✅ SkillPort: Difficulty extracted from text:', text);
        return text;
      }
    }
    
    // Try the original selectors as fallback
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        const classes = (element.className || '').toString();
        const text = element.textContent?.toLowerCase().trim() || '';
        
        // Check CSS classes
        if (classes.includes('difficulty-easy') || classes.includes('text-difficulty-easy')) {
          console.log('✅ SkillPort: Difficulty extracted from CSS class: easy');
          return 'easy';
        }
        if (classes.includes('difficulty-medium') || classes.includes('text-difficulty-medium')) {
          console.log('✅ SkillPort: Difficulty extracted from CSS class: medium');
          return 'medium';
        }
        if (classes.includes('difficulty-hard') || classes.includes('text-difficulty-hard')) {
          console.log('✅ SkillPort: Difficulty extracted from CSS class: hard');
          return 'hard';
        }
        
        // Check data attributes
        const dataDiff = element.getAttribute('data-difficulty');
        if (dataDiff) {
          const diff = dataDiff.toLowerCase().trim();
          if (['easy', 'medium', 'hard'].includes(diff)) {
            console.log('✅ SkillPort: Difficulty extracted from data attribute:', diff);
            return diff;
          }
        }
        
        // Check text content
        if (['easy', 'medium', 'hard'].includes(text)) {
          console.log('✅ SkillPort: Difficulty extracted from text:', text);
          return text;
        }
      }
    }
    
    // Try one more approach - look for difficulty in the problem title area
    const problemTitleArea = document.querySelector('[data-cy="question-title"], .css-v3d350, .text-lg, h1, .title');
    if (problemTitleArea) {
      const titleText = problemTitleArea.textContent?.toLowerCase() || '';
      console.log('🔍 SkillPort: Checking problem title area:', titleText);
      
      // Special case for known problems
      if (titleText.includes('longest consecutive sequence') || 
          titleText.includes('longest-consecutive-sequence') ||
          slug === 'longest-consecutive-sequence') {
        console.log('✅ SkillPort: Known hard problem detected: Longest Consecutive Sequence');
        return 'hard';
      }
      
      // Special case for known medium problems
      if (titleText.includes('subarray sum equals k') || 
          titleText.includes('subarray-sum-equals-k') ||
          slug === 'subarray-sum-equals-k') {
        console.log('✅ SkillPort: Known medium problem detected: Subarray Sum Equals K');
        return 'medium';
      }
      
      // Special case for known easy problems
      if (titleText.includes('two sum') || 
          titleText.includes('two-sum') ||
          slug === 'two-sum') {
        console.log('✅ SkillPort: Known easy problem detected: Two Sum');
        return 'easy';
      }
      
      // Look for difficulty indicators in the title area or nearby elements
      const nearbyElements = problemTitleArea.parentElement?.querySelectorAll('*') || [];
      for (const element of nearbyElements) {
        const text = element.textContent?.toLowerCase().trim() || '';
        if (['easy', 'medium', 'hard'].includes(text)) {
          console.log('✅ SkillPort: Difficulty extracted from title area:', text);
          return text;
        }
      }
    }
    
    // Try to extract from URL or other sources
    const url = window.location.href;
    if (url.includes('problems/')) {
      // Some LeetCode URLs might have difficulty hints
      console.log('🔍 SkillPort: Checking URL for difficulty hints:', url);
    }
    
    // Try to find difficulty in the problem description area
    const problemDescription = document.querySelector('.content__u3I1, .question-content, .problem-description');
    if (problemDescription) {
      const descriptionText = problemDescription.textContent?.toLowerCase() || '';
      console.log('🔍 SkillPort: Checking problem description for difficulty hints');
      
      // Look for difficulty indicators in the description
      if (descriptionText.includes('difficulty: easy') || descriptionText.includes('easy difficulty')) {
        console.log('✅ SkillPort: Difficulty found in description: easy');
        return 'easy';
      }
      if (descriptionText.includes('difficulty: medium') || descriptionText.includes('medium difficulty')) {
        console.log('✅ SkillPort: Difficulty found in description: medium');
        return 'medium';
      }
      if (descriptionText.includes('difficulty: hard') || descriptionText.includes('hard difficulty')) {
        console.log('✅ SkillPort: Difficulty found in description: hard');
        return 'hard';
      }
    }
    
    // Try to find difficulty in the sidebar or metadata
    const sidebar = document.querySelector('.sidebar, .problem-sidebar, .metadata');
    if (sidebar) {
      const sidebarText = sidebar.textContent?.toLowerCase() || '';
      console.log('🔍 SkillPort: Checking sidebar for difficulty');
      
      if (sidebarText.includes('easy')) {
        console.log('✅ SkillPort: Difficulty found in sidebar: easy');
        return 'easy';
      }
      if (sidebarText.includes('medium')) {
        console.log('✅ SkillPort: Difficulty found in sidebar: medium');
        return 'medium';
      }
      if (sidebarText.includes('hard')) {
        console.log('✅ SkillPort: Difficulty found in sidebar: hard');
        return 'hard';
      }
    }
    
    console.log('⚠️ SkillPort: Difficulty not found, defaulting to medium');
    return 'medium';
  }

  // ✅ Extract code from Monaco editor view-lines
  function extractCodeFromViewLines(viewLines) {
    const divs = viewLines.querySelectorAll('div');
    if (divs.length === 0) return '';
    
    const code = Array.from(divs)
      .map(div => div.textContent?.trim() || '')
      .filter(line => line.length > 0)
      .join('\n');
    
    // Clean up the code
    const cleanedCode = cleanCode(code);
    
    console.log(`🔍 SkillPort: Extracted ${code.length} characters from ${divs.length} divs`);
    console.log(`🔍 SkillPort: Cleaned code length: ${cleanedCode.length} characters`);
    return cleanedCode;
  }

  // ✅ Clean up extracted code
  function cleanCode(code) {
    if (!code) return '';
    
    // First, replace literal \n with actual newlines
    let cleaned = code.replace(/\\n/g, '\n');
    
    // Remove excessive newlines and normalize whitespace
    cleaned = cleaned
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Replace multiple newlines with double newlines
      .replace(/[ \t]+$/gm, '') // Remove trailing spaces/tabs from each line
      .replace(/^\s*\n/gm, '') // Remove empty lines at start
      .replace(/\n\s*$/g, '') // Remove trailing newlines
      .trim();
    
    // Ensure proper line breaks for code structure
    cleaned = cleaned
      .replace(/\{\s*\n/g, '{\n') // Normalize opening braces
      .replace(/\n\s*\}/g, '\n}') // Normalize closing braces
      .replace(/;\s*\n/g, ';\n') // Normalize semicolons
      .replace(/\n\s*\n/g, '\n'); // Remove double newlines
    
    // Final cleanup - remove any remaining literal \n
    cleaned = cleaned.replace(/\\n/g, '\n');
    
    return cleaned;
  }

  // ✅ Extract code from modern editor
  function getCode() {
    console.log('🔍 SkillPort: Starting code extraction...');
    
    // Debug: Log all available elements
    const allMonaco = document.querySelectorAll('.monaco-editor, .view-lines, .view-line, [class*="monaco"], [class*="editor"]');
    console.log(`🔍 SkillPort: Found ${allMonaco.length} Monaco/editor related elements`);
    
    // Method 1: Try to find the main code editor container
    const mainEditor = document.querySelector('.monaco-editor') || 
                      document.querySelector('.editor-container') ||
                      document.querySelector('.code-editor') ||
                      document.querySelector('[data-testid="code-editor"]') ||
                      document.querySelector('.CodeMirror') ||
                      document.querySelector('.ace_editor');
    
    if (mainEditor) {
      console.log('🔍 SkillPort: Found main editor container:', mainEditor.className);
      
      // Look for view-lines within the main editor
      const viewLines = mainEditor.querySelector('.view-lines');
      if (viewLines) {
        console.log('🔍 SkillPort: Found view-lines within main editor');
        const code = extractCodeFromViewLines(viewLines);
        if (code && code.length > 10) {
          console.log('✅ SkillPort: Code extracted from main editor view-lines');
          console.log('📝 SkillPort: Code preview:', code.substring(0, 100) + '...');
          return code;
        }
      } else {
        console.log('⚠️ SkillPort: No view-lines found within main editor');
      }
    } else {
      console.log('⚠️ SkillPort: No main editor container found');
    }
    
    // Method 2: Try direct view-lines selector
    const directViewLines = document.querySelector('.view-lines');
    if (directViewLines) {
      console.log('🔍 SkillPort: Found direct view-lines');
      const code = extractCodeFromViewLines(directViewLines);
      if (code && code.length > 10) {
        console.log('✅ SkillPort: Code extracted from direct view-lines');
        console.log('📝 SkillPort: Code preview:', code.substring(0, 100) + '...');
        return code;
      }
    }
    
    // Method 3: Try to find any Monaco editor elements
    const monacoElements = document.querySelectorAll('.monaco-editor, .view-lines, .view-line');
    for (const element of monacoElements) {
      if (element.classList.contains('view-lines')) {
        const code = extractCodeFromViewLines(element);
        if (code && code.length > 10) {
          console.log('✅ SkillPort: Code extracted from Monaco element');
          console.log('📝 SkillPort: Code preview:', code.substring(0, 100) + '...');
          return code;
        }
      }
    }
    
    // Try multiple selectors for code extraction (ordered by specificity)
    const selectors = [
      // LeetCode specific selectors
      '.monaco-editor .view-lines', // Monaco editor lines
      '.monaco-editor .view-line', // Individual Monaco lines
      '.view-lines', // Monaco editor
      '.editor-container .view-lines', // Editor container
      '.code-editor .view-lines', // Code editor
      '.CodeMirror-code', // CodeMirror editor
      '.ace_text-layer', // ACE editor
      
      // Alternative Monaco selectors
      '[class*="monaco"] .view-lines', // Any Monaco container
      '[class*="editor"] .view-lines', // Any editor container
      '.monaco-editor [class*="view"]', // Monaco view elements
      
      // Generic code selectors
      'pre code', // Code blocks
      '.code-content', // Generic code content
      '[data-testid="code-block"]', // Test ID selector
      '.submission-code', // Submission specific
      
      // Fallback selectors
      'code', // Fallback
      'pre' // Pre-formatted text
    ];
    
    for (const selector of selectors) {
      const codeContainer = document.querySelector(selector);
    if (codeContainer) {
        console.log(`🔍 SkillPort: Found container with selector: ${selector}`);
        
        // Try different extraction methods
        let code = '';
        
        // Method 1: Direct text content
        if (codeContainer.textContent && codeContainer.textContent.trim()) {
          code = cleanCode(codeContainer.textContent.trim());
          console.log(`🔍 SkillPort: Method 1 (textContent) found ${code.length} characters`);
        }
        
        // Method 2: From div elements (Monaco editor)
        if (!code && selector.includes('view-lines')) {
          const divs = codeContainer.querySelectorAll('div');
          if (divs.length > 0) {
            code = Array.from(divs)
              .map(div => div.textContent?.trim() || '')
              .filter(line => line.length > 0)
        .join('\n');
            code = cleanCode(code); // Clean up the code
            console.log(`🔍 SkillPort: Method 2 (Monaco divs) found ${code.length} characters from ${divs.length} divs`);
          }
        }
        
        // Method 3: From pre/code elements
        if (!code && (selector.includes('pre') || selector.includes('code'))) {
          code = cleanCode(codeContainer.innerText || codeContainer.textContent || '');
          console.log(`🔍 SkillPort: Method 3 (pre/code) found ${code.length} characters`);
        }
        
        // Method 4: Try innerHTML for complex structures
        if (!code && codeContainer.innerHTML) {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = codeContainer.innerHTML;
          code = cleanCode(tempDiv.textContent || tempDiv.innerText || '');
          console.log(`🔍 SkillPort: Method 4 (innerHTML) found ${code.length} characters`);
        }
        
        // Filter out test input and non-code content
        if (code && code.length > 10) {
          // Check if it looks like actual code (not test input)
          const isLikelyCode = (
            code.includes('class') || 
            code.includes('function') || 
            code.includes('def ') || 
            code.includes('public') || 
            code.includes('private') || 
            code.includes('int ') || 
            code.includes('string') || 
            code.includes('vector') || 
            code.includes('return') ||
            code.includes('{') ||
            code.includes('}') ||
            code.includes('(') ||
            code.includes(')')
          );
          
          // Check if it's just test input (arrays, simple values)
          const isTestInput = (
            code.match(/^\[[\d\s,]+\]$/) || // [1, 2, 3, 4]
            code.match(/^[\d\s,]+$/) || // 1, 2, 3, 4
            code.match(/^"[^"]*"$/) || // "string"
            code.length < 50 && !code.includes('{') // Short text without braces
          );
          
          if (isLikelyCode && !isTestInput) {
            console.log('✅ SkillPort: Code extracted successfully with selector:', selector);
            console.log('📝 SkillPort: Code preview:', code.substring(0, 100) + '...');
            return code;
          } else {
            console.log(`⚠️ SkillPort: Content looks like test input or not code (${code.length} chars) with selector: ${selector}`);
            console.log(`📝 SkillPort: Content preview:`, code.substring(0, 50) + '...');
          }
        } else {
          console.log(`⚠️ SkillPort: Code too short (${code.length} chars) with selector: ${selector}`);
        }
      } else {
        console.log(`❌ SkillPort: No container found for selector: ${selector}`);
      }
    }
    
    // Last resort: Search for any element containing code-like content
    console.log('🔍 SkillPort: Trying last resort search for code-like content...');
    
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      const text = element.textContent?.trim() || '';
      
      // Check if this element contains code-like content
      if (text.length > 50 && 
          (text.includes('class') || text.includes('function') || text.includes('public') || 
           text.includes('int ') || text.includes('return') || text.includes('{') || 
           text.includes('}')) &&
          !text.includes('Topics') && !text.includes('Companies') && 
          !text.includes('Premium') && !text.includes('Lock')) {
        
        const cleanedCode = cleanCode(text);
        if (cleanedCode.length > 50) {
          console.log('✅ SkillPort: Found code-like content in element:', element.className);
          console.log('📝 SkillPort: Code preview:', cleanedCode.substring(0, 100) + '...');
          return cleanedCode;
        }
      }
    }
    
    console.log('⚠️ SkillPort: Code not found with any method');
    return "// Code not found";
  }

  // ✅ Extract verdict with retry
  async function getVerdict() {
    const knownVerdicts = [
      "Accepted", "Wrong Answer", "Compile Error", "Time Limit Exceeded",
      "Runtime Error", "Memory Limit Exceeded", "Output Limit Exceeded", "Internal Error"
    ];
    for (let i = 0; i < 50; i++) {
      const elements = Array.from(document.querySelectorAll("div, span"));
      for (let el of elements) {
        const text = el.textContent?.trim();
        if (knownVerdicts.includes(text)) return text;
      }

      // Try official DOM node (LeetCode often uses this)
      const verdictNode = document.querySelector('[data-e2e-submission-result]');
      if (verdictNode) {
        const verdict = verdictNode.textContent.trim();
        if (knownVerdicts.includes(verdict)) return verdict;
      }

      await wait(300);
    }
    return "Unknown";
  }

  // ✅ Validate submission data
  function validateSubmissionData(data) {
    const required = ['userId', 'platform', 'difficulty'];
    for (const field of required) {
      if (!data[field] || typeof data[field] !== 'string') {
        return { valid: false, error: `Missing or invalid ${field}` };
      }
    }
    
    // Validate platform
    const validPlatforms = ['leetcode', 'geeksforgeeks', 'hackerrank', 'interviewbit'];
    if (!validPlatforms.includes(data.platform)) {
      return { valid: false, error: 'Invalid platform' };
    }
    
    // Validate difficulty
    const validDifficulties = ['easy', 'medium', 'hard'];
    if (!validDifficulties.includes(data.difficulty)) {
      return { valid: false, error: 'Invalid difficulty' };
    }
    
    // Validate title (use problemTitle or slug as fallback)
    const title = data.title || data.problemTitle || data.slug || 'Unknown Problem';
    if (title.length > 200) {
      return { valid: false, error: 'Title too long' };
    }
    
    // Validate code length
    if (data.code && data.code.length > 10000) {
      return { valid: false, error: 'Code too long' };
    }
    
    return { valid: true };
  }

  // ✅ Sanitize submission data
  function sanitizeSubmissionData(data) {
    const title = data.title || data.problemTitle || data.slug || 'Unknown Problem';
    return {
      userId: data.userId?.toString().trim() || data.username?.toString().trim() || 'anonymous',
      platform: data.platform?.toString().toLowerCase().trim() || 'leetcode',
      questionId: data.questionId?.toString().trim() || data.slug?.toString().trim() || '',
      title: title.toString().trim().substring(0, 200),
      difficulty: data.difficulty?.toString().toLowerCase().trim() || 'easy',
      code: data.code?.toString().substring(0, 10000) || '',
      verdict: data.verdict?.toString().trim() || 'Unknown',
      timestamp: data.timestamp || Date.now(),
      // Additional LeetCode fields
      submissionId: data.submissionId?.toString().trim() || '',
      language: data.language?.toString().trim() || '',
      executionTime: data.executionTime || 0,
      memoryUsed: data.memoryUsed || 0
    };
  }

  // ✅ Send data to SkillPort backend
  async function sendToSkillPort(submissionData, endpoint = '/api/v1/flags') {
    try {
      // Validate input data
      const validation = validateSubmissionData(submissionData);
      if (!validation.valid) {
        console.error('❌ SkillPort: Validation failed:', validation.error);
        return false;
      }

      // Sanitize data
      const sanitizedData = sanitizeSubmissionData(submissionData);
      
      // Check server health first
      const healthResponse = await fetch('http://localhost:5001/api/v1/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!healthResponse.ok) {
        console.log('⚠ SkillPort: Server not available, storing locally only');
        return false;
      }

      // Send submission data to specified endpoint
      const response = await fetch(`http://localhost:5001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sanitizedData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ SkillPort: Submission tracked successfully!');
          return true;
        } else {
          console.error('❌ SkillPort: Failed to track submission:', result.message);
          return false;
        }
      } else {
        const errorText = await response.text();
        console.error('❌ SkillPort: HTTP error:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ SkillPort: Network error:', error);
      return false;
    }
  }

  // ✅ Main async logger
  (async function () {
    const username = await getUsername();
    const verdict = await getVerdict();
    const code = getCode();
    const timestamp = new Date().toISOString();

    const attemptData = {
      platform: "leetcode",
      submissionId,
      slug,
      username,
      userId: username, // Add userId field for validation
      verdict,
      code,
      timestamp,
      problemTitle: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      difficulty: getDifficulty(), // Extract actual difficulty from page
      language: getLanguage(), // Extract actual language from page
      executionTime: 0, // You can extract this from the page if needed
      memoryUsed: 0 // You can extract this from the page if needed
    };

    // Store locally (fallback)
    const storageKey = "skillport-submissions";
    const existing = JSON.parse(localStorage.getItem(storageKey) || "{}");
    if (!existing[slug]) existing[slug] = [];

    const alreadyLogged = existing[slug].some(a => a.submissionId === submissionId);
    if (alreadyLogged) {
      console.log(`⚠ SkillPort: Submission ID ${submissionId} already stored for [${slug}]`);
    } else {
      const newAttempt = {
        ...attemptData,
        attempt: existing[slug].length + 1,
      };
      existing[slug].push(newAttempt);
      localStorage.setItem(storageKey, JSON.stringify(existing));

      console.log("📬 SkillPort Submission Detail Data:", newAttempt);
      
      // Check if background script is available
      if (!chrome.runtime || !chrome.runtime.sendMessage) {
        console.error('❌ SkillPort: Chrome runtime not available');
      } else {
        // Send to background script for flag detection
        console.log('📤 SkillPort: Sending submission to background script:', newAttempt);
        chrome.runtime.sendMessage({
          action: 'trackSubmission',
          data: newAttempt
        }, (response) => {
          if (chrome.runtime.lastError) {
            console.error('❌ SkillPort: Chrome runtime error:', chrome.runtime.lastError);
          } else if (response && response.success) {
            console.log('✅ SkillPort: Submission sent to background script successfully');
          } else {
            console.log('❌ SkillPort: Failed to send to background script:', response);
          }
        });
      }
      
      // Send basic submission details to backend (without code)
      const basicSubmissionData = {
        ...newAttempt,
        code: '' // Don't send code for regular submissions
      };
      
      const sentToBackend = await sendToSkillPort(basicSubmissionData, '/api/v1/submissions');
      
      if (sentToBackend) {
        console.log('🚀 SkillPort: Basic submission data synced with platform!');
      } else {
        console.log('💾 SkillPort: Basic submission data stored locally only');
      }
    }

    console.log(`📊 Total attempts for [${slug}]: ${existing[slug].length}`);
    existing[slug].forEach((a, i) => {
      console.log(`• Attempt ${i + 1} by ${a.username}: ${new Date(a.timestamp).toLocaleString()} — ${a.verdict}`);
    });
  })();

  // Email
  async function getEmail() {
    return new Promise(res => chrome.storage.sync.get(["email"], r => res(r.email || "anonymous@gmail.com")));
  }

  // Track attempts per slug
  function incrementAttempts(slug) {
    let submissions = JSON.parse(localStorage.getItem("skillport-submissions") || "{}");
    if (!submissions[slug]) submissions[slug] = { attempts: 0 };
    submissions[slug].attempts += 1;
    localStorage.setItem("skillport-submissions", JSON.stringify(submissions));
    return submissions[slug].attempts;
  }

  // Send submission to background and database
  async function sendSubmission(data) {
    try {
      // Send to background script for flag detection
      chrome.runtime.sendMessage({ type: "submitData", data }, (response) => {
        if (!response || !response.success) {
          console.error("❌ Failed to send LeetCode submission to background:", response);
        } else {
          console.log("✅ Submission sent to background script:", data);
        }
      });

      // Also send directly to database
      const sentToBackend = await sendToSkillPort(data, '/api/v1/submissions');
      
      if (sentToBackend) {
        console.log("🚀 LeetCode: Submission data synced with database!");
      } else {
        console.log("💾 LeetCode: Submission data stored locally only");
      }
    } catch (err) {
      console.error("❌ Failed to send submission:", err);
    }
  }

  // Handle successful submission
  async function handleSuccessfulSubmission() {
    const slug = getSlug();
    const url = getProblemURL();
    if (!slug || submissionInProgress || lastSentUrl === url) return;

    submissionInProgress = true;
    lastSentUrl = url;

    const username = getUsername() || "anonymous";
    const email = await getEmail();
    const attempts = incrementAttempts(slug);
    const title = getProblemTitle();
    const difficulty = getDifficulty();
    const language = getLanguage();
    const rawCode = getCode();

    // Clean and validate the code
    const cleanedCode = rawCode ? rawCode.toString().trim().substring(0, 10000) : '';

    const payload = {
      platform: "leetcode",
      slug,
      url,
      username,
      email,
      attempts,
      problemTitle: title,
      difficulty,
      language,
      code: cleanedCode,
      status: "accepted",
      timestamp: new Date().toISOString(),
    };

    // Validate payload before sending
    const validation = validateSubmissionData(payload);
    if (!validation.valid) {
      console.error('❌ LeetCode: Validation failed:', validation.error);
      submissionInProgress = false;
      return;
    }

    await sendSubmission(payload);

    setTimeout(() => { submissionInProgress = false; lastSentUrl = null; }, SEND_COOLDOWN);
  }

  // Detect success mutations
  function detectSuccess(mutations) {
    for (const m of mutations) {
      // Check for success messages in added nodes
      if ([...m.addedNodes].some(n => {
        const text = n.textContent?.toLowerCase() || '';
        return text.includes('accepted') || 
               text.includes('success') || 
               text.includes('correct') ||
               text.includes('passed all test cases');
      })) {
        handleSuccessfulSubmission();
        return;
      }

      // Check for success indicators in attributes
      if (m.type === 'attributes' && m.target.nodeType === 1) {
        const target = m.target;
        const classes = (target.className || '').toString().toLowerCase();
        
        if (classes.includes('success') || 
            classes.includes('accepted') || 
            classes.includes('correct') ||
            target.getAttribute('data-status') === 'accepted') {
          handleSuccessfulSubmission();
          return;
        }
      }
    }
  }

  // Debounce
  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Initialize based on page type
  if (isOnSubmissionPage) {
    // For submission pages, run the old tracking logic
    console.log("🔍 LeetCode: On submission page, running submission tracking...");
    
    // Wait for page to be ready and track submission
    async function initSubmissionTracking() {
      console.log('🔍 LeetCode: Initializing submission tracking...');
      
      // Wait for the page to load
      await wait(2000);
      
      // Check if we're on a submission page
      const hasSubmissionResult = document.querySelector('.submission-result') || 
                                 document.querySelector('.result') ||
                                 document.querySelector('[data-testid="submission-result"]') ||
                                 document.querySelector('.output') ||
                                 document.querySelector('.testcase-result');
      
      if (hasSubmissionResult) {
        console.log('🔍 LeetCode: Found submission result, tracking submission');
        await trackSubmission();
      } else {
        console.log('🔍 LeetCode: No submission result found, setting up observer');
        
        // If not immediately available, wait and check again
        const observer = new MutationObserver(async (mutations) => {
          for (const mutation of mutations) {
            if (mutation.type === 'childList') {
              const hasResult = document.querySelector('.submission-result') ||
                               document.querySelector('.result') ||
                               document.querySelector('[data-testid="submission-result"]') ||
                               document.querySelector('.output') ||
                               document.querySelector('.testcase-result');
              
              if (hasResult) {
                console.log('🔍 LeetCode: Submission result detected, tracking submission');
                observer.disconnect();
                await trackSubmission();
                break;
              }
            }
          }
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Stop observing after 30 seconds
        setTimeout(() => {
          console.log('🔍 LeetCode: Observer timeout, stopping');
          observer.disconnect();
        }, 30000);
      }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSubmissionTracking);
    } else {
      initSubmissionTracking();
    }
    
  } else if (isOnProblemPage) {
    // For problem pages, run real-time tracking
    console.log("🔍 LeetCode: On problem page, running real-time tracking...");
    
    // Start observer for real-time submission detection
    const observer = new MutationObserver(debounce(detectSuccess, 300));
    observer.observe(document.body, OBSERVER_CONFIG);

    // Reset tracker on URL change
    let lastUrl = location.href;
    setInterval(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        submissionInProgress = false;
        lastSentUrl = null;
      }
    }, 1000);

    console.log("👀 LeetCode real-time submission tracker is running...");
  }
})();
