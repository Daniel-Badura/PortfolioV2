import ContactForm from '../components/ContactForm';
import { profile } from '../content/profile';

export default function ContactScreen() {
  return (
    <div className="container page-content contact-page">
      <div className="page-heading"><p className="eyebrow mono">Contact</p><h1>Get in touch.</h1><p>Have a DevOps or Platform Engineering opportunity in mind? Send me a message with a little context about the role, team or project.</p></div>
      <section className="contact-methods" aria-labelledby="message-heading">
        <div className="primary-contact">
          <div className="contact-form-heading"><p className="eyebrow mono">01 / Message</p><h2 id="message-heading">Start a conversation.</h2></div>
          <ContactForm />
        </div>
        <div className="contact-profiles">
          <a href={profile.linkedin}><span className="eyebrow mono">02 / Professional profile</span><strong>LinkedIn <span aria-hidden="true">↗</span></strong><span>Connect and start a conversation.</span></a>
          <a href={profile.github}><span className="eyebrow mono">03 / Source code</span><strong>GitHub <span aria-hidden="true">↗</span></strong><span>Explore my repositories and projects.</span></a>
        </div>
      </section>
    </div>
  );
}
