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

// Planos lidos do banco (preço, fotos e recursos editados no painel do admin). Se não carregar, fica o texto da página.
(() => {
  const SUPABASE = 'https://ugvkxgahuxgkljwfpnca.supabase.co';
  const CHAVE_PUBLICA = 'sb_publishable_9eaDD7t54jvpa-P3m99joQ_WqJYeE5C'; // chave pública (só lê o catálogo de planos)
  const NOME_RECURSO = {
    macros: 'Proteína, carboidrato e gordura',
    peso: 'Peso e tendência',
    foto_como_receita: 'Salvar foto como receita',
    cabe_no_meu_dia: '“Cabe no meu dia” nas receitas',
  };
  const NOME_MEIO = { pix: 'Pix', cartao: 'cartão de crédito', boleto: 'boleto' };
  const real = (c) => (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: c % 100 ? 2 : 0 });
  const lista = (itens) => itens.map((t) => { const li = document.createElement('li'); li.textContent = t; return li; });
  const juntar = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ou ${xs[xs.length - 1]}`);
  const h = { apikey: CHAVE_PUBLICA, Authorization: `Bearer ${CHAVE_PUBLICA}` };

  Promise.all([
    fetch(`${SUPABASE}/rest/v1/planos?select=id,nome,preco_centavos,fotos_limite,fotos_periodo,receitas_limite,recursos&order=preco_centavos`, { headers: h }).then((r) => (r.ok ? r.json() : null)),
    fetch(`${SUPABASE}/rest/v1/rpc/meios_pagamento_web`, { method: 'POST', headers: { ...h, 'content-type': 'application/json' }, body: '{}' }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]).then(([planos, meios]) => {
    if (!Array.isArray(planos) || !planos.length) return;
    const formas = Array.isArray(meios?.meios) ? meios.meios.map((m) => NOME_MEIO[m]).filter(Boolean) : ['Pix', 'cartão de crédito'];
    const ativos = new Set(planos.map((p) => p.id));
    document.querySelectorAll('[data-plano]').forEach((card) => {
      const p = planos.find((x) => x.id === card.dataset.plano);
      if (!ativos.has(card.dataset.plano)) { card.remove(); return; }
      card.querySelector('h3').textContent = p.nome;
      const preco = card.querySelector('.preco');
      preco.innerHTML = '';
      const b = document.createElement('b'); b.textContent = real(p.preco_centavos); preco.append(b);
      if (p.preco_centavos > 0) { const s = document.createElement('span'); s.textContent = '/mês'; preco.append(s); }
      const r = p.recursos || {};
      const itens = [
        `${p.fotos_limite} ${p.fotos_limite === 1 ? 'foto' : 'fotos'} com IA por ${p.fotos_periodo === 'dia' ? 'dia' : 'semana'}`,
        'Busca, favoritos e repetir sem limite',
        p.receitas_limite === null ? 'Receitas ilimitadas' : `Até ${p.receitas_limite} receitas suas`,
        ...Object.keys(NOME_RECURSO).filter((k) => r[k]).map((k) => NOME_RECURSO[k]),
      ];
      if (p.preco_centavos === 0) itens.push('Água e resumo da semana');
      card.querySelector('.lista-check').replaceChildren(...lista(itens));
    });
    const nota = document.querySelector('[data-nota-planos]');
    if (nota && formas.length) nota.textContent = `Pague com ${juntar(formas)}. Cancele quando quiser, sem multa.`;
  }).catch(() => {});
})();
