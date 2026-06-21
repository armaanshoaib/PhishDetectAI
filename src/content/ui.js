export function createAnalysisUI(results, provider, PROVIDERS, status) {
  const container = document.querySelector(PROVIDERS[provider].container);
  if (!container) return;

  // Clean up any existing analysis
  const existingBanner = container.querySelector('.security-analysis');
  if (existingBanner) existingBanner.remove();

  // Create main container
  const analysis = document.createElement('div');
  analysis.className = `security-analysis risk-${results.riskLevel}`;

  // Create banner content with status info
  analysis.innerHTML = `
    <div class="banner-wrapper">
      <div class="banner-content">
        <div class="primary-info">
          ${getStatusIcon(results.riskLevel)}
          <span class="status-message">${getRiskLevelText(results.riskLevel)}</span>
          <span class="confidence">${Math.round(results.confidenceScore * 100)}% confidence</span>
          ${status.analyzing > 0 ? `<span class="analyzing">Analyzed ${status.analyzing} email${status.analyzing > 1 ? 's' : ''}...</span>` : ''}
        </div>
        <div class="controls">
          <button class="settings-toggle" aria-label="Settings">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
            </svg>
          </button>
          <button class="details-toggle" aria-expanded="false">
            <span>Details</span>
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M7 10l5 5 5-5z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="settings-panel" style="display: none;">
        <div class="settings-content">
          <h4>Configuration</h4>
          <div class="provider-section">
            <span class="provider-label">Provider:</span>
            <span class="provider-badge ${status.provider || 'openai'}">${status.provider?.toUpperCase() || 'OPENAI'}</span>
          </div>
          <div class="status-section">
            <div class="status-text">${status.message || 'Ready'}</div>
            ${status.error ? `<div class="error">${status.error}</div>` : ''}
          </div>
        </div>
      </div>
    </div>
    <div class="details-panel">
      <div class="details-content">
        ${results.finalAssessment?.summary ? `<p class="summary">${results.finalAssessment.summary}</p>` : ''}
        ${
          results.riskFactors?.length > 0
            ? `
          <div class="risk-factors">
            ${results.riskFactors
              .map(
                (factor) => `
              <div class="factor">
                <div class="factor-header">
                  <span class="factor-title">${factor.category}</span>
                  <span class="factor-severity">Impact: ${Math.round(factor.severity * 100)}%</span>
                </div>
                <p class="factor-detail">${factor.detail}</p>
              </div>
            `
              )
              .join('')}
          </div>
        `
            : ''
        }
      </div>
    </div>
  `;

  // Find the best insertion point
  let insertionPoint = null;

  // Try different possible selectors in order of preference
  const selectors = [
    '.ha', // Gmail header area
    '.hP', // Subject line
    '.aeF', // Email content wrapper
    '.adn.ads', // Email body container
    '.gs', // General email section
  ];

  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) {
      // Found a valid insertion point
      insertionPoint = element;
      while (insertionPoint && !insertionPoint.parentElement?.classList.contains('adn')) {
        insertionPoint = insertionPoint.parentElement;
      }
      break;
    }
  }

  // Insert the banner
  if (insertionPoint && insertionPoint.parentElement) {
    insertionPoint.parentElement.insertBefore(analysis, insertionPoint.nextSibling);
  } else {
    // Fallback to inserting at the top of the container
    container.insertBefore(analysis, container.firstChild);
  }

  // Add click handlers
  const settingsToggle = analysis.querySelector('.settings-toggle');
  const settingsPanel = analysis.querySelector('.settings-panel');
  const detailsToggle = analysis.querySelector('.details-toggle');

  if (settingsToggle && settingsPanel) {
    settingsToggle.addEventListener('click', () => {
      const isVisible = settingsPanel.style.display !== 'none';
      settingsPanel.style.display = isVisible ? 'none' : 'block';
      settingsToggle.setAttribute('aria-expanded', !isVisible);
    });
  }

  if (detailsToggle) {
    detailsToggle.addEventListener('click', () => {
      const isExpanded = detailsToggle.getAttribute('aria-expanded') === 'true';
      detailsToggle.setAttribute('aria-expanded', !isExpanded);
      analysis.classList.toggle('expanded');
    });
  }

  // Only attach WebLLM-specific handlers if using WebLLM
  if (status.provider === 'webllm') {
    // Removed action button handlers since buttons are removed
  }

  // Add styles
  if (!document.getElementById('security-analysis-styles')) {
    const styles = document.createElement('style');
    styles.id = 'security-analysis-styles';
    styles.textContent = `
      .security-analysis {
        --success-color: #0f5132;
        --success-bg: #d1e7dd;
        --success-border: #badbcc;
        --warning-color: #664d03;
        --warning-bg: #fff3cd;
        --warning-border: #ffecb5;
        --danger-color: #842029;
        --danger-bg: #f8d7da;
        --danger-border: #f5c2c7;
        --info-color: #055160;
        --info-bg: #cff4fc;
        --info-border: #b6effb;
        --surface-color: #ffffff;
        --border-color: #e2e8f0;
        
        width: 100%;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        margin: 10px 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .banner-wrapper {
        padding: 0 16px;
        margin-bottom: 8px;
      }

      .banner-content {
        background: var(--surface-color);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 52px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        transition: all 0.2s ease;
      }

      .security-analysis.risk-low .banner-content {
        border-color: var(--success-border);
        background: linear-gradient(135deg, var(--success-bg) 0%, #ffffff 100%);
      }

      .security-analysis.risk-medium .banner-content {
        border-color: var(--warning-border);
        background: linear-gradient(135deg, var(--warning-bg) 0%, #ffffff 100%);
      }

      .security-analysis.risk-high .banner-content {
        border-color: var(--danger-border);
        background: linear-gradient(135deg, var(--danger-bg) 0%, #ffffff 100%);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15);
        animation: subtlePulse 3s infinite ease-in-out;
      }

      @keyframes subtlePulse {
        0% { box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15); }
        50% { box-shadow: 0 4px 20px rgba(220, 53, 69, 0.3); }
        100% { box-shadow: 0 4px 12px rgba(220, 53, 69, 0.15); }
      }

      .primary-info {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .status-icon {
        flex-shrink: 0;
        transition: all 0.3s ease;
      }

      .security-analysis.risk-low .status-icon { color: #198754; }
      .security-analysis.risk-medium .status-icon { color: #ffc107; }
      .security-analysis.risk-high .status-icon { color: #dc3545; }
      .security-analysis.risk-analyzing .status-icon { color: #0dcaf0; }

      .status-message {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: -0.01em;
      }

      .security-analysis.risk-low .status-message { color: var(--success-color); }
      .security-analysis.risk-medium .status-message { color: var(--warning-color); }
      .security-analysis.risk-high .status-message { color: var(--danger-color); }

      .confidence {
        font-size: 12px;
        font-weight: 500;
        color: #475569;
        padding: 3px 10px;
        background: rgba(241, 245, 249, 0.8);
        border: 1px solid rgba(226, 232, 240, 0.8);
        border-radius: 9999px;
        margin-left: 8px;
        display: inline-flex;
        align-items: center;
      }

      .analyzing {
        font-size: 12px;
        color: #64748b;
        margin-left: 8px;
        font-style: italic;
      }

      .controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .settings-toggle, .details-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px 14px;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        background: #ffffff;
        color: #475569;
        font-family: inherit;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }

      .settings-toggle {
        padding: 8px;
      }

      .settings-toggle:hover, .details-toggle:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #1e293b;
      }

      .details-toggle svg {
        margin-left: 4px;
        transition: transform 0.2s ease;
      }

      .expanded .details-toggle svg {
        transform: rotate(180deg);
      }

      .details-panel {
        padding: 0 16px;
        margin-top: -6px;
        overflow: hidden;
        max-height: 0;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .expanded .details-panel {
        max-height: 2000px;
        opacity: 1;
        margin-bottom: 12px;
      }

      .details-content {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-top: none;
        border-radius: 0 0 12px 12px;
        padding: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }

      .summary {
        font-size: 14px;
        line-height: 1.6;
        color: #334155;
        margin: 0 0 16px 0;
        padding: 12px 16px;
        background: #f8fafc;
        border-left: 4px solid #94a3b8;
        border-radius: 0 8px 8px 0;
      }

      .security-analysis.risk-low .summary { border-left-color: #198754; }
      .security-analysis.risk-medium .summary { border-left-color: #ffc107; }
      .security-analysis.risk-high .summary { border-left-color: #dc3545; }

      .risk-factors {
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .factor {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 14px;
        transition: all 0.2s ease;
      }

      .factor:hover {
        border-color: #cbd5e1;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      }

      .factor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 6px;
      }

      .factor-title {
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
      }

      .factor-severity {
        font-size: 11px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 9999px;
        background: #f1f5f9;
        color: #475569;
      }

      .factor-detail {
        font-size: 13px;
        line-height: 1.5;
        color: #475569;
        margin: 0;
      }

      .settings-panel {
        margin: 8px 16px 0 16px;
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        animation: slideDown 0.2s ease;
      }

      @keyframes slideDown {
        from { transform: translateY(-10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }

      .settings-content {
        padding: 14px 16px;
      }

      .settings-content h4 {
        margin: 0 0 10px 0;
        font-size: 13px;
        font-weight: 600;
        color: #1e293b;
      }

      .provider-section {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
      }

      .provider-label {
        font-size: 12px;
        font-weight: 500;
        color: #64748b;
      }

      .provider-badge {
        display: inline-block;
        padding: 1px 6px;
        border-radius: 4px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.05em;
      }

      .provider-badge.webllm {
        background: #e0f2fe;
        color: #0369a1;
      }

      .provider-badge.openai {
        background: #f1f5f9;
        color: #334155;
      }

      .status-section {
        margin-top: 4px;
      }

      .status-text {
        font-size: 12px;
        color: #475569;
      }

      .error {
        margin-top: 6px;
        color: #b91c1c;
        background: #fef2f2;
        border: 1px solid #fca5a5;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(styles);
  }
}

function getRiskLevelText(level) {
  switch (level) {
    case 'low':
      return 'This email appears to be safe';
    case 'medium':
      return 'Use caution with this email';
    case 'high':
      return 'Warning: This email appears suspicious';
    default:
      return 'Email analysis pending';
  }
}

export function showLoadingState(provider, PROVIDERS) {
  const container = document.querySelector(PROVIDERS[provider].container);
  if (!container) return;

  const analysis = document.createElement('div');
  analysis.className = 'security-analysis is-loading';
  analysis.innerHTML = `
    <div class="banner-wrapper">
      <div class="banner-content">
        <div class="primary-info">
          <div class="loading-indicator"></div>
          <span class="status-message">Analyzing email security...</span>
        </div>
      </div>
    </div>
  `;

  // Use same insertion point finding logic
  let insertionPoint = null;
  const selectors = ['.ha', '.hP', '.aeF', '.adn.ads', '.gs'];

  for (const selector of selectors) {
    const element = container.querySelector(selector);
    if (element) {
      insertionPoint = element;
      while (insertionPoint && !insertionPoint.parentElement?.classList.contains('adn')) {
        insertionPoint = insertionPoint.parentElement;
      }
      break;
    }
  }

  if (insertionPoint && insertionPoint.parentElement) {
    insertionPoint.parentElement.insertBefore(analysis, insertionPoint.nextSibling);
  } else {
    container.insertBefore(analysis, container.firstChild);
  }

  return analysis;
}

function getStatusIcon(riskLevel) {
  const icons = {
    low: `      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M10 17l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
    `,
    medium: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M12 13c.55 0 1-.45 1-1V8c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1zm0 4c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>
      </svg>
    `,
    high: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon">
        <path class="icon-base" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        <path class="icon-symbol" d="M13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    `,
    loading: `
      <svg viewBox="0 0 24 24" width="24" height="24" class="status-icon loading">
        <circle class="spinner-track" cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
        <circle class="spinner" cx="12" cy="12" r="10" stroke-width="2" fill="none"/>
      </svg>
    `,
  };

  return icons[riskLevel] || icons.loading;
}
