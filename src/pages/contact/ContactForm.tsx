/**
 * Contact form — accessible and dependency-free.
 *
 * ArthVeda is a fully static site with no backend, so rather than pretending to
 * POST to a server, the form composes a pre-filled email to the existing
 * contact address via the visitor's mail client — the site's real contact
 * mechanism. Native `required` validation runs first (no JS needed to enforce
 * it), and the submit handler only executes on the client, so the component is
 * safe when prerendered to static markup (event handlers are simply dropped and
 * `window` is never touched during render).
 */

import { useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import { CONTACT_EMAIL } from './contactContent';
import { TESTIDS } from '../../lib/testids';

const FIELD_CLASS =
  'mt-1.5 w-full rounded-[var(--radius-control)] border border-hairline bg-canvas px-3 py-2.5 ' +
  'text-sm text-ink placeholder:text-ink-secondary transition-colors ' +
  'focus:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent';

const LABEL_CLASS = 'block font-mono text-[11px] uppercase tracking-[0.16em] text-ink-secondary';

export function ContactForm() {
  const [opened, setOpened] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const subject = String(data.get('subject') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();

    const mailSubject = `[ArthVeda] ${subject}`;
    const mailBody = `Name: ${name}\nEmail: ${email}\n\n${message}`;
    const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      mailSubject,
    )}&body=${encodeURIComponent(mailBody)}`;

    if (typeof window !== 'undefined') {
      window.location.href = href;
    }
    setOpened(true);
  };

  return (
    <form onSubmit={handleSubmit} data-testid={TESTIDS.contactForm} className="mt-6 space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={LABEL_CLASS}>
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Your name"
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={LABEL_CLASS}>
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className={FIELD_CLASS}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-subject" className={LABEL_CLASS}>
          Subject
        </label>
        <input
          id="contact-subject"
          name="subject"
          type="text"
          required
          placeholder="What is this about?"
          className={FIELD_CLASS}
        />
      </div>

      <div>
        <label htmlFor="contact-message" className={LABEL_CLASS}>
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="How can we help?"
          className={`${FIELD_CLASS} resize-y`}
          aria-describedby="contact-form-note"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="submit"
          data-testid={TESTIDS.contactFormSubmit}
          className="
            inline-flex items-center justify-center gap-2 rounded-[var(--radius-control)]
            border border-accent bg-accent px-5 py-2.5 text-sm font-semibold text-white
            transition-colors hover:bg-accent-hover
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          "
        >
          <Send size={16} strokeWidth={2} aria-hidden="true" />
          Send Message
        </button>
        <p id="contact-form-note" aria-live="polite" className="font-mono text-[11px] text-ink-secondary">
          {opened
            ? 'Opening your email app to send your message…'
            : `This opens your email app addressed to ${CONTACT_EMAIL}.`}
        </p>
      </div>
    </form>
  );
}
