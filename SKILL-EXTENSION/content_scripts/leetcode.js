(function () {
  const isOnSubmissionPage = window.location.pathname.includes("/submissions/");
  if (!isOnSubmissionPage) return;

  const submissionId = window.location.pathname.split('/').filter(Boolean).pop();

  // ✅ Extract slug from URL
  function getSlugFromURL() {
    const match = window.location.pathname.match(/problems\/([^\/]+)\/submissions/);
    return match ? match[1] : 'unknown-slug';
  }
  const slug = getSlugFromURL();

  // ✅ Wait helper
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

  // ✅ Extract code from modern editor
  function getCode() {
    const codeContainer = document.querySelector('.view-lines');
    if (codeContainer) {
      return Array.from(codeContainer.querySelectorAll('div'))
        .map(div => div.textContent.trim())
        .join('\n');
    }
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

  // ✅ Send data to SkillPort backend
  async function sendToSkillPort(submissionData) {
    try {
      // Get SkillPort token from localStorage (if user is logged in)
      const skillportToken = localStorage.getItem('skillport_token');
      
      if (!skillportToken) {
        console.log('⚠ SkillPort: User not logged in, storing locally only');
        return false;
      }

      const response = await fetch('http://localhost:5001/api/v1/extension/submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${skillportToken}`
        },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('✅ SkillPort: Submission sent successfully!');
          return true;
        } else {
          console.error('❌ SkillPort: Failed to send submission:', result.message);
          return false;
        }
      } else {
        console.error('❌ SkillPort: HTTP error:', response.status);
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
      verdict,
      code,
      timestamp,
      problemTitle: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      difficulty: "medium", // You can extract this from the page if needed
      language: "javascript", // You can extract this from the page if needed
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
      
      // Try to send to SkillPort backend
      const sentToBackend = await sendToSkillPort(newAttempt);
      
      if (sentToBackend) {
        console.log('🚀 SkillPort: Data synced with platform!');
      } else {
        console.log('💾 SkillPort: Data stored locally only');
      }
    }

    console.log(`📊 Total attempts for [${slug}]: ${existing[slug].length}`);
    existing[slug].forEach((a, i) => {
      console.log(`• Attempt ${i + 1} by ${a.username}: ${new Date(a.timestamp).toLocaleString()} — ${a.verdict}`);
    });
  })();
})();
