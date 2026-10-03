/* ==========================================================================
   Kaffa Coffee Market — storefront logic
   1. Data   2. State & helpers   3. Shop   4. Bag   5. Brew guide + timer
   6. Motion (reveal, scroll progress, timeline, parallax, count-up)   7. Boot
   ========================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Data ---------- */
  const LOTS = [
    { id: 'k01', name: 'Bonga Forest',       type: 'single', region: 'Kaffa',          process: 'Natural',       alt: 1750, score: 87.5, roast: 2, notes: 'Blueberry, dark cocoa, bergamot',    price: 18   },
    { id: 'k02', name: 'Kochere',            type: 'single', region: 'Yirgacheffe',    process: 'Washed',        alt: 2000, score: 88.5, roast: 1, notes: 'Jasmine, lemon, black tea',          price: 19   },
    { id: 'k03', name: 'Shakiso',            type: 'single', region: 'Guji',           process: 'Natural',       alt: 2100, score: 88,   roast: 2, notes: 'Strawberry, peach, milk chocolate',  price: 20   },
    { id: 'k04', name: 'Bensa',              type: 'single', region: 'Sidama',         process: 'Honey',         alt: 2050, score: 87,   roast: 2, notes: 'Apricot, honey, lime',               price: 18.5 },
    { id: 'k05', name: 'Longberry',          type: 'single', region: 'Harrar',         process: 'Natural',       alt: 1900, score: 85.5, roast: 3, notes: 'Blackberry, red wine, cardamom',     price: 17   },
    { id: 'k06', name: 'Limu Kossa',         type: 'single', region: 'Limu',           process: 'Washed',        alt: 1850, score: 86,   roast: 3, notes: 'Orange, caramel, honeysuckle',       price: 16.5 },
    { id: 'k07', name: 'Market Blend No. 1', type: 'blend',  region: 'Kaffa + Limu',   process: 'Mixed process', alt: 1800, score: 85,   roast: 4, notes: 'Cocoa, hazelnut, cherry',            price: 15   },
    { id: 'k08', name: 'Jebena Dark',        type: 'blend',  region: 'Kaffa + Harrar', process: 'Natural',       alt: 1800, score: 83.5, roast: 5, notes: 'Molasses, walnut, smoke',            price: 14   },
    { id: 'k09', name: 'Sidama Decaf',       type: 'decaf',  region: 'Sidama',         process: 'Water decaf',   alt: 1950, score: 84,   roast: 3, notes: 'Fig, brown sugar, cocoa',            price: 17   }
  ];
  const ROASTS = ['', 'Light', 'Light-medium', 'Medium', 'Medium-dark', 'Dark'];
  const TYPES = { single: 'Single origin', blend: 'Blend', decaf: 'Decaf' };
  const FREE_SHIPPING = 40, SHIPPING = 5, KILO_FACTOR = 3.4;
  const TOP_SCORE = Math.max(...LOTS.map(l => l.score));

  const METHODS = {
    pourover:  { name: 'Pour-over',    serving: 'cups (250 ml)',     ml: 250, ratio: 16, grind: 'Medium-fine, like table salt', temp: '94 °C', time: '3:00',
                 pair: 'Best with light roasts such as Kochere or Bensa.',
                 steps: ['Rinse the paper filter with hot water.', 'Pour twice the coffee weight in water and wait 40 seconds.', 'Pour the rest in slow circles, finishing by 2:00.', 'Let it drain. Aim for 3:00 in total.'] },
    press:     { name: 'French press', serving: 'cups (250 ml)',     ml: 250, ratio: 15, grind: 'Coarse, like sea salt',        temp: '95 °C', time: '4:00',
                 pair: 'Suits fuller coffees such as Longberry or Jebena Dark.',
                 steps: ['Add coffee, then all the water.', 'Stir once and put the lid on, plunger up.', 'Wait 4 minutes, then press slowly.', 'Pour straight away so it stops brewing.'] },
    aeropress: { name: 'AeroPress',    serving: 'cups (200 ml)',     ml: 200, ratio: 14, grind: 'Medium-fine',                  temp: '88 °C', time: '2:00',
                 pair: 'Forgiving with any lot. Try Shakiso.',
                 steps: ['Rinse the filter and set the brewer on a mug.', 'Add coffee and water, then stir for 10 seconds.', 'Fit the plunger and wait until 1:30.', 'Press gently for 30 seconds.'] },
    espresso:  { name: 'Espresso',     serving: 'double shots',      ml: 36,  ratio: 2,  grind: 'Fine, like caster sugar',      temp: '93 °C', time: '0:28', yieldLabel: 'Yield in the cup', unit: 'g',
                 pair: 'Market Blend No. 1 was built for this.',
                 steps: ['Dose and level the basket.', 'Tamp flat and firm.', 'Start the shot and the timer together.', 'Stop at the target yield. Grind finer if it ran fast.'] },
    jebena:    { name: 'Jebena',       serving: 'sini cups (60 ml)', ml: 60,  ratio: 12, grind: 'Fine, pounded or ground',      temp: 'Rolling boil', time: '8:00',
                 pair: 'The traditional Ethiopian clay pot. Use Jebena Dark or Bonga Forest.',
                 steps: ['Bring the water to a boil in the jebena.', 'Add the coffee and return it to a boil.', 'Take it off the heat and rest it tilted for 5 minutes so the grounds settle.', 'Pour in one steady stream into small sini cups.'] }
  };

  /* ---------- 2. State & helpers ---------- */
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const fmt = n => money.format(n);
  const lotById = id => LOTS.find(l => l.id === id);
  const imgOf = lot => `images/lots/${lot.id}.svg`;
  const priceOf = (lot, size) => size === 1000 ? Math.round(lot.price * KILO_FACTOR) : lot.price;
  const sizeLabel = size => size === 1000 ? '1 kg' : '250 g';

  const state = { filter: 'all', sort: 'featured', query: '', sizes: {}, cart: loadCart(), method: 'pourover', servings: 2, checkoutNote: false };
  const sizeFor = id => state.sizes[id] || 250;

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem('kaffa-cart') || '[]');
      return Array.isArray(raw) ? raw.filter(l => lotById(l.id) && (l.size === 250 || l.size === 1000) && l.qty > 0) : [];
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem('kaffa-cart', JSON.stringify(state.cart)); } catch (e) { /* storage blocked: the bag lives in memory */ }
  }

  /** Animate a number in an element from its last value to `to`. */
  function tween(el, to, dur = 400, format = String) {
    const from = Number(el.dataset.v ?? to);
    el.dataset.v = to;
    cancelAnimationFrame(el._raf);
    if (REDUCED || from === to) { el.textContent = format(to); return; }
    const t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / dur), eased = 1 - Math.pow(1 - k, 3);
      el.textContent = format(Math.round(from + (to - from) * eased));
      if (k < 1) el._raf = requestAnimationFrame(step);
    };
    el._raf = requestAnimationFrame(step);
  }

  /* ---------- 3. Shop ---------- */
  function visibleLots() {
    const q = state.query.trim().toLowerCase();
    let list = LOTS.filter(l => state.filter === 'all' || l.type === state.filter);
    if (q) list = list.filter(l => [l.name, l.region, l.process, l.notes, TYPES[l.type], ROASTS[l.roast]].join(' ').toLowerCase().includes(q));
    const by = {
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      score: (a, b) => b.score - a.score,
      roast: (a, b) => a.roast - b.roast || b.score - a.score
    }[state.sort];
    return by ? [...list].sort(by) : list;
  }

  function lotCard(l, i) {
    const size = sizeFor(l.id);
    const badge = l.score === TOP_SCORE ? 'Top score' : (l.type === 'single' && l.region === 'Kaffa' ? 'Home lot' : '');
    const pips = [1, 2, 3, 4, 5].map(k => `<span class="pip${k <= l.roast ? ' on' : ''}" style="--k:${k}"></span>`).join('');
    const radio = s => `
      <input class="sr-only" type="radio" name="size-${l.id}" id="size-${l.id}-${s}" value="${s}" data-size-for="${l.id}"${size === s ? ' checked' : ''}>
      <label for="size-${l.id}-${s}">${sizeLabel(s)}</label>`;
    return `
      <article class="lot" style="--i:${i}">
        <div class="lot-media">
          <img src="${imgOf(l)}" alt="Kraft bag of ${l.name} coffee" width="400" height="300" loading="lazy">
          ${badge ? `<span class="lot-badge mono">${badge}</span>` : ''}
        </div>
        <div class="lot-body">
          <div class="lot-title">
            <span class="lot-code mono">Lot ${l.id.toUpperCase()} · ${TYPES[l.type]}</span>
            <h3 class="display">${l.name}</h3>
            <span class="muted">${l.region} · ${l.process}</span>
          </div>
          <p class="lot-notes">${l.notes}</p>
          <dl class="lot-specs">
            <div><dt class="mono">Altitude</dt><dd>${l.alt.toLocaleString('en-US')} m</dd></div>
            <div><dt class="mono">Cup score</dt><dd>${l.score.toFixed(1)}</dd></div>
            <div><dt class="mono">Roast</dt><dd>${l.roast} of 5</dd></div>
          </dl>
          <div class="roast" role="img" aria-label="Roast level: ${ROASTS[l.roast]}">
            <span class="pips">${pips}</span><span class="mono muted">${ROASTS[l.roast]}</span>
          </div>
          <div class="lot-buy">
            <div class="sizes" role="radiogroup" aria-label="Bag size for ${l.name}">${radio(250)}${radio(1000)}</div>
            <span class="price" data-price-for="${l.id}">${fmt(priceOf(l, size))}</span>
          </div>
          <button class="btn btn-primary btn-block" type="button" data-add="${l.id}">Add to bag</button>
        </div>
      </article>`;
  }

  function renderLots() {
    const list = visibleLots(), box = $('lots');
    $('result-count').textContent = `${list.length} of ${LOTS.length} lots`;
    if (!list.length) {
      box.innerHTML = `<div class="empty" style="grid-column: 1 / -1"><p id="empty-msg"></p><button class="btn" type="button" id="clear-filters">Show all lots</button></div>`;
      $('empty-msg').textContent = state.query.trim() ? `No lots match “${state.query.trim()}”.` : 'No lots in this group right now.';
      return;
    }
    box.innerHTML = list.map(lotCard).join('');
  }

  function setFilter(filter) {
    state.filter = filter;
    document.querySelectorAll('#chips .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    renderLots();
  }

  $('chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-filter]');
    if (chip) setFilter(chip.dataset.filter);
  });
  $('lot-search').addEventListener('input', e => { state.query = e.target.value; renderLots(); });
  $('lot-sort').addEventListener('change', e => { state.sort = e.target.value; renderLots(); });

  $('lots').addEventListener('change', e => {
    const id = e.target.dataset.sizeFor;
    if (!id) return;
    state.sizes[id] = Number(e.target.value);
    document.querySelector(`[data-price-for="${id}"]`).textContent = fmt(priceOf(lotById(id), state.sizes[id]));
  });
  $('lots').addEventListener('click', e => {
    if (e.target.id === 'clear-filters') {
      state.query = ''; $('lot-search').value = '';
      setFilter('all');
      return;
    }
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const lot = lotById(btn.dataset.add), size = sizeFor(lot.id);
    addToCart(lot.id, size);
    flyToBag(btn.closest('.lot').querySelector('img'));
    showToast(`${lot.name}, ${sizeLabel(size)}, added to your bag.`);
    btn.textContent = 'Added';
    clearTimeout(btn._t);
    btn._t = setTimeout(() => { btn.textContent = 'Add to bag'; }, 1200);
  });

  /** A copy of the product picture flies from the card to the bag button. */
  function flyToBag(img) {
    const bump = () => {
      const c = $('bag-count');
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
    };
    if (REDUCED || !img || !img.animate) { bump(); return; }
    const a = img.getBoundingClientRect(), b = $('bag-open').getBoundingClientRect();
    const ghost = img.cloneNode();
    ghost.className = 'fly-ghost'; ghost.alt = ''; ghost.removeAttribute('loading');
    Object.assign(ghost.style, { left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px' });
    document.body.appendChild(ghost);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    ghost.animate([
      { transform: 'translate(0, 0) scale(1) rotate(0deg)', opacity: .95 },
      { transform: `translate(${dx * .55}px, ${dy * .85 - 50}px) scale(.4) rotate(-12deg)`, opacity: .9, offset: .6 },
      { transform: `translate(${dx}px, ${dy}px) scale(.06) rotate(10deg)`, opacity: .2 }
    ], { duration: 700, easing: 'cubic-bezier(.5, 0, .3, 1)' }).onfinish = () => { ghost.remove(); bump(); };
  }

  function showToast(msg) {
    const toast = $('toast');
    $('toast-msg').textContent = msg;
    toast.hidden = true; void toast.offsetWidth; toast.hidden = false;   // restart the entry animation
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.hidden = true; }, 3200);
  }
  $('toast-view').addEventListener('click', () => { $('toast').hidden = true; openCart(); });

  /* ---------- 4. Bag ---------- */
  const cart = $('cart');

  function addToCart(id, size) {
    const line = state.cart.find(l => l.id === id && l.size === size);
    if (line) line.qty += 1; else state.cart.push({ id, size, qty: 1 });
    cartChanged();
  }
  function cartChanged() {
    state.cart = state.cart.filter(l => l.qty > 0);
    state.checkoutNote = false;
    saveCart();
    renderCart();
  }
  function cartTotals() {
    const subtotal = state.cart.reduce((sum, l) => sum + priceOf(lotById(l.id), l.size) * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING;
    return { subtotal, shipping, total: subtotal + shipping, count: state.cart.reduce((n, l) => n + l.qty, 0) };
  }

  function renderCart() {
    const t = cartTotals(), lines = $('cart-lines'), foot = $('cart-foot');
    $('bag-count').textContent = t.count;
    $('bag-open').setAttribute('aria-label', `Open bag, ${t.count} ${t.count === 1 ? 'item' : 'items'}`);

    if (!state.cart.length) {
      lines.innerHTML = `<div class="empty" style="margin-top:1rem"><p>Your bag is empty.</p><p class="muted">Add a lot from the market table to start an order.</p></div>`;
      foot.innerHTML = `<button class="btn btn-block" type="button" data-cart="close">Keep shopping</button>`;
      return;
    }

    lines.innerHTML = state.cart.map((l, i) => {
      const lot = lotById(l.id), unit = priceOf(lot, l.size);
      return `
        <div class="line">
          <img class="line-thumb" src="${imgOf(lot)}" alt="" width="60" height="45">
          <div><div class="line-name">${lot.name}</div><div class="muted">${sizeLabel(l.size)} · ${fmt(unit)} each</div></div>
          <div class="line-price">${fmt(unit * l.qty)}</div>
          <div class="qty">
            <button type="button" data-cart="dec" data-i="${i}" aria-label="Remove one ${lot.name}">−</button>
            <span aria-label="Quantity">${l.qty}</span>
            <button type="button" data-cart="inc" data-i="${i}" aria-label="Add one ${lot.name}">+</button>
          </div>
          <button class="link-btn line-remove" type="button" data-cart="remove" data-i="${i}">Remove</button>
        </div>`;
    }).join('');

    const left = FREE_SHIPPING - t.subtotal;
    const pct = Math.min(100, Math.round(t.subtotal / FREE_SHIPPING * 100));
    foot.innerHTML = `
      <div class="ship-meter">
        <span>${left > 0 ? `Add ${fmt(left)} more for free shipping.` : 'This order ships free.'}</span>
        <div class="ship-track"><div class="ship-fill" style="width:${pct}%"></div></div>
      </div>
      <dl class="totals">
        <dt>Subtotal</dt><dd>${fmt(t.subtotal)}</dd>
        <dt>Shipping</dt><dd>${t.shipping ? fmt(t.shipping) : 'Free'}</dd>
        <dt class="grand">Total</dt><dd class="grand">${fmt(t.total)}</dd>
      </dl>
      ${state.checkoutNote ? `<p class="notice" role="status">Checkout is not connected yet. No order was placed and nothing was charged. Your bag is saved on this device.</p>` : ''}
      <button class="btn btn-primary btn-block" type="button" data-cart="checkout">Check out · ${fmt(t.total)}</button>
      <button class="link-btn" type="button" data-cart="clear">Empty the bag</button>`;
  }

  function openCart() { renderCart(); if (!cart.open) cart.showModal(); }
  $('bag-open').addEventListener('click', openCart);
  $('bag-close').addEventListener('click', () => cart.close());
  cart.addEventListener('click', e => {
    if (e.target === cart) { cart.close(); return; }             // click on the backdrop
    const btn = e.target.closest('[data-cart]');
    if (!btn) return;
    const line = state.cart[Number(btn.dataset.i)];
    switch (btn.dataset.cart) {
      case 'inc': line.qty += 1; cartChanged(); break;
      case 'dec': line.qty -= 1; cartChanged(); break;
      case 'remove': line.qty = 0; cartChanged(); break;
      case 'clear': state.cart = []; cartChanged(); break;
      case 'close': cart.close(); break;
      case 'checkout': state.checkoutNote = true; renderCart(); break;
    }
  });

  /* ---------- 5. Brew guide + timer ---------- */
  const RING = 2 * Math.PI * 52;
  const timer = { total: 180, left: 180, running: false, startedAt: 0, base: 180, id: 0 };
  const parseTime = s => { const [m, sec] = s.split(':').map(Number); return m * 60 + sec; };
  const clock = s => { s = Math.max(0, Math.ceil(s)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };

  function recipeFor(key, servings) {
    const m = METHODS[key], water = m.ml * servings;
    return { m, water, coffee: Math.round(water / m.ratio) };
  }

  function drawTimer() {
    const done = timer.left <= 0;
    $('timer-time').textContent = done ? 'Done' : clock(timer.left);
    $('timer-ring').style.strokeDashoffset = (RING * Math.max(0, timer.left) / timer.total).toFixed(2);
    $('timer').classList.toggle('done', done);
    $('timer-toggle').textContent = timer.running ? 'Pause' : done ? 'Start again' : timer.left < timer.total ? 'Resume' : 'Start timer';
  }
  function stopTimer() { timer.running = false; clearInterval(timer.id); }
  function resetTimer(total = timer.total) {
    stopTimer();
    timer.total = timer.left = timer.base = total;
    drawTimer();
  }
  function tick() {
    timer.left = timer.base - (performance.now() - timer.startedAt) / 1000;
    if (timer.left <= 0) { timer.left = 0; stopTimer(); $('brew-summary').textContent = 'Timer finished.'; }
    drawTimer();
  }
  $('timer-toggle').addEventListener('click', () => {
    if (timer.running) { stopTimer(); timer.base = timer.left; drawTimer(); return; }
    if (timer.left <= 0) timer.left = timer.base = timer.total;
    timer.base = timer.left; timer.startedAt = performance.now(); timer.running = true;
    timer.id = setInterval(tick, 200);
    drawTimer();
  });
  $('timer-reset').addEventListener('click', () => resetTimer());

  function renderBrew(methodChanged) {
    const { m, water, coffee } = recipeFor(state.method, state.servings);
    document.querySelectorAll('#methods [data-method]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.method === state.method)));
    $('servings-label').textContent = `Servings: ${m.serving}`;
    $('servings-val').textContent = state.servings;
    $('brew-pair').textContent = m.pair;
    tween($('dose-coffee'), coffee);
    tween($('dose-water'), water);
    $('brew-summary').textContent = `${m.name} for ${state.servings}: ${coffee} grams of coffee, ${water} ${m.unit === 'g' ? 'grams out' : 'millilitres of water'}.`;
    if (!methodChanged) return;

    $('brew-name').textContent = m.name;
    $('brew-ratio').textContent = `Ratio 1 : ${m.ratio}`;
    $('dose-water-label').textContent = m.yieldLabel || 'Water';
    $('dose-water-unit').textContent = m.unit || 'ml';
    $('brew-grind').textContent = m.grind;
    $('brew-temp').textContent = m.temp;
    $('brew-time').textContent = m.time;
    $('brew-steps').innerHTML = m.steps.map((s, k) => `<li style="--k:${k}">${s}</li>`).join('');
    const img = $('brew-img');
    img.src = `images/brew/${state.method}.svg`;
    if (!REDUCED && img.animate) img.animate([{ opacity: 0, transform: 'scale(.88) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2, .7, .2, 1)' });
    resetTimer(parseTime(m.time));
  }

  $('methods').innerHTML = Object.entries(METHODS).map(([k, v]) => `<button class="chip" type="button" data-method="${k}" aria-pressed="false">${v.name}</button>`).join('');
  $('methods').addEventListener('click', e => {
    const b = e.target.closest('[data-method]');
    if (!b || b.dataset.method === state.method) return;
    state.method = b.dataset.method;
    renderBrew(true);
  });
  $('brew-servings').addEventListener('input', e => { state.servings = Number(e.target.value); renderBrew(false); });

  /* ---------- Copy email ---------- */
  $('copy-email').addEventListener('click', async e => {
    const btn = e.currentTarget, el = $('email');
    try {
      await navigator.clipboard.writeText(el.textContent);
      btn.textContent = 'Copied';
    } catch (err) {                                    // clipboard refused: select the text instead
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = getSelection();
      sel.removeAllRanges(); sel.addRange(range);
      btn.textContent = 'Selected';
    }
    setTimeout(() => { btn.textContent = 'Copy'; }, 1500);
  });

  /* ---------- 6. Motion ---------- */
  function initMotion() {
    // Scroll progress bar, header shadow, origin timeline fill
    const head = $('site-head'), bar = $('progress-bar'), steps = $('steps'), items = [...steps.children];
    let queued = false;
    const onScroll = () => {
      queued = false;
      const max = document.documentElement.scrollHeight - innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      head.classList.toggle('scrolled', scrollY > 8);
      const r = steps.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (innerHeight * .7 - r.top) / r.height));
      steps.style.setProperty('--p', p.toFixed(3));
      items.forEach(li => li.classList.toggle('done', p > 0 && (li.offsetTop + 12) / steps.offsetHeight <= p));
    };
    const request = () => { if (!queued) { queued = true; requestAnimationFrame(onScroll); } };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request);
    onScroll();

    if (REDUCED) return;

    // Reveal on scroll
    if ('IntersectionObserver' in window) {
      document.documentElement.classList.add('js-motion');
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
      document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    }

    // Hero numbers count up
    document.querySelectorAll('[data-count]').forEach(el => {
      el.dataset.v = 0;
      setTimeout(() => tween(el, Number(el.dataset.count), 1400, n => n.toLocaleString('en-US')), 500);
    });

    // Pointer parallax on the hero scene
    if (matchMedia('(pointer: fine)').matches) {
      const hero = $('hero'), stage = $('stage');
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        stage.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
        stage.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
      });
      hero.addEventListener('pointerleave', () => { stage.style.setProperty('--px', 0); stage.style.setProperty('--py', 0); });
    }
  }

  /* ---------- 7. Boot ---------- */
  state.servings = Number($('brew-servings').value) || 2;
  initMotion();
  renderLots();
  renderCart();
  renderBrew(true);
})();
