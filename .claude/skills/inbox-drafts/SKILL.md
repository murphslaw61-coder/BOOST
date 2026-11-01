---
name: inbox-drafts
description: "Sort unread email into reply-needed, FYI, and ignore, then write reply drafts in the user's own voice saved straight to Drafts. Never sends anything. Uses the Gmail or Outlook connector in the Claude app; falls back to the user pasting emails in if no connector is available. Use when the user says /inbox-drafts, 'clear my inbox', 'draft replies to my email', 'sort my unread email', or is drowning in client email."
allowed-tools: Read, Write
metadata:
  argument-hint: "/inbox-drafts"
  user-invocable: true
---

# Inbox Drafts

Works through unread email, sorts it, and leaves reply drafts in the user's voice. **Never sends an email.** Every draft sits in the Drafts folder for the user to read and send themselves.

## Step 1: Check for a connector

Ask: "Do you have Gmail or Outlook connected in Claude? If not, here's how: click the **+** next to the message box, choose **Add connectors**, click **Browse connectors**, and add **Gmail** or **Outlook**. It takes about 30 seconds and doesn't need any password typed in, you just sign in with Google or Microsoft."

If they say yes, use the connected Gmail/Outlook tools to read unread messages.

If they say no, or the connector isn't available: fall back to **paste mode**. Ask the user to paste in their unread emails (sender, subject, and body for each, 5-10 at a time is plenty).

## Step 2: Learn the user's voice (quick)

Before drafting replies, get a sense of how the user writes. If they have a `~/.claude/brand-profile.md`, check its Tone section. Otherwise, ask for one real example: "Paste one email you've sent recently so I can match how you sound." If they don't have one handy, default to a warm, direct, no-fluff tone and say that's what you're using.

## Step 3: Sort every unread message into three piles

For each email (connector or pasted):
- **Reply needed**: a real person asking something, needs a response
- **FYI**: notifications, receipts, confirmations, no reply needed
- **Ignore**: newsletters, cold sales pitches, spam-adjacent marketing

Show the user the three piles as a short list (sender + subject line each) before writing anything.

## Step 4: Write reply drafts for everything in "Reply needed"

For each one:
- Write a reply in the user's voice (from Step 2)
- Keep it short and direct, matching how a real person replies to email, not a formal letter
- Reference the actual content of the email you're replying to, never a generic "thanks for reaching out"
- If the connector is available: **save it as a draft** using the connector's draft/reply-draft tool. Do not send it.
- If paste mode: write the draft as plain text under the email it answers, labeled clearly, so the user can copy it into their own email client.

## Step 5: Report back

Tell the user:
- How many emails were FYI, ignore, and reply-needed
- How many drafts were created and where to find them (their Drafts folder, or in this chat if paste mode)
- A one-line reminder: "Nothing was sent. Open Drafts, read them over, and hit send yourself."

## You're done when

Every "reply needed" email has a draft written in the user's voice sitting in Drafts (or shown in chat for paste mode), nothing has been sent, and the user knows exactly where to go to review and send them.
