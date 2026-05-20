(function () {
  const HELPDESK_URL = 'http://localhost:3000'

  const scriptTag =
    document.currentScript ||
    document.querySelector('script[data-api-key]')

  const API_KEY =
    scriptTag?.getAttribute('data-api-key') || ''

  const CLIENT_EMAIL =
    scriptTag?.getAttribute('data-client-email') || ''

  const CLIENT_NAME =
    scriptTag?.getAttribute('data-client-name') || ''

  const STORAGE_KEY =
    `hd_conversations_${API_KEY}_${CLIENT_EMAIL}`

  let pollingInterval = null
  let conversations = []
  let notificationsEnabled = false
  let initializedPolling = false
  let currentTicketId = null

  // ─────────────────────────────────────────
  // Notifications
  // ─────────────────────────────────────────

  async function initNotifications() {
    if (!('Notification' in window)) return

    if (Notification.permission === 'granted') {
      notificationsEnabled = true
      return
    }

    if (Notification.permission !== 'denied') {
      const permission =
        await Notification.requestPermission()

      notificationsEnabled =
        permission === 'granted'
    }
  }

  function showBrowserNotification(message) {
    if (!notificationsEnabled) return

    if (!document.hidden) return

    new Notification(
      'Nouvelle réponse du support',
      {
        body: message,
        icon:
          'https://cdn-icons-png.flaticon.com/512/1827/1827392.png',
      }
    )
  }

  // ─────────────────────────────────────────
  // Styles
  // ─────────────────────────────────────────

  const style = document.createElement('style')

  style.textContent = `
    #hd-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #2563eb;
      color: white;
      border: none;
      cursor: pointer;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(37,99,235,0.4);
      z-index: 9999;
    }

    #hd-badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: #ef4444;
      color: white;
      font-size: 11px;
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: none;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    #hd-panel {
      position: fixed;
      bottom: 90px;
      right: 24px;
      width: 360px;
      height: 520px;
      background: white;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      z-index: 9998;
      display: none;
      flex-direction: column;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }

    #hd-panel.open {
      display: flex;
    }

    #hd-header {
      background: #2563eb;
      color: white;
      padding: 14px 18px;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #hd-header-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    #hd-back-btn,
    #hd-close-btn {
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-size: 18px;
    }

    #hd-back-btn {
      display: none;
    }

    #hd-list-view,
    #hd-chat-view,
    #hd-form-view {
      flex: 1;
    }

    #hd-list-view {
      display: flex;
      flex-direction: column;
      overflow-y: auto;
    }

    #hd-conv-list {
      flex: 1;
      overflow-y: auto;
    }

    .hd-conv-item {
      padding: 14px 18px;
      border-bottom: 1px solid #f1f5f9;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .hd-conv-subject {
      font-size: 13px;
      font-weight: 600;
    }

    .hd-conv-meta {
      font-size: 11px;
      color: #94a3b8;
      margin-top: 3px;
    }

    .hd-conv-badge {
      background: #ef4444;
      color: white;
      font-size: 11px;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: none;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }

    .hd-conv-badge.visible {
      display: flex;
    }

    #hd-new-btn {
      margin: 12px;
      padding: 10px;
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
    }

    #hd-chat-view {
      flex: 1;
      display: none;
      flex-direction: column;
      overflow: hidden;
      min-height: 0;
    }

    #hd-messages {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-height: 0;
    }

    .hd-msg {
      max-width: 80%;
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 13px;
      line-height: 1.4;
      word-break: break-word;
    }

    .hd-msg.client {
      background: #2563eb;
      color: white;
      align-self: flex-end;
    }

    .hd-msg.support {
      background: #f1f5f9;
      color: #1e293b;
      align-self: flex-start;
    }

    .hd-msg-time {
      font-size: 10px;
      opacity: 0.6;
      margin-top: 4px;
    }

    #hd-input-area {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid #e2e8f0;
      flex-shrink: 0;
      background: white;
      align-items: center;
    }

    #hd-input {
      flex: 1;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 10px 16px;
    }

    #hd-send {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }

    #hd-file-btn {
      background: #f1f5f9;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 18px;
    }

    #hd-form-view {
      display: none;
      flex-direction: column;
      padding: 16px;
      gap: 12px;
    }

    #hd-form-view input,
    #hd-form-view select {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 9px 12px;
      box-sizing: border-box;
    }

    #hd-form-submit {
      background: #2563eb;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px;
      cursor: pointer;
    }

    #hd-error {
      background: #fee2e2;
      color: #dc2626;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 12px;
      display: none;
    }
  `

  document.head.appendChild(style)

  // ─────────────────────────────────────────
  // Button
  // ─────────────────────────────────────────

  const btnWrapper = document.createElement('div')

  btnWrapper.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:9999;'

  btnWrapper.innerHTML = `
    <button id="hd-btn">
      💬
      <span id="hd-badge"></span>
    </button>
  `

  document.body.appendChild(btnWrapper)

  // ─────────────────────────────────────────
  // Panel
  // ─────────────────────────────────────────

  const panel = document.createElement('div')

  panel.id = 'hd-panel'

  panel.innerHTML = `
    <div id="hd-header">
      <div id="hd-header-left">
        <button id="hd-back-btn">←</button>

        <div>
          <div id="hd-header-title">
            💬 Support
          </div>

          <div id="hd-header-status">
            Comment pouvons-nous vous aider ?
          </div>
        </div>
      </div>

      <button id="hd-close-btn">✕</button>
    </div>

    <div id="hd-list-view">
      <div id="hd-conv-list"></div>

      <button id="hd-new-btn">
        + Nouvelle conversation
      </button>
    </div>

    <div id="hd-chat-view">

      <div id="hd-messages"></div>

      <div id="hd-input-area">

        <input
          id="hd-input"
          type="text"
          placeholder="Écrire un message..."
        />

        <input
          type="file"
          id="hd-file-input"
          style="display:none"
        />

        <button id="hd-file-btn">
          📎
        </button>

        <button id="hd-send">
          ➤
        </button>
      </div>
    </div>

    <div id="hd-form-view">

      <div id="hd-error"></div>

      <input
        type="email"
        id="hd-email"
        value="${CLIENT_EMAIL}"
      />

      <input
        type="text"
        id="hd-subject"
        placeholder="Sujet"
      />

      <select id="hd-issue-type">
        <option value="">
          Choisir un type de problème
        </option>
      </select>

      <select id="hd-priority">
        <option value="LOW">Faible</option>
        <option value="MEDIUM" selected>
          Normale
        </option>
        <option value="HIGH">Urgente</option>
      </select>

      <button id="hd-form-submit">
        Démarrer la conversation
      </button>
    </div>
  `

  document.body.appendChild(panel)

  // ─────────────────────────────────────────
  // DOM
  // ─────────────────────────────────────────

  const btn = document.getElementById('hd-btn')
  const badge = document.getElementById('hd-badge')

  const closeBtn =
    document.getElementById('hd-close-btn')

  const backBtn =
    document.getElementById('hd-back-btn')

  const listView =
    document.getElementById('hd-list-view')

  const chatView =
    document.getElementById('hd-chat-view')

  const formView =
    document.getElementById('hd-form-view')

  const convList =
    document.getElementById('hd-conv-list')

  const newBtn =
    document.getElementById('hd-new-btn')

  const messagesEl =
    document.getElementById('hd-messages')

  const inputEl =
    document.getElementById('hd-input')

  const sendBtn =
    document.getElementById('hd-send')

  const issueTypeEl =
    document.getElementById('hd-issue-type')

  const fileInput =
  document.getElementById('hd-file-input')

  const fileBtn =
    document.getElementById('hd-file-btn')

  // ─────────────────────────────────────────
  // Storage
  // ─────────────────────────────────────────

  function saveConversations() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    )
  }

  function loadConversations() {
    try {
      const stored =
        localStorage.getItem(STORAGE_KEY)

      if (stored) {
        conversations = JSON.parse(stored)
      }
    } catch (e) {
      conversations = []
    }
  }

  // ─────────────────────────────────────────
  // Views
  // ─────────────────────────────────────────

  function showList() {
    currentTicketId = null

    listView.style.display = 'flex'
    chatView.style.display = 'none'
    formView.style.display = 'none'

    backBtn.style.display = 'none'

    renderConvList()
  }

  function showChat(ticketId) {
    currentTicketId = ticketId

    listView.style.display = 'none'
    chatView.style.display = 'flex'
    formView.style.display = 'none'

    backBtn.style.display = 'block'

    const conv = conversations.find(
      c => c.ticketId === ticketId
    )

    if (conv) {
      conv.unread = 0
      saveConversations()
    }

    fetchMessages()
  }

  function showForm() {
    listView.style.display = 'none'
    chatView.style.display = 'none'
    formView.style.display = 'flex'

    backBtn.style.display = 'block'
  }

  // ─────────────────────────────────────────
  // Issue types
  // ─────────────────────────────────────────

  async function loadIssueTypes() {
    try {
      const res = await fetch(
        `${HELPDESK_URL}/widget/issue-types`
      )

      if (!res.ok) return

      const issueTypes = await res.json()

      issueTypeEl.innerHTML = `
        <option value="">
          Choisir un type de problème
        </option>

        ${issueTypes
          .map(
            type => `
              <option value="${type.id}">
                ${type.name}
              </option>
            `
          )
          .join('')}
      `
    } catch (e) {
      console.error(e)
    }
  }

  // ─────────────────────────────────────────
  // Conversations
  // ─────────────────────────────────────────

  function renderConvList() {
    convList.innerHTML = conversations
      .map(
        c => `
          <div
            class="hd-conv-item"
            data-id="${c.ticketId}"
          >

            <div>
              <div class="hd-conv-subject">
                ${c.subject}
              </div>

              <div class="hd-conv-meta">
                Ticket #${c.ticketId}
              </div>
            </div>

            <span class="hd-conv-badge ${
              c.unread > 0
                ? 'visible'
                : ''
            }">
              ${c.unread || ''}
            </span>
          </div>
        `
      )
      .join('')

    convList
      .querySelectorAll('.hd-conv-item')
      .forEach(el => {
        el.addEventListener('click', () => {
          showChat(Number(el.dataset.id))
        })
      })
  }

  // ─────────────────────────────────────────
  // Messages
  // ─────────────────────────────────────────

  function renderMessages(messages) {
    messagesEl.innerHTML = messages
      .map(m => {

        const fileHtml = m.fileUrl
          ? `
            <div style="margin-top:8px">
              <a
                href="${HELPDESK_URL}${m.fileUrl}"
                target="_blank"
                style="
                  color:#2563eb;
                  text-decoration:underline;
                  font-size:12px;
                "
              >
                📎 ${m.fileName}
              </a>
            </div>
          `
          : ''

        return `
          <div class="hd-msg ${
            m.senderType === 'CLIENT'
              ? 'client'
              : 'support'
          }">

            <div>${m.content || ''}</div>

            ${fileHtml}

            <div class="hd-msg-time">
              ${new Date(
                m.createdAt
              ).toLocaleTimeString(
                'fr-FR',
                {
                  hour: '2-digit',
                  minute: '2-digit',
                }
              )}
            </div>
          </div>
        `
      })
      .join('')

    requestAnimationFrame(() => {
      messagesEl.scrollTop =
        messagesEl.scrollHeight
    })
  }

  async function fetchMessages() {
    if (!currentTicketId) return

    try {
      const res = await fetch(
        `${HELPDESK_URL}/widget/ticket/${currentTicketId}/messages?clientEmail=${encodeURIComponent(
          CLIENT_EMAIL
        )}&apiKey=${encodeURIComponent(
          API_KEY
        )}`
      )

      if (!res.ok) return

      const messages = await res.json()

      renderMessages(messages)
    } catch (e) {
      console.error(e)
    }
  }

  // ─────────────────────────────────────────
  // Polling
  // ─────────────────────────────────────────

  async function pollAllConversations() {
    if (conversations.length === 0) return

    let totalUnread = 0

    for (const conv of conversations) {
      try {
        const res = await fetch(
          `${HELPDESK_URL}/widget/ticket/${conv.ticketId}/messages?clientEmail=${encodeURIComponent(
            CLIENT_EMAIL
          )}&apiKey=${encodeURIComponent(
            API_KEY
          )}`
        )

        if (!res.ok) continue

        const messages = await res.json()

        const supportMessages =
          messages.filter(
            m => m.senderType !== 'CLIENT'
          )

        const prevCount =
          conv.lastSupportCount || 0

        if (!initializedPolling) {
          conv.lastSupportCount =
            supportMessages.length

          continue
        }

        if (
          supportMessages.length > prevCount
        ) {
          const latest =
            supportMessages[
              supportMessages.length - 1
            ]

          const newCount =
            supportMessages.length -
            prevCount

          if (
            conv.ticketId !== currentTicketId
          ) {
            conv.unread =
              (conv.unread || 0) +
              newCount
          }

          showBrowserNotification(
            latest.content
          )
        }

        conv.lastSupportCount =
          supportMessages.length

        if (
          conv.ticketId === currentTicketId &&
          supportMessages.length !==
            prevCount
        ) {
          renderMessages(messages)
        }

        totalUnread += conv.unread || 0
      } catch (e) {
        console.error(e)
      }
    }

    initializedPolling = true

    saveConversations()

    if (
      totalUnread > 0 &&
      !panel.classList.contains('open')
    ) {
      badge.style.display = 'flex'
      badge.textContent = totalUnread
    } else {
      badge.style.display = 'none'
      badge.textContent = ''
    }

    renderConvList()
  }

  function startPolling() {
    if (pollingInterval) return

    pollAllConversations()

    pollingInterval = setInterval(
      pollAllConversations,
      3000
    )
  }

  // ─────────────────────────────────────────
  // Send message
  // ─────────────────────────────────────────

  async function sendMessage() {
    const content =
      inputEl.value.trim()

    if (!content || !currentTicketId)
      return

    sendBtn.disabled = true

    inputEl.value = ''

    try {
      await fetch(
        `${HELPDESK_URL}/widget/ticket/${currentTicketId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            apiKey: API_KEY,
            clientEmail:
              CLIENT_EMAIL,
            content,
          }),
        }
      )

      await fetchMessages()
    } catch (e) {
      console.error(e)
    }

    sendBtn.disabled = false
  }

  async function handleFileUpload(event) {
    if (!currentTicketId) {
      alert(
        "Veuillez ouvrir une conversation avant d'envoyer un fichier."
      )

      event.target.value = ''

      return
    }

    const file = event.target.files[0]

    if (!file) return

    // limite 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert(
        'Le fichier dépasse la limite de 2MB.'
      )

      event.target.value = ''

      return
    }

    const formData = new FormData()

    formData.append('file', file)

    formData.append(
      'clientEmail',
      CLIENT_EMAIL
    )

    formData.append(
      'apiKey',
      API_KEY
    )

    try {
      const res = await fetch(
        `${HELPDESK_URL}/widget/tickets/${currentTicketId}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const data = await res.json()

      if (!res.ok) {
        alert(
          data.message ||
          "Erreur lors de l'envoi"
        )

        return
      }

      await fetchMessages()

      // reset input
      event.target.value = ''
    } catch (e) {
      console.error(e)

      alert(
        "Impossible d'envoyer le fichier"
      )
    }
  }

  // ─────────────────────────────────────────
  // Upload file
  // ─────────────────────────────────────────

  async function uploadFile(file) {
    if (!currentTicketId) return

    const formData = new FormData()

    formData.append('file', file)

    formData.append(
      'clientEmail',
      CLIENT_EMAIL
    )

    formData.append(
      'apiKey',
      API_KEY
    )

    try {
      await fetch(
        `${HELPDESK_URL}/widget/tickets/${currentTicketId}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      )

      await fetchMessages()
    } catch (e) {
      console.error(e)
    }
  }

  // ─────────────────────────────────────────
  // Events
  // ─────────────────────────────────────────

  btn.addEventListener(
    'click',
    async () => {
      await initNotifications()

      panel.classList.toggle('open')

      if (
        panel.classList.contains('open')
      ) {
        loadConversations()

        showList()

        startPolling()
      }
    }
  )

  closeBtn.addEventListener(
    'click',
    () => {
      panel.classList.remove('open')
    }
  )

  backBtn.addEventListener(
    'click',
    () => {
      showList()
    }
  )

  newBtn.addEventListener(
    'click',
    async () => {
      showForm()

      await loadIssueTypes()
    }
  )

  sendBtn.addEventListener(
    'click',
    sendMessage
  )

  fileBtn.addEventListener(
    'click',
    () => {
      fileInput.click()
    }
  )

  fileInput.addEventListener(
    'change',
    handleFileUpload
  )

  inputEl.addEventListener(
    'keydown',
    e => {
      if (e.key === 'Enter') {
        e.preventDefault()
        sendMessage()
      }
    }
  )

  fileBtn.addEventListener(
    'click',
    () => {
      fileInput.click()
    }
  )

  // ─────────────────────────────────────────
  // Create ticket
  // ─────────────────────────────────────────

  document
    .getElementById(
      'hd-form-submit'
    )
    .addEventListener(
      'click',
      async () => {

        const subject =
          document
            .getElementById(
              'hd-subject'
            )
            .value.trim()

        const priority =
          document.getElementById(
            'hd-priority'
          ).value

        const issueTypeId = Number(
          issueTypeEl.value
        )

        const errorEl =
          document.getElementById(
            'hd-error'
          )

        errorEl.style.display = 'none'

        if (!subject) {
          errorEl.textContent =
            'Sujet requis'

          errorEl.style.display =
            'block'

          return
        }

        if (!issueTypeId) {
          errorEl.textContent =
            'Veuillez choisir un type de problème'

          errorEl.style.display =
            'block'

          return
        }

        try {
          const res = await fetch(
            `${HELPDESK_URL}/widget/ticket`,
            {
              method: 'POST',
              headers: {
                'Content-Type':
                  'application/json',
              },
              body: JSON.stringify({
                apiKey: API_KEY,
                clientEmail:
                  CLIENT_EMAIL,
                clientName:
                  CLIENT_NAME,
                subject,
                priority,
                issueTypeId,
              }),
            }
          )

          const data =
            await res.json()

          if (!res.ok) {
            errorEl.textContent =
              data.message || 'Erreur'

            errorEl.style.display =
              'block'

            return
          }

          const conversation = {
            ticketId: data.ticketId,
            subject,
            unread: 0,
            lastSupportCount: 0,
          }

          conversations.unshift(
            conversation
          )

          saveConversations()

          showChat(data.ticketId)
        } catch (e) {
          console.error(e)

          errorEl.textContent =
            'Impossible de créer le ticket'

          errorEl.style.display =
            'block'
        }
      }
    )
})()