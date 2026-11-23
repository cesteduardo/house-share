/* Entre · comportamento da landing page.
   Um único agendador de quadro: eventos só gravam estado; a escrita no DOM acontece uma vez
   por quadro, e só quando algo mudou. Nenhum loop contínuo; em repouso, nada roda. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var dataLayer = (window.dataLayer = window.dataLayer || []);
  function byId(id) { return doc.getElementById(id); }
  function track(name, extra) {
    var e = { event: name };
    if (extra) for (var k in extra) e[k] = extra[k];
    dataLayer.push(e);
  }

  /* ---------- agendador central ---------- */
  var SUJO_SIM = 1, SUJO_CASA = 2, SUJO_DOCA = 4;
  var sujo = 0, raf = 0;
  function agendar(f) { sujo |= f; if (!raf) raf = requestAnimationFrame(quadro); }
  function quadro() {
    raf = 0;
    var s = sujo; sujo = 0;
    if (s & SUJO_SIM) desenharSim();
    if (s & SUJO_CASA) desenharPlanta();
    if (s & SUJO_DOCA) desenharDoca();
  }

  /* ---------- a planta: segue só o seletor de pessoas, nunca anda sozinha ---------- */
  var PALAVRAS = ['', '', 'duas', 'três', 'quatro'];
  var planta = { n: 3, mostrado: 3 };
  var figHeroi = doc.querySelector('.js-planta');
  var vaga = byId('sim-planta');
  if (figHeroi && vaga) {
    var copia = figHeroi.cloneNode(true);
    copia.classList.remove('heroi-card__planta');
    var svg = copia.querySelector('svg');
    svg.removeAttribute('role'); svg.removeAttribute('aria-labelledby'); svg.setAttribute('aria-hidden', 'true'); svg.setAttribute('focusable', 'false');
    var t = svg.querySelector('title'); if (t) t.parentNode.removeChild(t);
    vaga.appendChild(copia);
  }
  var figuras = Array.prototype.slice.call(doc.querySelectorAll('.js-planta'));
  var palavras = Array.prototype.slice.call(doc.querySelectorAll('.js-n-palavra'));
  function desenharPlanta() {
    if (planta.mostrado === planta.n) return;
    planta.mostrado = planta.n;
    var v = String(planta.n), i;
    for (i = 0; i < figuras.length; i++) figuras[i].setAttribute('data-n', v);
    for (i = 0; i < palavras.length; i++) palavras[i].textContent = PALAVRAS[planta.n];
  }
  function definirPlanta(n) { if (n !== planta.n) { planta.n = n; agendar(SUJO_CASA); } }

  /* ---------- simulador: um estado, dois painéis (topo e seção) ---------- */
  var BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  var INT = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
  var DEC = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });
  var ESCALA = ['', '', 'scaleX(.5)', 'scaleX(.3333)', 'scaleX(.25)'];
  var LIM = { valor: [200000, 2000000], entrada: [20, 60], prazo: [5, 35] };
  var VT = {
    valor: function (v) { return BRL.format(v); },
    entrada: function (v) { return v + '%'; },
    prazo: function (v) { return v + ' anos'; }
  };
  var sim = { valor: 600000, n: 3, entrada: 20, prazo: 30, juros: 11.5 };
  var origem = null; /* controle que gerou a mudança: não é reescrito no mesmo quadro */

  var faixas = Array.prototype.slice.call(doc.querySelectorAll('input.faixa[data-key]'));
  var textos = Array.prototype.slice.call(doc.querySelectorAll('.campo__num input[data-key]'));
  var radios = Array.prototype.slice.call(doc.querySelectorAll('input[name="n"], input[name="hn"]'));
  var juros = byId('sim-juros');
  var o = {
    entrada: byId('out-entrada'), entradaSo: byId('out-entrada-so'),
    parcela: byId('out-parcela'), parcelaSo: byId('out-parcela-so'),
    custos: byId('out-custos'), barraE: byId('barra-entrada'), barraP: byId('barra-parcela'),
    legenda: byId('barras-leg-grupo'), vivo: byId('sim-vivo'),
    hqValor: byId('hq-valor-out'), hqEntrada: byId('hq-entrada'), hqParcela: byId('hq-parcela'),
    rsEntrada: byId('rs-entrada'), rsParcela: byId('rs-parcela')
  };
  var vivoTimer = 0, trackTimer = 0;

  function mexeu(el) {
    origem = el;
    agendar(SUJO_SIM);
    clearTimeout(trackTimer);
    trackTimer = setTimeout(function () {
      track('simulator_change', { valor: sim.valor, pessoas: sim.n, entrada_pct: sim.entrada, prazo_anos: sim.prazo, juros_aa: sim.juros });
    }, 900);
  }

  faixas.forEach(function (el) {
    el.addEventListener('input', function () { sim[el.dataset.key] = +el.value; mexeu(el); });
  });
  textos.forEach(function (el) {
    var k = el.dataset.key, min = +el.dataset.min, max = +el.dataset.max;
    el.addEventListener('input', function () {
      var v = parseInt(el.value.replace(/\D/g, ''), 10);
      if (!isNaN(v) && v >= min && v <= max) { sim[k] = v; mexeu(el); }
    });
    el.addEventListener('change', function () {
      var v = parseInt(el.value.replace(/\D/g, ''), 10);
      if (isNaN(v)) v = sim[k];
      sim[k] = Math.min(max, Math.max(min, v));
      mexeu(null);
    });
  });
  if (juros) {
    juros.addEventListener('input', function () {
      var v = parseFloat(juros.value.replace(',', '.'));
      if (!isNaN(v) && v >= 1 && v <= 30) { sim.juros = v; mexeu(juros); }
    });
    juros.addEventListener('change', function () {
      var v = parseFloat(juros.value.replace(',', '.'));
      if (isNaN(v)) v = sim.juros;
      sim.juros = Math.min(30, Math.max(1, v));
      juros.value = DEC.format(sim.juros);
      mexeu(juros);
    });
  }
  radios.forEach(function (el) {
    el.addEventListener('change', function () {
      sim.n = +el.value;
      definirPlanta(sim.n);
      mexeu(el);
    });
  });
  ['sim-form', 'conta-rapida'].forEach(function (id) {
    var f = byId(id); if (f) f.addEventListener('submit', function (e) { e.preventDefault(); });
  });

  function desenharSim() {
    var V = sim.valor, n = sim.n, i, el, k;
    var entrada = V * sim.entrada / 100;
    var fin = V - entrada;
    var taxa = Math.pow(1 + sim.juros / 100, 1 / 12) - 1;
    var parcela = fin / (sim.prazo * 12) + fin * taxa; /* primeira parcela SAC */

    for (i = 0; i < faixas.length; i++) {
      el = faixas[i]; k = el.dataset.key;
      if (el !== origem && +el.value !== sim[k]) el.value = sim[k];
      el.style.setProperty('--p', ((sim[k] - LIM[k][0]) / (LIM[k][1] - LIM[k][0]) * 100).toFixed(1) + '%');
      el.setAttribute('aria-valuetext', VT[k](sim[k]));
    }
    for (i = 0; i < textos.length; i++) {
      el = textos[i]; k = el.dataset.key;
      if (el !== origem) el.value = k === 'valor' ? INT.format(sim[k]) : String(sim[k]);
    }
    for (i = 0; i < radios.length; i++) radios[i].checked = +radios[i].value === n;
    origem = null;

    var ePP = BRL.format(Math.round(entrada / n));
    var pPP = BRL.format(Math.round(parcela / n));
    if (o.hqValor) { o.hqValor.textContent = BRL.format(V); o.hqEntrada.textContent = ePP; o.hqParcela.textContent = pPP; }
    if (o.rsEntrada) { o.rsEntrada.textContent = ePP; o.rsParcela.textContent = pPP; }
    if (!o.entrada) return;
    o.entrada.textContent = ePP;
    o.entradaSo.textContent = BRL.format(Math.round(entrada));
    o.parcela.textContent = pPP;
    o.parcelaSo.textContent = BRL.format(Math.round(parcela));
    o.custos.textContent = BRL.format(Math.round(V * .03 / n / 100) * 100) + ' a ' + BRL.format(Math.round(V * .05 / n / 100) * 100);
    o.barraE.style.transform = ESCALA[n];
    o.barraP.style.transform = ESCALA[n];
    o.legenda.textContent = 'por pessoa, em ' + n;
    clearTimeout(vivoTimer);
    vivoTimer = setTimeout(function () {
      o.vivo.textContent = 'Em grupo de ' + n + ': entrada de ' + ePP + ' e primeira parcela de ' + pPP + ' por pessoa.';
    }, 600);
  }

  /* ---------- visibilidade: topo, doca, ciclo da casa e revelações ---------- */
  var doca = byId('doca'), docaLink = byId('doca-link');
  var heroi = byId('topo'), secSim = byId('simulador'), secLista = byId('lista');
  /* doca: 0 escondida, 1 leva ao simulador, 2 leva à lista */
  var vis = { heroi: true, sim: false, simPassou: false, lista: false, doca: 0 };

  function desenharDoca() {
    if (!doca) return;
    var st = (!vis.heroi && !vis.sim && !vis.lista) ? (vis.simPassou ? 2 : 1) : 0;
    if (st === vis.doca) return;
    if (st === 1) { docaLink.href = '#simulador'; docaLink.textContent = 'Simular minha parte'; }
    else if (st === 2) { docaLink.href = '#lista'; docaLink.textContent = 'Entrar na lista'; }
    doca.classList.toggle('is-on', !!st);
    root.classList.toggle('doca-on', !!st);
    vis.doca = st;
  }

  if ('IntersectionObserver' in window) {
    var sentinela = byId('sentinela');
    if (sentinela) new IntersectionObserver(function (en) {
      root.classList.toggle('solto', !en[0].isIntersecting);
    }).observe(sentinela);

    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        var en = entries[i], tg = en.target;
        if (tg === heroi) {
          vis.heroi = en.isIntersecting;
        } else if (tg === secSim) {
          vis.sim = en.isIntersecting;
          if (!en.isIntersecting) vis.simPassou = en.boundingClientRect.top < 0;
        } else if (tg === secLista) {
          vis.lista = en.isIntersecting;
        }
      }
      agendar(SUJO_DOCA);
    }, { rootMargin: '-64px 0px -30% 0px' });
    if (heroi) io.observe(heroi);
    if (secSim) io.observe(secSim);
    if (secLista) io.observe(secLista);

    var rio = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) { entries[i].target.classList.add('is-in'); rio.unobserve(entries[i].target); }
      }
    }, { rootMargin: '0px 0px -6% 0px' });
    var rev = doc.querySelectorAll('.revelar');
    for (var j = 0; j < rev.length; j++) rio.observe(rev[j]);
  } else {
    root.classList.remove('js');
  }

  /* ---------- formulário da lista ---------- */
  var form = byId('inscricao');
  if (form) {
    var comecou = false;
    form.addEventListener('focusin', function () { if (!comecou) { comecou = true; track('form_start'); } });

    var tel = byId('f-zap');
    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 11), s = d;
      if (d.length > 2) s = '(' + d.slice(0, 2) + ') ' + (d.length > 10 ? d.slice(2, 7) + '-' + d.slice(7) : d.length > 6 ? d.slice(2, 6) + '-' + d.slice(6) : d.slice(2));
      else if (d.length) s = '(' + d;
      tel.value = s;
    });

    var obrig = form.querySelectorAll('[required]');
    function validar(el) {
      var ok = el.checkValidity();
      var err = byId(el.getAttribute('aria-describedby'));
      el.setAttribute('aria-invalid', ok ? 'false' : 'true');
      if (err) err.hidden = ok;
      return ok;
    }
    function revalidar(e) { if (e.target.getAttribute('aria-invalid') === 'true') validar(e.target); }
    for (var q = 0; q < obrig.length; q++) {
      obrig[q].addEventListener('blur', function (e) { if (e.target.value && e.target.type !== 'checkbox') validar(e.target); });
      obrig[q].addEventListener('input', revalidar);
      obrig[q].addEventListener('change', revalidar);
    }

    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primeiro = null;
      for (var i = 0; i < obrig.length; i++) if (!validar(obrig[i]) && !primeiro) primeiro = obrig[i];
      if (primeiro) { primeiro.focus(); return; }
      /* Conceito: conectar aqui ao backend ou CRM. Nenhum dado pessoal vai para o dataLayer. */
      track('form_submit', { faixa: byId('f-faixa').value });
      form.querySelector('.inscricao__campos').hidden = true;
      form.querySelector('.aceite').hidden = true;
      form.querySelector('button[type="submit"]').hidden = true;
      var ok = byId('inscricao-ok');
      ok.hidden = false; ok.setAttribute('tabindex', '-1'); ok.focus();
    });
  }

  /* ---------- cliques rastreados ---------- */
  doc.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('[data-track]') : null;
    if (el) track(el.getAttribute('data-track'));
  }, { passive: true });
})();
