/* Nexa Lead call request form. Used on the homepage and the contact page. */
(function () {
  var FORM_ENDPOINT = 'https://formspree.io/f/mrpbnzrq';
  var form = document.getElementById('form');
  if (!form) return;
  var out = document.getElementById('f_out'), btn = document.getElementById('f_btn');
  var yr = document.getElementById('yr'); if (yr) yr.textContent = new Date().getFullYear();

  function show(ok, text) {
    out.innerHTML = '';
    var d = document.createElement('div');
    d.className = 'note' + (ok ? '' : ' err');
    d.setAttribute('role', ok ? 'status' : 'alert');
    d.textContent = text;
    out.appendChild(d);
  }
  function mark(el, bad) { if (bad) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid'); }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    if (fd.get('company_website')) return;
    var name = (fd.get('name') || '').trim(), biz = (fd.get('business') || '').trim(), phone = (fd.get('phone') || '').trim();
    var fields = { name: form.elements.name, business: form.elements.business, phone: form.elements.phone };
    mark(fields.name, !name); mark(fields.business, !biz); mark(fields.phone, !phone);
    if (!name || !biz || !phone) {
      show(false, 'Add your name, business name, and phone number so we can reach you.');
      (!name ? fields.name : !biz ? fields.business : fields.phone).focus();
      return;
    }
    btn.disabled = true;
    var label = btn.textContent; btn.textContent = 'Sending';
    fetch(FORM_ENDPOINT, { method: 'POST', body: fd, headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('bad status');
        show(true, 'Thanks, ' + name + '. We will reach out within one business day to set up your call.');
        form.reset();
      })
      .catch(function () {
        show(false, 'Your request did not send. Check your connection and try again.');
      })
      .then(function () { btn.disabled = false; btn.textContent = label; });
  });
})();
