import { useEffect, useRef, type FormEvent } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import { formspreeEndpoint, formspreeId } from '../content/contact';

export default function ContactForm() {
  const [state, handleSubmit, reset] = useForm(formspreeId);
  const inFlight = useRef(false);
  const feedback = useRef<HTMLDivElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.succeeded || state.errors) feedback.current?.focus();
  }, [state.succeeded, state.errors]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    inFlight.current = true;
    try { await handleSubmit(new FormData(event.currentTarget)); }
    finally { inFlight.current = false; }
  }

  if (state.succeeded) {
    return (
      <div className="contact-success" ref={feedback} tabIndex={-1} role="status">
        <p className="eyebrow mono">Message submitted</p>
        <h3>Thank you for getting in touch.</h3>
        <p>Your message has been submitted successfully. I’ll reply to the email address you provided.</p>
        <button className="button" type="button" onClick={() => {
          reset();
          requestAnimationFrame(() => nameInput.current?.focus());
        }}>Write another message <span aria-hidden="true">→</span></button>
      </div>
    );
  }

  const fieldError = (field: string) => Boolean(state.errors?.getFieldErrors(field).length);
  return (
    <form className="contact-form" action={formspreeEndpoint} method="POST" onSubmit={submit} aria-labelledby="message-heading" aria-describedby="form-privacy" aria-busy={state.submitting}>
      <p className="form-hint">All fields are required.</p>
      <fieldset disabled={state.submitting}>
        <legend className="sr-only">Your contact details and message</legend>
        <div className="contact-fields">
          <div className="form-field">
            <label htmlFor="contact-name">Your name</label>
            <input ref={nameInput} id="contact-name" name="name" autoComplete="name" required maxLength={120} aria-invalid={fieldError('name') || undefined} aria-describedby={fieldError('name') ? 'name-error' : undefined} />
            <ValidationError id="name-error" className="field-error" field="name" errors={state.errors} />
          </div>
          <div className="form-field">
            <label htmlFor="contact-email">Email address</label>
            <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} aria-invalid={fieldError('email') || undefined} aria-describedby={fieldError('email') ? 'email-error' : undefined} />
            <ValidationError id="email-error" className="field-error" field="email" errors={state.errors} />
          </div>
        </div>
        <div className="form-field">
          <label htmlFor="contact-message">Message</label>
          <textarea id="contact-message" name="message" rows={6} required minLength={10} maxLength={5000} placeholder="Tell me about the role, team or project…" aria-invalid={fieldError('message') || undefined} aria-describedby={fieldError('message') ? 'message-hint message-error' : 'message-hint'} />
          <p id="message-hint" className="form-hint">10–5,000 characters. Please don’t include passwords or sensitive information.</p>
          <ValidationError id="message-error" className="field-error" field="message" errors={state.errors} />
        </div>
        <div className="form-honeypot" aria-hidden="true">
          <label htmlFor="contact-website">Leave this field empty</label>
          <input id="contact-website" name="_gotcha" tabIndex={-1} autoComplete="off" />
        </div>
        <input type="hidden" name="_subject" value="Portfolio — new contact message" />
        <p id="form-privacy" className="form-privacy">Your name, email and message will be sent through Formspree so I can respond to your enquiry. <a href="https://formspree.io/legal/privacy-policy/">Formspree privacy policy</a>.</p>
        <button className="button" type="submit" disabled={state.submitting}>{state.submitting ? 'Sending…' : 'Send message'} <span aria-hidden="true">↗</span></button>
      </fieldset>
      {state.errors && <div className="notice form-error" role="alert" ref={feedback} tabIndex={-1}>
        {state.errors.getAllFieldErrors().length > 0
          ? 'Please check the highlighted fields and try again.'
          : 'We couldn’t confirm your submission. Your message has been kept. Please try again later, or contact me on LinkedIn below.'}
      </div>}
    </form>
  );
}
