document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const openaiGroup = document.getElementById('openai-settings-group');
  const webllmGroup = document.getElementById('webllm-settings-group');
  const settingsForm = document.getElementById('settings-form');
  const apiKeyInput = document.getElementById('input-api-key');
  const toggleKeyVisibilityBtn = document.getElementById('btn-toggle-key-visibility');
  const openaiModelSelect = document.getElementById('select-openai-model');
  const webllmModelSelect = document.getElementById('select-webllm-model');
  const strictnessSelect = document.getElementById('select-strictness');
  
  // Dashboard indicators
  const statTotal = document.getElementById('stat-total');
  const statSafe = document.getElementById('stat-safe');
  const statSuspicious = document.getElementById('stat-suspicious');
  const statPhishing = document.getElementById('stat-phishing');
  const activeProvider = document.getElementById('active-provider');
  const activeModel = document.getElementById('active-model');
  const activeStrictness = document.getElementById('active-strictness');
  const engineStatus = document.getElementById('engine-status');

  // History list
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('btn-clear-history');

  // 1. Tab Switching Logic
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons & panels
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      // Add active to clicked button and matched panel
      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`panel-${targetTab}`).classList.add('active');
      
      // Reload relevant data
      if (targetTab === 'dashboard') {
        loadStats();
      } else if (targetTab === 'history') {
        loadHistory();
      }
    });
  });

  // 2. Settings Provider Visibility Toggling
  const providerInputs = document.getElementsByName('provider');
  providerInputs.forEach(input => {
    input.addEventListener('change', (e) => {
      toggleProviderGroups(e.target.value);
    });
  });

  function toggleProviderGroups(provider) {
    if (provider === 'webllm') {
      openaiGroup.classList.add('hidden');
      webllmGroup.classList.remove('hidden');
    } else {
      openaiGroup.classList.remove('hidden');
      webllmGroup.classList.add('hidden');
    }
  }

  // Toggle API Key visibility
  toggleKeyVisibilityBtn.addEventListener('click', () => {
    const type = apiKeyInput.getAttribute('type') === 'password' ? 'text' : 'password';
    apiKeyInput.setAttribute('type', type);
  });

  // 3. Load Stats from Chrome Storage
  function loadStats() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ['stats_total', 'stats_safe', 'stats_suspicious', 'stats_phishing', 'apiKey', 'provider', 'model', 'strictness'],
        (items) => {
          // Stats counters
          statTotal.textContent = items.stats_total || 0;
          statSafe.textContent = items.stats_safe || 0;
          statSuspicious.textContent = items.stats_suspicious || 0;
          statPhishing.textContent = items.stats_phishing || 0;

          // Config summary cards
          const currentProvider = items.provider || 'openai';
          const currentStrictness = items.strictness || 'balanced';
          const defaultModel = currentProvider === 'openai' ? 'gpt-4o-mini' : 'SmolLM2-360M-Instruct-q4f16_1-MLC';
          const currentModel = items.model || defaultModel;

          activeProvider.textContent = `${currentProvider.toUpperCase()} MODE`;
          activeProvider.className = `provider-pill select-${currentProvider}`;
          activeModel.textContent = currentModel;
          activeStrictness.textContent = currentStrictness.charAt(0).toUpperCase() + currentStrictness.slice(1);
        }
      );
    }
  }

  // 4. Load Scan History
  function loadHistory() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['scan_history'], (items) => {
        const history = items.scan_history || [];
        if (history.length === 0) {
          historyList.innerHTML = `<li class="empty-state">No emails scanned yet. Details of scanned emails will appear here.</li>`;
          return;
        }

        historyList.innerHTML = '';
        history.forEach(item => {
          const li = document.createElement('li');
          li.className = 'history-item';
          
          const timeString = formatTime(item.timestamp);
          const riskClass = item.riskLevel || 'low';
          const confidencePercent = Math.round(item.confidenceScore * 100);

          li.innerHTML = `
            <div class="history-info">
              <span class="history-subj" title="${escapeHtml(item.subject)}">${escapeHtml(item.subject)}</span>
              <span class="history-sender" title="${escapeHtml(item.senderName)} <${escapeHtml(item.senderEmail)}>">
                ${escapeHtml(item.senderName || 'Unknown')} (${escapeHtml(item.senderEmail || 'No sender address')})
              </span>
            </div>
            <div class="history-meta">
              <span class="history-badge ${riskClass}">${riskClass.toUpperCase()} (${confidencePercent}%)</span>
              <span class="history-time">${timeString}</span>
            </div>
          `;
          historyList.appendChild(li);
        });
      });
    }
  }

  // Helper utility to format time
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  // Helper to escape HTML tags
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 5. Load settings on start
  function loadSettings() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(
        ['provider', 'apiKey', 'model', 'strictness'],
        (items) => {
          const provider = items.provider || 'openai';
          const apiKey = items.apiKey || '';
          const model = items.model || '';
          const strictness = items.strictness || 'balanced';

          // Set radio buttons
          document.getElementById(`provider-${provider}`).checked = true;
          toggleProviderGroups(provider);

          // Set input keys
          apiKeyInput.value = apiKey;

          // Set select inputs
          if (provider === 'openai') {
            openaiModelSelect.value = model || 'gpt-4o-mini';
          } else {
            webllmModelSelect.value = model || 'SmolLM2-360M-Instruct-q4f16_1-MLC';
          }
          strictnessSelect.value = strictness;
        }
      );
    }
  }

  // Save Settings Form Submit
  settingsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const selectedProvider = document.querySelector('input[name="provider"]:checked').value;
    const apiKey = apiKeyInput.value.trim();
    const model = selectedProvider === 'openai' ? openaiModelSelect.value : webllmModelSelect.value;
    const strictness = strictnessSelect.value;

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({
        provider: selectedProvider,
        apiKey: apiKey,
        model: model,
        strictness: strictness
      }, () => {
        // Show success visual feedback on save button
        const saveBtn = document.getElementById('btn-save-settings');
        const origText = saveBtn.textContent;
        saveBtn.textContent = '✓ Configuration Saved!';
        saveBtn.style.backgroundColor = 'var(--success-color)';
        
        // Trigger config sync in active content scripts (or reloading settings)
        setTimeout(() => {
          saveBtn.textContent = origText;
          saveBtn.style.backgroundColor = '';
        }, 1500);

        // Update stats summary card directly
        loadStats();
      });
    }
  });

  // 6. Clear Scan Logs & Stats
  clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all scan history and metrics logs?')) {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({
          stats_total: 0,
          stats_safe: 0,
          stats_suspicious: 0,
          stats_phishing: 0,
          scan_history: []
        }, () => {
          loadStats();
          loadHistory();
        });
      }
    }
  });

  // Initialize
  loadStats();
  loadSettings();
});
