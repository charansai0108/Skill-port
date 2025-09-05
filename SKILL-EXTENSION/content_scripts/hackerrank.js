(function () {
  const isOnSubmissionPage = window.location.pathname.includes("/challenges/") && 
                            (window.location.pathname.includes("/submissions/") || 
                             document.querySelector('.submission-result') !== null);
  
  if (!isOnSubmissionPage) return;

  // ✅ Extract challenge slug from URL
  function getChallengeSlug() {
    const match = window.location.pathname.match(/\/challenges\/([^\/]+)/);
    return match ? match[1] : 'unknown-challenge';
  }

  const challengeSlug = getChallengeSlug();

  // ✅ Wait helper
  const wait = ms => new Promise(res => setTimeout(res, ms));

  // ✅ Extract username with retries
  async function getUsername() {
    for (let i = 0; i < 10; i++) {
      // Try to find username in various places
      const usernameSelectors = [
        '.profile-username',
        '.user-name',
        '[data-testid="user-name"]',
        '.header__user-name',
        '.username'
      ];

      for (const selector of usernameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          return element.textContent.trim();
        }
      }

      // Try localStorage
      const storedUsername = localStorage.getItem('hackerrank_username') || 
                            localStorage.getItem('username') ||
                            localStorage.getItem('user_name');
      if (storedUsername) {
        return storedUsername;
      }

      await wait(1000);
    }
    return 'unknown-user';
  }

  // ✅ Extract challenge details
  function getChallengeDetails() {
    const titleElement = document.querySelector('.challenge-title') ||
                        document.querySelector('.problem-title') ||
                        document.querySelector('h1');
    
    const title = titleElement ? titleElement.textContent.trim() : 'Unknown Challenge';
    
    // Try to extract difficulty
    const difficultyElement = document.querySelector('.difficulty') ||
                             document.querySelector('.challenge-difficulty') ||
                             document.querySelector('[data-testid="difficulty"]');
    
    const difficulty = difficultyElement ? difficultyElement.textContent.trim().toLowerCase() : 'unknown';
    
    return { title, difficulty };
  }

  // ✅ Extract submission details
  function getSubmissionDetails() {
    const resultElement = document.querySelector('.submission-result') ||
                         document.querySelector('.result') ||
                         document.querySelector('[data-testid="submission-result"]') ||
                         document.querySelector('.testcase-result');
    
    if (!resultElement) return null;

    const status = resultElement.textContent.trim().toLowerCase();
    
    // Try to extract runtime and memory
    const runtimeElement = document.querySelector('.runtime') ||
                          document.querySelector('.time-complexity') ||
                          document.querySelector('[data-testid="runtime"]') ||
                          document.querySelector('.execution-time');
    
    const memoryElement = document.querySelector('.memory') ||
                         document.querySelector('.space-complexity') ||
                         document.querySelector('[data-testid="memory"]') ||
                         document.querySelector('.memory-usage');
    
    const runtime = runtimeElement ? runtimeElement.textContent.trim() : null;
    const memory = memoryElement ? memoryElement.textContent.trim() : null;
    
    // Try to extract language
    const languageElement = document.querySelector('.language') ||
                           document.querySelector('.programming-language') ||
                           document.querySelector('[data-testid="language"]') ||
                           document.querySelector('.submission-language');
    
    const language = languageElement ? languageElement.textContent.trim() : 'Unknown';
    
    return {
      status,
      runtime,
      memory,
      language
    };
  }

  // ✅ Send data to background script
  async function sendSubmissionData(data) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'trackSubmission',
        platform: 'hackerrank',
        data: data
      });
      
      if (response && response.success) {
        console.log('✅ HackerRank submission tracked successfully');
        showTrackingNotification('Submission tracked successfully!');
      } else {
        console.error('❌ Failed to track HackerRank submission:', response?.error);
        showTrackingNotification('Failed to track submission', 'error');
      }
    } catch (error) {
      console.error('❌ Error sending HackerRank submission data:', error);
      showTrackingNotification('Error tracking submission', 'error');
    }
  }

  // ✅ Show tracking notification
  function showTrackingNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10B981' : '#EF4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      }, 300);
    }, 3000);
  }

  // ✅ Main tracking function
  async function trackSubmission() {
    try {
      console.log('🔍 HackerRank: Starting submission tracking...');
      
      const username = await getUsername();
      const challengeDetails = getChallengeDetails();
      const submissionDetails = getSubmissionDetails();
      
      if (!submissionDetails) {
        console.log('⚠️ HackerRank: No submission details found');
        return;
      }
      
      const submissionData = {
        username,
        platform: 'hackerrank',
        problemSlug: challengeSlug,
        problemTitle: challengeDetails.title,
        difficulty: challengeDetails.difficulty,
        status: submissionDetails.status,
        language: submissionDetails.language,
        runtime: submissionDetails.runtime,
        memory: submissionDetails.memory,
        submittedAt: new Date().toISOString(),
        url: window.location.href
      };
      
      console.log('📊 HackerRank: Submission data:', submissionData);
      await sendSubmissionData(submissionData);
      
    } catch (error) {
      console.error('❌ HackerRank: Error in trackSubmission:', error);
    }
  }

  // ✅ Wait for page to be ready and track submission
  async function initTracking() {
    // Wait for the page to load
    await wait(2000);
    
    // Check if we're on a submission page
    if (document.querySelector('.submission-result') || 
        document.querySelector('.result') ||
        document.querySelector('[data-testid="submission-result"]') ||
        document.querySelector('.testcase-result')) {
      await trackSubmission();
    } else {
      // If not immediately available, wait and check again
      const observer = new MutationObserver(async (mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const hasResult = document.querySelector('.submission-result') ||
                             document.querySelector('.result') ||
                             document.querySelector('[data-testid="submission-result"]') ||
                             document.querySelector('.testcase-result');
            
            if (hasResult) {
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
        observer.disconnect();
      }, 30000);
    }
  }

  // ✅ Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTracking);
  } else {
    initTracking();
  }

  console.log('🚀 HackerRank content script loaded');
})();