// ==UserScript==
// @name         SkillPort HackerRank Tracker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Tracks HackerRank submissions and stores them in localStorage
// @author       SkillPort
// @match        https://www.hackerrank.com/challenges/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  console.log("🐞 SkillPort HackerRank Tracker Extension Loaded");

  const platform = "hackerrank";

  function getSlug() {
    const match = location.pathname.match(/\/challenges\/([^/?#]+)/);
    return match ? match[1] : "unknown-slug";
  }

  function getVerdictHR() {
    const green = document.querySelector("span.status.color-green");
    if (green?.textContent.toLowerCase().includes("accepted")) return "Accepted";

    const red = document.querySelector("span.status.color-red");
    if (red?.textContent.toLowerCase().includes("wrong")) return "Wrong Answer";

    const resultEl = document.querySelector(".congrats-msg, .result-message, .output-result");
    const resultText = resultEl?.textContent?.trim().toLowerCase() || "";
    if (resultText.includes("success") || resultText.includes("✓")) return "Accepted";
    if (resultText.includes("wrong") || resultText.includes("✗")) return "Wrong Answer";

    const text = document.body.innerText.toLowerCase();
    if (text.includes("✓ test case passed") || text.includes("accepted")) return "Accepted";
    if (text.includes("✗ test case failed") || text.includes("wrong answer")) return "Wrong Answer";

    return "Unknown";
  }

  function saveAttempt(verdict, timestamp) {
    const slug = getSlug();
    const key = `skillport_hr_${slug}`;
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
    console.log("📬 SkillPort HackerRank Submission Saved:", data);
  }

  function waitForVerdict(maxAttempts = 30, interval = 1000) {
    let attempts = 0;
    const checker = setInterval(() => {
      const verdict = getVerdictHR();
      console.log(`🔎 Attempt ${attempts + 1}: Verdict - ${verdict}`);

      if (verdict !== "Unknown") {
        clearInterval(checker);
        const timestamp = new Date().toISOString();
        saveAttempt(verdict, timestamp);
      } else {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(checker);
          console.warn("⏱️ Timeout: Could not detect verdict.");
        }
      }
    }, interval);
  }

  window.addEventListener("load", () => {
    waitForVerdict();
  });
})();
