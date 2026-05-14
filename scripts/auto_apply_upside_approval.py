#!/usr/bin/env python3
"""
Poll an IMAP inbox for an Upside approval reply and automatically apply the approved text to
`public/gig-worker-faq-2026.html` by removing the pending note and replacing the Upside paragraph
if an approved text file is present.

Configure via environment variables:
  IMAP_HOST - e.g. outlook.office365.com
  IMAP_USER - email username
  IMAP_PASS - email password or app password
  APPROVAL_FROM - optional: only consider messages from this address
  APPROVAL_KEYWORDS - optional comma-separated keywords (default: approved,permission,ok to publish)
  APPROVED_TEXT_FILE - optional path to file with final approved paragraph (default: docs/upside-approved.txt)

Usage:
  IMAP_HOST=... IMAP_USER=... IMAP_PASS=... python3 scripts/auto_apply_upside_approval.py

Notes:
  - This script makes a local git commit when it modifies the HTML file. It does NOT push.
  - For a production setup, run this as a cron job or small service and secure your credentials.
"""

import os
import imaplib
import email
import re
import subprocess
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s: %(message)s')


def get_env(name: str, default: Optional[str] = None) -> Optional[str]:
    return os.environ.get(name, default)


def search_approval_messages(imap, from_addr: Optional[str], keywords):
    criteria = ['UNSEEN']
    if from_addr:
        criteria.append('FROM "{}"'.format(from_addr))
    search_crit = ' '.join(criteria)
    logging.info('IMAP search criteria: %s', search_crit)
    typ, data = imap.search(None, *criteria)
    if typ != 'OK':
        logging.error('IMAP search failed: %s', typ)
        return []
    ids = data[0].split()
    matches = []
    for msgid in ids:
        typ, msgdata = imap.fetch(msgid, '(RFC822)')
        if typ != 'OK':
            continue
        msg = email.message_from_bytes(msgdata[0][1])
        body = get_body_text(msg)
        if body and any(k.lower() in body.lower() for k in keywords):
            matches.append((msgid, msg, body))
    return matches


def get_body_text(msg):
    if msg.is_multipart():
        for part in msg.walk():
            ctype = part.get_content_type()
            disp = str(part.get('Content-Disposition'))
            if ctype == 'text/plain' and 'attachment' not in disp:
                return part.get_payload(decode=True).decode(part.get_content_charset('utf-8'), errors='replace')
    else:
        return msg.get_payload(decode=True).decode(msg.get_content_charset('utf-8'), errors='replace')
    return None


def apply_approved_text(html_path: str, approved_text_path: Optional[str]):
    logging.info('Applying approved text to %s', html_path)
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()

    # Remove the pending note paragraph (exact marker added earlier)
    pending_note_pattern = re.compile(r"<p[^>]*><em>Note: This paragraph references Upside[\s\S]*?</em></p>", re.IGNORECASE)
    html_new, nsub = pending_note_pattern.subn('', html)
    if nsub:
        logging.info('Removed pending note (%d occurrence(s))', nsub)
    else:
        logging.info('No pending note found to remove')

    # If an approved text file is present, replace the Upside paragraph content
    if approved_text_path and os.path.exists(approved_text_path):
        approved = open(approved_text_path, 'r', encoding='utf-8').read().strip()
        # Escape for HTML (minimal)
        approved_html = '<p>\n                ' + approved + '\n              </p>'
        # Find the existing Upside paragraph block and replace it
        upside_para_pattern = re.compile(r"<p>\s*Upside has worked with[\s\S]*?</p>", re.IGNORECASE)
        html_new, nup = upside_para_pattern.subn(approved_html, html_new)
        if nup:
            logging.info('Replaced Upside paragraph with approved text (%d occurrence(s))', nup)
        else:
            logging.info('Could not find Upside paragraph to replace; approved text not inserted')

    if html_new != html:
        with open(html_path, 'w', encoding='utf-8') as f:
            f.write(html_new)
        logging.info('Wrote updated HTML file')
        # Commit changes
        try:
            subprocess.run(['git', 'add', html_path], check=True)
            subprocess.run(['git', 'commit', '-m', 'Apply Upside-approved copy to FAQ page'], check=True)
            logging.info('Committed changes to git (local only)')
        except subprocess.CalledProcessError as e:
            logging.error('Git commit failed: %s', e)
    else:
        logging.info('No changes made to HTML')


def main():
    imap_host = get_env('IMAP_HOST')
    imap_user = get_env('IMAP_USER')
    imap_pass = get_env('IMAP_PASS')
    from_addr = get_env('APPROVAL_FROM')
    keywords_env = get_env('APPROVAL_KEYWORDS', 'approved,permission,ok to publish')
    keywords = [k.strip() for k in keywords_env.split(',') if k.strip()]
    approved_file = get_env('APPROVED_TEXT_FILE', 'docs/upside-approved.txt')

    if not (imap_host and imap_user and imap_pass):
        logging.error('IMAP_HOST, IMAP_USER, and IMAP_PASS environment variables are required')
        return

    logging.info('Connecting to IMAP host %s as %s', imap_host, imap_user)
    try:
        imap = imaplib.IMAP4_SSL(imap_host)
        imap.login(imap_user, imap_pass)
        imap.select('INBOX')
        matches = search_approval_messages(imap, from_addr, keywords)
        if not matches:
            logging.info('No approval messages found')
            imap.logout()
            return

        # Use the first matching message
        msgid, msg, body = matches[0]
        logging.info('Found approval message (id=%s). Applying approved text.', msgid.decode() if isinstance(msgid, bytes) else msgid)
        apply_approved_text('public/gig-worker-faq-2026.html', approved_file)

        # Mark the message as Seen and optionally add a flag
        try:
            imap.store(msgid, '+FLAGS', '\\Seen')
            logging.info('Marked message seen')
        except Exception as e:
            logging.warning('Could not mark message seen: %s', e)

        imap.logout()

    except Exception as e:
        logging.error('IMAP error: %s', e)


if __name__ == '__main__':
    main()
