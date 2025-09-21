// Popup Script for SkillPort Extension
document.addEventListener('DOMContentLoaded', function() {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = document.getElementById('statusText');
    const syncBtn = document.getElementById('syncBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const problemsSolved = document.getElementById('problemsSolved');
    const currentStreak = document.getElementById('currentStreak');

    // Initialize popup
    initializePopup();

    // Event listeners
    syncBtn.addEventListener('click', handleSync);
    settingsBtn.addEventListener('click', handleSettings);

    function initializePopup() {
        // Check extension status
        checkStatus();
        
        // Load user stats
        loadStats();
    }

    function checkStatus() {
        // Simulate status check
        statusIndicator.style.background = '#10b981';
        statusText.textContent = 'Connected';
    }

    function loadStats() {
        // Load from storage or API
        chrome.storage.local.get(['problemsSolved', 'currentStreak'], function(result) {
            problemsSolved.textContent = result.problemsSolved || '0';
            currentStreak.textContent = (result.currentStreak || '0') + ' days';
        });
    }

    function handleSync() {
        syncBtn.textContent = 'Syncing...';
        syncBtn.disabled = true;
        
        // Simulate sync process
        setTimeout(() => {
            syncBtn.textContent = 'Sync Complete';
            syncBtn.style.background = '#10b981';
            
            setTimeout(() => {
                syncBtn.textContent = 'Sync Progress';
                syncBtn.disabled = false;
                syncBtn.style.background = '#3b82f6';
            }, 2000);
        }, 1500);
    }

    function handleSettings() {
        // Open settings page
        chrome.tabs.create({
            url: chrome.runtime.getURL('popup.html')
        });
    }
});
