async function fetchSnippets() {
  try {
    const res = await fetch(`${RAW_BASE}/${SNIPPETS_FILE}?t=${Date.now()}`);
    if (!res.ok) throw new Error('fetch failed');
    return await res.json();
  } catch {
    return { snippets: [], lastUpdated: null };
  }
}

function langColor(lang = '') {
  const map = {
    'JavaScript': '#f7df1e', 'TypeScript': '#3178c6', 'Python': '#3572a5',
    'HTML': '#e34c26', 'CSS': '#563d7c', 'PHP': '#4f5d95',
    'Java': '#b07219', 'C++': '#f34b7d', 'C#': '#178600',
    'Go': '#00add8', 'Rust': '#dea584', 'Ruby': '#701516',
    'Swift': '#ff6600', 'Kotlin': '#a97bff', 'Bash': '#89e051',
    'SQL': '#e38c00', 'JSON': '#9ece6a', 'YAML': '#7dcfff',
  };
  return map[lang] || '#c0caf5';
}

function langClass(lang = '') {
  const map = {
    'JavaScript': 'javascript', 'TypeScript': 'typescript',
    'Python': 'python', 'HTML': 'html', 'CSS': 'css',
    'PHP': 'php', 'Java': 'java', 'C++': 'cpp',
    'C#': 'csharp', 'Go': 'go', 'Rust': 'rust',
    'Ruby': 'ruby', 'Bash': 'bash', 'SQL': 'sql',
    'JSON': 'json', 'YAML': 'yaml',
  };
  return map[lang] || 'plaintext';
}

function esc(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'Baru saja';
  if (m < 60) return `${m}m lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}j lalu`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}h lalu`;
  return new Date(ts).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'});
}

function snippetCard(s, withOpen = false) {
  const color   = langColor(s.language || 'JavaScript');
  const lines   = (s.code || '').split('\n').length;
  const preview = (s.code || '').split('\n').slice(0,3).join('\n');
  const onclickAttr = withOpen ? `onclick="openModal('${s.id}')" style="cursor:pointer"` : '';
  return `
    <div class="snippet-card reveal-up" ${onclickAttr}>
      <div class="card-top">
        <div class="card-lang-badge" style="background:${color}18;color:${color};border-color:${color}40">
          ${esc(s.language || 'JavaScript')}
        </div>
      </div>
      <div class="card-title">${esc(s.title)}</div>
      <div class="card-preview"><pre>${esc(preview)}${lines > 3 ? '\n...' : ''}</pre></div>
      <div class="card-foot">
        <span class="card-author">@${esc(s.author)}</span>
        <span class="card-meta">${lines} baris · ${timeAgo(s.createdAt)}</span>
      </div>
      ${withOpen ? `<div class="card-hover-hint"><i class="fa-solid fa-eye"></i> Lihat Code</div>` : ''}
    </div>`;
}

function initNav() {
  const ham  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  const nav  = document.getElementById('nav');

  if (ham && menu) {
    ham.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      ham.classList.toggle('active', open);
    });
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        menu.classList.remove('open');
        ham.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function revealOnScroll() {
  const els = document.querySelectorAll('.reveal-up:not(.visible)');
  const io  = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06 });
  els.forEach(el => io.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
  revealOnScroll();
});
