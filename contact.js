// Contact: a small card that pops over the page instead of a section of its
// own. Any [data-contact] opens it; Escape, the backdrop or Close shuts it.

// Paste a form endpoint here (e.g. https://formspree.io/f/xxxx) to have
// messages delivered straight to your inbox. Left empty, Send opens the
// visitor's email app with the message filled in.
const MESSAGE_ENDPOINT = '';

const contact = document.createElement('dialog');
contact.className = 'contact';
contact.setAttribute('aria-labelledby', 'contact-title');
contact.innerHTML = `<div class="contact__stack">
  <div class="contact__card" tabindex="-1" autofocus>
    <figure class="contact__photo" aria-hidden="true"><img src="images/me.webp" alt="" width="640" height="640" draggable="false"></figure>
    <h2 class="contact__title" id="contact-title">Come say hi<i class="dot"></i></h2>
    <dl class="contact__grid">
      <div><dt>Work history, the long version</dt><dd><a href="https://www.linkedin.com/in/michael-xie-32806a171" target="_blank" rel="noopener">LinkedIn &#8599;</a><a href="Michael-Xie-Resume.pdf" target="_blank" rel="noopener">Resume (PDF) &#8599;</a></dd></div>
      <div><dt>Things I&rsquo;ve built</dt><dd><a href="https://github.com/fei7fei" target="_blank" rel="noopener">GitHub &#8599;</a></dd></div>
      <div><dt>Looking for</dt><dd>Co-op terms of 4, 8 or 12 months<small>Vancouver, Canada</small></dd></div>
    </dl>
    <form class="contact__form" novalidate>
      <p class="contact__label">Send me a message</p>
      <div class="contact__row">
        <label><span>Name</span><input name="name" autocomplete="name" required></label>
        <label><span>Email</span><input name="email" type="email" autocomplete="email" required></label>
      </div>
      <label><span>Message</span><textarea name="message" rows="3" required></textarea></label>
      <input class="contact__trap" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true">
      <div class="contact__send">
        <button type="submit">Send <span aria-hidden="true">&rarr;</span></button>
        <p class="contact__status" role="status" aria-live="polite"></p>
      </div>
    </form>
    <button class="contact__close" type="button" data-close>Close <span aria-hidden="true">&times;</span></button>
  </div>
  <aside class="contact__credits" aria-labelledby="credits-title">
    <h3 class="contact__credits-title" id="credits-title">Credits</h3>
    <p>This site takes its cues from two places I keep coming back to.</p>
    <dl>
      <div><dt>Inspired by</dt><dd><a href="https://nothing.tech" target="_blank" rel="noopener">Nothing &#8599;</a><small>Dot-matrix type and red accents</small></dd>
        <dd><a href="https://huyml.co" target="_blank" rel="noopener">Huy Phan, huyml.co &#8599;</a><small>Portfolio layout and motion</small></dd></div>
      <div><dt>Type</dt><dd>Archivo, Doto &amp; Space Mono</dd></div>
      <div><dt>Design &amp; build</dt><dd>Michael Xie</dd></div>
    </dl>
  </aside>
</div>`;
document.body.append(contact);

// Assembled here so the address isn't sitting in the HTML for scrapers.
const addr = ['michaelxie04', 'gmail.com'].join('@');
const form = contact.querySelector('.contact__form');
const status = contact.querySelector('.contact__status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const field = [...form.querySelectorAll('[required]')].find((el) => !el.checkValidity());
  if (field) {
    status.textContent = field.name === 'email' && field.value ? 'That email doesn’t look right.' : `Add your ${field.name} first.`;
    return field.focus();
  }
  const data = new FormData(form);
  if (!MESSAGE_ENDPOINT) {
    const subject = `Hello from ${data.get('name')}`;
    const body = `${data.get('message')}\n\n${data.get('name')} (${data.get('email')})`;
    location.href = `mailto:${addr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    status.textContent = 'Opening your email app…';
    return;
  }
  form.classList.add('is-sending');
  status.textContent = 'Sending…';
  try {
    const res = await fetch(MESSAGE_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = 'Sent. Thanks, I’ll get back to you soon.';
  } catch {
    status.textContent = `Couldn’t send that. Try ${addr} instead.`;
  } finally {
    form.classList.remove('is-sending');
  }
});

function openContact(e) {
  e?.preventDefault();
  if (contact.open) return;
  contact.classList.remove('is-closing');
  status.textContent = '';
  contact.showModal();
}

// Let the cards fall away before the dialog actually closes.
function closeContact() {
  if (!contact.open || contact.classList.contains('is-closing')) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return contact.close();
  contact.classList.add('is-closing');
  contact.querySelector('.contact__card').addEventListener('animationend', () => {
    contact.classList.remove('is-closing');
    contact.close();
  }, { once: true });
}

document.addEventListener('click', (e) => {
  if (e.target.closest('[data-contact]')) openContact(e);
});
contact.addEventListener('cancel', (e) => { e.preventDefault(); closeContact(); });
contact.addEventListener('click', (e) => {
  // Anything outside the two cards is the backdrop.
  if (!e.target.closest('.contact__card, .contact__credits') || e.target.closest('[data-close]')) closeContact();
});
