// GFG script
console.log('🐞 SkillPort GFG Tracker loaded');

(function () {
  const platform = 'gfg';
  const slug = window.location.pathname.split('/')[2] || 'unknown-slug';
  const key = `skillport_gfg_${slug}`;
  const pendingKey = `skillport_gfg_pending_${slug}`;
  const USERNAME_KEY = 'skillport_gfg_username';

  // ✅ Auto-fetch username from redirect
  function fetchUsernameSilently() {
    if (localStorage.getItem(USERNAME_KEY)) return;

    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = 'https://www.geeksforgeeks.org/user/';
    document.body.appendChild(iframe);

    iframe.onload = () => {
      try {
        const redirectedUrl = iframe.contentWindow.location.href;
        const match = redirectedUrl.match(/\/user\/([^\/?#]+)/);
        if (match) {
          const username = match[1];
          localStorage.setItem(USERNAME_KEY, username);
          console.log(`👤 Username fetched: ${username}`);
        }
      } catch (err) {
        console.warn('❌ Failed to access iframe for username:', err);
      }
      document.body.removeChild(iframe);
    };
  }

  function getUsername() {
    return localStorage.getItem(USERNAME_KEY) || 'unknown-user';
  }

  // ✅ UPDATED VERDICT CHECKER
  function getVerdictGFG() {
    const verdictText = document.querySelector('div[class^="problems_problem_solved"] h3')?.textContent.trim();

    if (!verdictText) return 'Unknown';

    if (verdictText.includes('Problem Solved Successfully')) return 'Accepted';
    if (verdictText.includes('Wrong Answer')) return 'Wrong Answer';
    if (verdictText.includes('Time Limit Exceeded')) return 'Time Limit Exceeded';
    if (verdictText.includes('Runtime Error')) return 'Runtime Error';
    if (verdictText.includes('Compilation Error')) return 'Compilation Error';
    if (verdictText.includes('Internal Error')) return 'Internal Error';

    return 'Unknown';
  }

  function saveAttempt(verdict, timestamp) {
    const username = getUsername();
    const attemptData = {
      platform,
      slug,
      verdict,
      timestamp,
      username
    };

    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    attemptData.attempt = existing.length + 1;
    existing.push(attemptData);
    localStorage.setItem(key, JSON.stringify(existing));

    console.log('📬 SkillPort GFG Submission Detail Data:', attemptData);
    printSummary(existing);
  }

  function printSummary(data) {
    console.log(`📊 Total attempts for [${slug}]: ${data.length}`);
    data.forEach((entry, index) => {
      const time = new Date(entry.timestamp).toLocaleString();
      console.log(`• Attempt ${index + 1}: ${time} — ${entry.verdict}`);
    });
  }

  function waitForVerdictGFG() {
    const interval = setInterval(() => {
      const verdict = getVerdictGFG();
      const isFinal = verdict !== 'Unknown';

      if (isFinal) {
        clearInterval(interval);
        const pending = JSON.parse(localStorage.getItem(pendingKey));
        if (!pending) return;

        const timestamp = pending?.timestamp || new Date().toISOString();
        localStorage.removeItem(pendingKey);

        saveAttempt(verdict, timestamp);
      }
    }, 500);
  }

  function setupPendingBeforeUnload() {
    window.addEventListener('beforeunload', () => {
      const pending = {
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(pendingKey, JSON.stringify(pending));
    });
  }

  // ✅ Run everything
  setupPendingBeforeUnload();
  waitForVerdictGFG();
  fetchUsernameSilently();
})();
