console.log("🐞 SkillPort InterviewBit Tracker loaded");

(function () {
  const platform = "interviewbit";

  function getSlug() {
    const match = location.pathname.match(/\/problems\/([^/]+)/);
    return match ? match[1] : "unknown-slug";
  }

  function getVerdictIB() {
    const text = document.body.textContent || "";
    if (text.includes("Correct Answer")) return "Accepted";
    if (text.includes("Wrong Answer")) return "Wrong Answer";
    return "Unknown";
  }

  function saveAttempt(verdict, timestamp) {
    const slug = getSlug();
    const key = `skillport_ib_${slug}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const data = {
      platform,
      slug,
      verdict,
      timestamp,
      attempt: existing.length + 1,
    };
    existing.push(data);
    localStorage.setItem(key, JSON.stringify(existing));
    console.log("📬 SkillPort InterviewBit Submission Saved:", data);
  }

  function waitForVerdict(maxAttempts = 20, interval = 1000) {
    let attempts = 0;
    const checker = setInterval(() => {
      const verdict = getVerdictIB();
      if (verdict !== "Unknown") {
        clearInterval(checker);
        const timestamp = new Date().toISOString();
        saveAttempt(verdict, timestamp);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checker);
          console.log("⏱️ Timeout: Could not detect verdict within 20 seconds.");
        }
      }
    }, interval);
  }

  waitForVerdict();
})();
