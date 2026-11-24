// Contact modal + form, shared by every page.
(function () {
  const modal = document.getElementById('contact-modal');
  if (!modal) return;
  const openModal  = () => { modal.classList.add('open');    document.body.style.overflow = 'hidden'; };
  const closeModal = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };

  ['open-contact', 'footer-contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', e => { e.preventDefault(); openModal(); });
  });
  document.getElementById('modal-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const form = document.getElementById('contact-form');
  const submitBtn = document.getElementById('submit-btn');
  const formSuccess = document.getElementById('form-success');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.textContent = 'Sending…'; submitBtn.disabled = true;
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
      if (res.ok) { submitBtn.style.display = 'none'; formSuccess.style.display = 'block'; form.reset(); }
      else { submitBtn.textContent = 'Something went wrong'; submitBtn.disabled = false; }
    } catch { submitBtn.textContent = 'Network error, try again'; submitBtn.disabled = false; }
  });
})();
