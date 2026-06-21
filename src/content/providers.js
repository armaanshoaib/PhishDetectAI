export const PROVIDERS = {
  GMAIL: {
    container: '.adn.ads',
    subject: '.hP',
    body: '.a3s',
    attachments: '.aZo, .aQH',
  },
  HOTMAIL: {
    container: '.ReadMsgBody',
    subject: '.subject',
    body: '.message-body',
    attachments: '.AttachmentTileGrid',
  },
};

export function detectProvider() {
  const hostname = window.location.hostname;
  if (hostname.includes('mail.google.com')) return 'GMAIL';
  if (hostname.includes('hotmail.com')) return 'HOTMAIL';
  return null;
}

export function extractEmailContent(provider, container) {
  if (!PROVIDERS[provider]) {
    throw new Error(`Unsupported provider: ${provider}`);
  }
  const selectors = PROVIDERS[provider];
  
  // Subject is usually globally scoped at thread level, but we check container first.
  const subjectEl = container 
    ? (container.querySelector(selectors.subject) || document.querySelector(selectors.subject)) 
    : document.querySelector(selectors.subject);
  
  // Body is inside the container
  const bodyEl = container ? container.querySelector(selectors.body) : document.querySelector(selectors.body);

  // Attachments are inside the container or root
  const attachmentElements = container ? container.querySelectorAll(selectors.attachments) : document.querySelectorAll(selectors.attachments);

  // Sender info (Gmail specific)
  let senderEmail = '';
  let senderName = '';
  if (provider === 'GMAIL' && container) {
    const senderEl = container.querySelector('.gD');
    if (senderEl) {
      senderEmail = senderEl.getAttribute('email') || '';
      senderName = senderEl.getAttribute('name') || senderEl.textContent || '';
    }
  }

  return {
    subject: subjectEl?.textContent?.trim() || '',
    body: bodyEl?.textContent?.trim() || '',
    attachments: Array.from(attachmentElements).map((el) => ({
      name: el.getAttribute('data-name') || el.textContent?.trim() || 'Unnamed Attachment',
      type: el.getAttribute('data-type') || '',
      size: el.getAttribute('data-size') || '',
    })),
    senderEmail,
    senderName,
  };
}

