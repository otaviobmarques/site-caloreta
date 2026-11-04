// Caloreta · efeitos do site (sem dependências). Respeita "reduzir movimento".
(() => {
  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // Ano no rodapé
  $$('[data-ano]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  // Barra de progresso e topo compacto
  const topo = $('.topo');
  const raiz = document.documentElement;
  let pedido = false;
  const aoRolar = () => {
    pedido = false;
    const max = raiz.scrollHeight - innerHeight;
    raiz.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : '0');
    topo.classList.toggle('rolado', scrollY > 20);
  };
  addEventListener('scroll', () => { if (!pedido) { pedido = true; requestAnimationFrame(aoRolar); } }, { passive: true });
  aoRolar();

  // Números que contam
  const formato = new Intl.NumberFormat('pt-BR');
  const contar = (el) => {
    const alvo = Number(el.dataset.contar);
    if (reduzir) { el.textContent = formato.format(alvo); return; }
    const dur = 1600, ini = performance.now();
    const passo = (t) => {
      const k = Math.min(1, (t - ini) / dur);
      el.textContent = formato.format(Math.round(alvo * (1 - Math.pow(1 - k, 4))));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };

  // Revelar na rolagem
  const revelar = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('visivel');
      $$('[data-contar]', e.target).forEach(contar);
      if (e.target.matches('[data-contar]')) contar(e.target);
      revelar.unobserve(e.target);
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
  $$('.revelar').forEach((el) => revelar.observe(el));
  // Número flutuante do herói conta depois que aparece
  const fNum = $('.f3 [data-contar]');
  if (fNum) setTimeout(() => contar(fNum), reduzir ? 0 : 2100);

  // Como funciona: o celular troca de tela conforme o passo em foco
  const camadas = $$('.tela-troca .camada');
  const passos = $$('.passo');
  const ativar = (i) => {
    passos.forEach((p, j) => p.classList.toggle('ativo', j === i));
    camadas.forEach((c) => c.classList.toggle('ativa', Number(c.dataset.camada) === i));
  };
  const observarPassos = new IntersectionObserver((entradas) => {
    for (const e of entradas) if (e.isIntersecting) ativar(Number(e.target.dataset.passo));
  }, { rootMargin: '-45% 0px -45% 0px' });
  passos.forEach((p) => observarPassos.observe(p));
  ativar(0);

  // Menu: seção atual
  const links = new Map($$('.menu a').map((a) => [a.getAttribute('href').slice(1), a]));
  const observarSecoes = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      const a = links.get(e.target.id);
      if (a) a.classList.toggle('atual', e.isIntersecting);
    }
  }, { rootMargin: '-50% 0px -50% 0px' });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) observarSecoes.observe(s); });

  if (reduzir) return;
  const ponteiroFino = matchMedia('(pointer: fine)').matches;

  // Herói: celular inclina e os cartões flutuantes seguem o mouse
  const visual = $('[data-inclinar]');
  if (visual && ponteiroFino) {
    const cel = $('.celular-heroi', visual);
    const flutuantes = $$('.flutuante', visual);
    $('.heroi').addEventListener('pointermove', (ev) => {
      const r = visual.getBoundingClientRect();
      const x = (ev.clientX - (r.left + r.width / 2)) / r.width;
      const y = (ev.clientY - (r.top + r.height / 2)) / r.height;
      cel.style.setProperty('--ry', `${(-10 + x * 16).toFixed(2)}deg`);
      cel.style.setProperty('--rx', `${(4 - y * 10).toFixed(2)}deg`);
      flutuantes.forEach((f, i) => {
        const k = (i + 1) * 10;
        f.style.setProperty('--mx', `${(x * k).toFixed(1)}px`);
        f.style.setProperty('--my', `${(y * k).toFixed(1)}px`);
      });
    });
    $('.heroi').addEventListener('pointerleave', () => {
      cel.style.removeProperty('--ry'); cel.style.removeProperty('--rx');
      flutuantes.forEach((f) => { f.style.removeProperty('--mx'); f.style.removeProperty('--my'); });
    });
  }

  // Cartões: brilho que segue o mouse
  if (ponteiroFino) {
    $$('[data-brilho]').forEach((c) => c.addEventListener('pointermove', (ev) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--bx', `${ev.clientX - r.left}px`);
      c.style.setProperty('--by', `${ev.clientY - r.top}px`);
    }));
  }

  // Galeria: arrastar com o mouse
  const trilho = $('.galeria-trilho');
  if (trilho && ponteiroFino) {
    let ini = 0, esq = 0, arrastando = false, moveu = false;
    trilho.addEventListener('pointerdown', (ev) => { arrastando = true; moveu = false; ini = ev.clientX; esq = trilho.scrollLeft; });
    addEventListener('pointermove', (ev) => {
      if (!arrastando) return;
      const d = ev.clientX - ini;
      if (Math.abs(d) > 4) { moveu = true; trilho.classList.add('arrastando'); }
      trilho.scrollLeft = esq - d;
    });
    addEventListener('pointerup', () => { arrastando = false; trilho.classList.remove('arrastando'); });
    trilho.addEventListener('click', (ev) => { if (moveu) ev.preventDefault(); }, true);
    trilho.addEventListener('dragstart', (ev) => ev.preventDefault());
  }
})();
