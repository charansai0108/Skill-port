(function () {
  // Check if we're on a GFG problem page
  const isOnProblemPage = window.location.pathname.includes("/problems/");
  
  if (!isOnProblemPage) {
    console.log('🔍 GFG: Not on a problem page, skipping');
    return;
  }
  
  console.log("📡 SkillPort GFG Tracker Active");

  // Constants
  const SEND_COOLDOWN = 5000;
  let submissionInProgress = false;
  let lastSentUrl = null;

  // Observer config
  const OBSERVER_CONFIG = { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style', 'data-status'] };

  // Wait helper
  const wait = ms => new Promise(res => setTimeout(res, ms));

  // Username caching
  let cachedUsername = localStorage.getItem("skillport-username") || "anonymous";

  // Extract username from multiple sources
  function extractUsername() {
      try {
          const profileData = localStorage.getItem("gfgProfile");
          if (profileData) {
              const parsed = JSON.parse(profileData);
              if (parsed?.data?.user_name) return parsed.data.user_name.trim();
          }
      } catch {}

      const profileLink = document.querySelector('a[href^="https://www.geeksforgeeks.org/user/"]');
      if (profileLink?.href) {
          const match = profileLink.href.match(/user\/([^/]+)/);
          if (match?.[1]) return match[1].trim();
      }

      const domUser = document.querySelector('a[title="Profile"] span, .profile_name, .header_user_name');
      if (domUser?.textContent.trim()) return domUser.textContent.trim();

      return null;
  }

  // Update cached username
  function updateCachedUsername() {
      const found = extractUsername();
      if (found && found !== "anonymous" && found !== cachedUsername) {
          cachedUsername = found;
          localStorage.setItem("skillport-username", found);
          console.log("✅ Username detected and cached:", found);
          return true;
      }
      return false;
  }

  // Get username
  function getUsername() {
      updateCachedUsername();
      return cachedUsername;
  }

  // Get problem slug & URL
  function getSlug() {
      const match = location.pathname.match(/\/problems\/([^\/]+)\//);
      return match ? match[1] : null;
  }
  function getProblemURL() { return location.href; }

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

  // Send submission to background
  async function sendSubmission(data) {
      try {
          chrome.runtime.sendMessage({ type: "submitData", data }, (response) => {
              if (!response || !response.success) {
                  console.error("❌ Failed to send GFG submission:", response);
              } else {
                  console.log("✅ Submission object logged:", data);
                  console.log("💾 Backend response:", response.data);
              }
          });
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

      const titleElement = document.querySelector('.problem-tab h2, .problems_header_content h3, .problem-statement h2');
      const title = titleElement ? titleElement.textContent.trim() : "Unknown Problem";

      const payload = {
          platform: "geeksforgeeks",
          slug,
          url,
          username,
          email,
          attempts,
          problemTitle: title,
          timestamp: new Date().toISOString(),
      };

      await sendSubmission(payload);

      setTimeout(() => { submissionInProgress = false; lastSentUrl = null; }, SEND_COOLDOWN);
  }

  // Detect success mutations
  function detectSuccess(mutations) {
      for (const m of mutations) {
          if ([...m.addedNodes].some(n => n.textContent?.includes("Problem Solved Successfully"))) {
              handleSuccessfulSubmission();
              return;
          }
          if (m.type === 'attributes' && m.target.nodeType === 1) {
              const target = m.target;
              if (target.classList?.contains('problemSuccessToast') || target.classList?.contains('toast-success')) {
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

  // Start observer
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

  console.log("👀 GFG submission tracker is running...");
})();