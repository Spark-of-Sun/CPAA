# CPAA – Configurable Personal AI Agent

## API Quick Reference

### OAuth Google Authorization

```bash
curl -X POST https://cpaa.hexelstudio.com/oauth/google/authorize \
  -H "Cookie: cpaa_session=YOUR_SESSION_TOKEN_HERE"
```

### WhatsApp Link

```bash
curl -X POST https://cpaa.hexelstudio.com/whatsapp/link \
  -H "Content-Type: application/json" \
  -H "Cookie: cpaa_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{"phone_number": "918660321292"}'
```

### WhatsApp Verify

```bash
curl -X POST https://cpaa.hexelstudio.com/whatsapp/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: cpaa_session=YOUR_SESSION_TOKEN_HERE" \
  -d '{"phone_number": "917300144244", "verification_code": "540798"}'
```

> Replace `YOUR_SESSION_TOKEN_HERE` with your actual session token value, and update the phone numbers and verification codes as needed.
> These commands are complete and can be executed directly in your terminal.
---

## Description

CPAA (Configurable Personal AI Agent) is a personal productivity assistant that connects with daily tools such as **Gmail, Google Calendar, Google Meet, and Slack**.
It helps manage **tasks, reminders, and to-do lists** by automatically extracting action items from emails, meetings, and chats.
The agent is **configurable**, allowing users to set custom rules and workflows to suit their individual needs.

---

## Features

* **Integrations**

  * Gmail → Convert important emails into tasks
  * Google Calendar → Sync deadlines and meeting reminders
  * Google Meet → Capture meeting notes and auto-generate tasks
  * Slack → Turn messages into to-do items

* **Task Management**

  * Unified to-do list from multiple sources
  * Automatic reminders and smart notifications
  * Prioritization of tasks based on rules

* **Configurable Agent**

  * Rule-based task creation (e.g., mark `urgent` emails as high priority)
  * Easy integration with future platforms

---

## Architecture

![CPAA Architecture](./images/CPAA.png)

---