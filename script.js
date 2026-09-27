const vlanData = {
  1: { name: 'Management Department', network: '192.168.1.0/24', gateway: '192.168.1.1', role: 'Administrative access', warning: true },
  2: { name: 'Administrative Department', network: '192.168.2.0/24', gateway: '192.168.2.1', role: 'Departmental users', warning: false },
  3: { name: 'Maintenance Department', network: '192.168.3.0/24', gateway: '192.168.3.1', role: 'Departmental users', warning: false },
  4: { name: 'Account Department', network: '192.168.4.0/24', gateway: '192.168.4.1', role: 'Sensitive business data', warning: false },
  5: { name: 'Works Department', network: '192.168.5.0/24', gateway: '192.168.5.1', role: 'Departmental users', warning: false }
};

const header = document.querySelector('.site-header');
const menuBtn = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');

window.addEventListener('scroll', () => header.classList.toggle('scrolled', window.scrollY > 12));
menuBtn?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  menuBtn?.setAttribute('aria-expanded','false');
}));

const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll('.main-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -58% 0px' });
document.querySelectorAll('main section[id]').forEach(s => sectionObserver.observe(s));

function renderVlan(id) {
  const d = vlanData[id];
  if (!d) return;
  document.querySelectorAll('.vlan-card').forEach(card => card.classList.toggle('active', card.dataset.vlan === String(id)));
  document.querySelectorAll('.vlan-node').forEach(node => node.classList.toggle('active', node.dataset.vlan === String(id)));
  const detail = document.getElementById('vlanDetail');
  detail.innerHTML = `
    <div class="detail-top"><span class="detail-badge">VLAN ${id}</span>${d.warning ? '<span class="risk-badge">Management domain</span>' : '<span class="risk-badge">Segmented zone</span>'}</div>
    <h3>${d.name}</h3>
    <div class="detail-grid">
      <div><span>Network</span><strong>${d.network}</strong></div>
      <div><span>Gateway</span><strong>${d.gateway}</strong></div>
      <div><span>Encapsulation</span><strong>802.1Q</strong></div>
      <div><span>Trust role</span><strong>${d.role}</strong></div>
    </div>
    ${d.warning ? '<div class="detail-warning"><span>!</span><p><strong>Known design weakness:</strong> the report identifies VLAN 1 as a remaining access path to the management domain. A production deployment should avoid relying on VLAN 1 for management or native traffic.</p></div>' : '<div class="detail-warning"><span>i</span><p><strong>Policy principle:</strong> membership in a VLAN provides logical separation, while inter-VLAN access remains dependent on routing and filtering policy.</p></div>'}
  `;
}
document.querySelectorAll('.vlan-card, .vlan-node').forEach(el => el.addEventListener('click', () => renderVlan(el.dataset.vlan)));

const runPolicy = document.getElementById('runPolicy');
runPolicy?.addEventListener('click', () => {
  const src = document.getElementById('sourceVlan').value;
  const dst = document.getElementById('destVlan').value;
  const permit = document.getElementById('permitRule').checked;
  const output = document.getElementById('policyOutput');
  const same = src === dst;
  const allowed = same || permit;
  output.classList.toggle('allowed', allowed);
  output.classList.toggle('denied', !allowed);
  output.innerHTML = allowed
    ? `<div class="result-icon">✓</div><div><span>POLICY RESULT</span><strong>PERMITTED</strong><p>${same ? 'Source and destination are inside the same VLAN, so no inter-VLAN ACL decision is required for this conceptual test.' : 'An explicit ACL permit has been enabled for this demonstration, so the cross-VLAN flow is allowed.'}</p></div>`
    : `<div class="result-icon">×</div><div><span>POLICY RESULT</span><strong>DENIED</strong><p>VLAN ${src} → VLAN ${dst} is treated as blocked because no explicit cross-VLAN permit is present.</p></div>`;
});

const modal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const modalCaption = document.getElementById('modalCaption');
function openImage(src, caption) {
  modalImage.src = src;
  modalCaption.textContent = caption;
  modal.showModal();
}
document.querySelectorAll('.image-button').forEach(btn => btn.addEventListener('click', () => openImage(btn.dataset.image, btn.dataset.caption)));
document.getElementById('openOriginal')?.addEventListener('click', () => openImage('assets/packet-tracer-topology.png', 'Original Packet Tracer VLAN topology from the project report.'));
document.querySelector('.modal-close')?.addEventListener('click', () => modal.close());
modal?.addEventListener('click', e => { if (e.target === modal) modal.close(); });
