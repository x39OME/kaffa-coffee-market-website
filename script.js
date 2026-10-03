/* ==========================================================================
   Kaffa Coffee Market — storefront logic
   1. Data (coffee, equipment, plans, brew methods, fixes)
   2. State & helpers          3. Coffee shop        4. Equipment shop
   5. Subscriptions            6. Adding to the bag  7. Bag drawer
   8. Brew guide + timer       9. Fix your cup       10. Small UI (menu, copy)
   11. Motion                  12. Boot
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

  const GEAR_CATS = { brewers: 'Brewers', grinders: 'Grinders', filters: 'Filters', kettles: 'Kettles & scales', espresso: 'Espresso tools', cups: 'Cups & serving', care: 'Storage & care', gifts: 'Gifts & sets', all: 'All equipment' };
  const GEAR = [
    { id: 'g01', cat: 'brewers',  name: 'Cone Dripper 02',            price: 24,  specs: ['Glazed ceramic', 'Brews 1 to 4 cups', 'Takes cone 02 filters'] },
    { id: 'g02', cat: 'brewers',  name: 'Flat-bottom Dripper 185',    price: 29,  specs: ['Stainless steel', 'Brews 2 to 4 cups', 'Takes wave 185 filters'] },
    { id: 'g03', cat: 'brewers',  name: 'Hourglass Brewer 600 ml',    price: 46,  specs: ['Borosilicate glass, wood collar', 'Brews 2 to 4 cups', 'Takes hourglass filters'] },
    { id: 'g04', cat: 'brewers',  name: 'French Press 1 L',           price: 34,  specs: ['Glass and steel', 'Makes 4 mugs', 'No paper filter needed'] },
    { id: 'g05', cat: 'brewers',  name: 'Travel Press Brewer',        price: 38,  specs: ['BPA-free plastic', 'One cup at a time', 'Takes 63 mm disc filters'] },
    { id: 'g06', cat: 'brewers',  name: 'Moka Pot, 6 cup',            price: 32,  specs: ['Aluminium', 'Makes 300 ml', 'Gas and electric hobs'] },
    { id: 'g07', cat: 'brewers',  name: 'Cold Brew Jar 1.2 L',        price: 36,  specs: ['Glass with a steel mesh core', 'Makes 1.2 L of concentrate', 'Fits a fridge door'] },
    { id: 'g08', cat: 'brewers',  name: 'Clay Jebena',                price: 42,  specs: ['Hand-thrown black clay', 'Holds 700 ml', 'Straw ring stand included'] },
    { id: 'g09', cat: 'brewers',  name: 'Copper Cezve 240 ml',        price: 28,  specs: ['Tinned copper', 'Makes 2 to 3 small cups', 'Wooden handle'] },
    { id: 'g10', cat: 'brewers',  name: 'Batch Brewer 1.25 L',        price: 189, specs: ['Brews at 92 to 96 °C', 'Makes 10 cups', 'Takes basket filters'] },
    { id: 'g11', cat: 'brewers',  name: 'Home Espresso Machine',      price: 449, specs: ['58 mm portafilter', '9 bar at the group head', 'Steam wand for milk'] },
    { id: 'g12', cat: 'grinders', name: 'Hand Grinder',               price: 79,  specs: ['38 mm steel conical burrs', 'Holds 25 g of beans', 'Stepped grind adjustment'] },
    { id: 'g13', cat: 'grinders', name: 'Electric Burr Grinder',      price: 149, specs: ['40 mm conical burrs', '40 grind settings', '250 g bean hopper'] },
    { id: 'g14', cat: 'filters',  name: 'Cone Filters 02, white',     price: 8,   specs: ['Oxygen-bleached paper', '100 sheets', 'For 1 to 4 cup cones'] },
    { id: 'g15', cat: 'filters',  name: 'Cone Filters 02, natural',   price: 7.5, specs: ['Unbleached paper', '100 sheets', 'Rinse before brewing'] },
    { id: 'g16', cat: 'filters',  name: 'Wave Filters 185',           price: 9,   specs: ['20 flutes', '50 sheets', 'For flat-bottom drippers'] },
    { id: 'g17', cat: 'filters',  name: 'Disc Filters 63 mm',         price: 7,   specs: ['Micro-fine paper', '350 sheets', 'For the travel press brewer'] },
    { id: 'g18', cat: 'filters',  name: 'Hourglass Filters',          price: 11,  specs: ['Thick bonded paper', '100 pre-folded squares', 'For hourglass brewers'] },
    { id: 'g19', cat: 'filters',  name: 'Basket Filters, 8–12 cup',   price: 6,   specs: ['Unbleached paper', '100 sheets', 'For batch brewers'] },
    { id: 'g20', cat: 'filters',  name: 'Stainless Cone Filter 02',   price: 19,  specs: ['Double steel mesh', 'Reusable for years', 'Fits cone 02 drippers'] },
    { id: 'g21', cat: 'filters',  name: 'Cloth Filter with Hoop',     price: 12,  specs: ['Cotton flannel', 'Good for about 100 brews', 'Sits on a server or mug'] },
    { id: 'g22', cat: 'kettles',  name: 'Gooseneck Kettle 1 L',       price: 45,  specs: ['Stainless steel', 'Stovetop and induction', 'Slow, precise pour'] },
    { id: 'g23', cat: 'kettles',  name: 'Electric Gooseneck Kettle',  price: 95,  specs: ['40 to 100 °C in 1 °C steps', 'Holds temperature for 30 min', '0.9 L'] },
    { id: 'g24', cat: 'kettles',  name: 'Brew Scale with Timer',      price: 39,  specs: ['0.1 g steps up to 2 kg', 'Built-in timer', 'USB-C charging'] },
    { id: 'g25', cat: 'kettles',  name: 'Glass Server 600 ml',        price: 22,  specs: ['Borosilicate glass', 'Cup markings', 'Fits any dripper'] },
    { id: 'g26', cat: 'espresso', name: 'Tamper 58 mm',               price: 29,  specs: ['Flat stainless base', 'Walnut handle', 'Fits 58 mm baskets'] },
    { id: 'g27', cat: 'espresso', name: 'Milk Pitcher 350 ml',        price: 18,  specs: ['Stainless steel', 'Sharp spout for latte art', 'Right for one or two drinks'] },
    { id: 'g28', cat: 'espresso', name: 'Knock Box',                  price: 26,  specs: ['Rubber-coated bar', 'Removable bin', 'Dishwasher safe'] },
    { id: 'g29', cat: 'cups',     name: 'Sini Cups, set of 6',        price: 24,  specs: ['Porcelain', '60 ml each', 'No handles, as tradition has it'] },
    { id: 'g30', cat: 'cups',     name: 'Market Mug 300 ml',          price: 16,  specs: ['Stoneware', 'Holds 300 ml', 'Dishwasher safe'] },
    { id: 'g31', cat: 'cups',     name: 'Double-wall Glasses, pair',  price: 22,  specs: ['Borosilicate glass', '250 ml each', 'Cool to hold'] },
    { id: 'g32', cat: 'cups',     name: 'Thermal Flask 500 ml',       price: 28,  specs: ['Vacuum-insulated steel', 'Keeps coffee hot for 6 hours', 'Leak-proof cap'] },
    { id: 'g33', cat: 'care',     name: 'Airtight Canister',          price: 26,  specs: ['Holds 500 g of beans', 'One-way valve in the lid', 'Blocks light'] },
    { id: 'g34', cat: 'care',     name: 'Descaler 250 ml',            price: 9,   specs: ['Citric acid based', 'Two treatments per bottle', 'For kettles and machines'] },
    { id: 'g35', cat: 'care',     name: 'Brush Set',                  price: 8,   specs: ['Grinder brush', 'Group-head brush', 'Natural bristles'] },
    { id: 'g36', cat: 'gifts',    name: 'Pour-over Starter Kit',      price: 45,  specs: ['Cone Dripper 02', '100 white cone filters', '250 g bag of Kochere'] },
    { id: 'g37', cat: 'gifts',    name: 'Ceremony Set',               price: 72,  specs: ['Clay jebena with stand', 'Six sini cups', '250 g bag of Jebena Dark'] },
    { id: 'g38', cat: 'gifts',    name: 'Gift Card',                  price: 25,  specs: ['Printed card, posted', 'Spend at the stall or online', 'No expiry date'] }
  ];

  const FREQS = { 1: 'Every week', 2: 'Every 2 weeks', 4: 'Every 4 weeks' };
  const PLANS = [
    { id: 'p01', name: 'Explorer plan',  price: 16, img: 'images/lots/k02.svg', what: 'One 250 g bag',
      perks: ['A different single origin each delivery', 'Tasting notes and a brew recipe in the box', 'Costs less than buying the bags one by one'] },
    { id: 'p02', name: 'Regular plan',   price: 30, img: 'images/lots/k01.svg', what: 'Two 250 g bags', featured: true,
      perks: ['One coffee you choose, one we choose', 'Tasting notes and a brew recipe in the box', 'Costs less than buying the bags one by one'] },
    { id: 'p03', name: 'Household plan', price: 52, img: 'images/lots/k07.svg', what: 'One 1 kg bag',
      perks: ['Your usual coffee, every time', 'Enough for about 60 cups', 'Costs less than buying the bags one by one'] }
  ];

  const METHODS = {
    pourover:  { name: 'Pour-over',        serving: 'cups (250 ml)',        ml: 250, ratio: 16, grindStep: 2, grind: 'Medium-fine, like table salt', temp: '94 °C', time: '3:00', secs: 180,
                 pair: 'Best with light roasts such as Kochere or Bensa.',
                 steps: ['Rinse the paper filter with hot water.', 'Pour twice the coffee weight in water and wait 40 seconds.', 'Pour the rest in slow circles, finishing by 2:00.', 'Let it drain. Aim for 3:00 in total.'] },
    carafe:    { name: 'Hourglass brewer', serving: 'cups (250 ml)',        ml: 250, ratio: 15, grindStep: 4, grind: 'Medium-coarse, like rough sand', temp: '94 °C', time: '4:30', secs: 270,
                 pair: 'The thick paper suits delicate washed lots such as Kochere.',
                 steps: ['Open the filter with three layers facing the spout and rinse it.', 'Bloom with twice the coffee weight in water for 45 seconds.', 'Pour in two or three slow stages, keeping the bed covered.', 'Lift the filter out once the drip slows, around 4:30.'] },
    press:     { name: 'French press',     serving: 'cups (250 ml)',        ml: 250, ratio: 15, grindStep: 5, grind: 'Coarse, like sea salt',        temp: '95 °C', time: '4:00', secs: 240,
                 pair: 'Suits fuller coffees such as Longberry or Jebena Dark.',
                 steps: ['Add coffee, then all the water.', 'Stir once and put the lid on, plunger up.', 'Wait 4 minutes, then press slowly.', 'Pour straight away so it stops brewing.'] },
    aeropress: { name: 'AeroPress',        serving: 'cups (200 ml)',        ml: 200, ratio: 14, grindStep: 2, grind: 'Medium-fine',                  temp: '88 °C', time: '2:00', secs: 120,
                 pair: 'Forgiving with any lot. Try Shakiso.',
                 steps: ['Rinse the filter and set the brewer on a mug.', 'Add coffee and water, then stir for 10 seconds.', 'Fit the plunger and wait until 1:30.', 'Press gently for 30 seconds.'] },
    espresso:  { name: 'Espresso',         serving: 'double shots',         ml: 36,  ratio: 2,  grindStep: 1, grind: 'Fine, like caster sugar',      temp: '93 °C', time: '0:28', secs: 28, yieldLabel: 'Yield in the cup', unit: 'g',
                 pair: 'Market Blend No. 1 was built for this.',
                 steps: ['Dose and level the basket.', 'Tamp flat and firm.', 'Start the shot and the timer together.', 'Stop at the target yield. Grind finer if it ran fast.'] },
    moka:      { name: 'Moka pot',         serving: 'small cups (50 ml)',   ml: 50,  ratio: 8,  grindStep: 1, grind: 'Fine, a touch coarser than espresso', temp: 'Start with hot water', time: '4:00', secs: 240,
                 pair: 'Market Blend No. 1 or Jebena Dark, with or without milk.',
                 steps: ['Fill the base with hot water to just below the valve.', 'Fill the basket level. Do not tamp.', 'Heat on medium-low with the lid open.', 'When the stream turns pale and sputters, take it off and cool the base under the tap.'] },
    cezve:     { name: 'Cezve',            serving: 'small cups (70 ml)',   ml: 70,  ratio: 10, grindStep: 0, grind: 'Extra fine, like flour',       temp: 'Heat slowly, never boil', time: '2:30', secs: 150,
                 pair: 'A medium or darker roast such as Longberry.',
                 steps: ['Stir coffee into cold water in the pot. Add sugar now if you take it.', 'Heat slowly without stirring again.', 'When the foam rises to the rim, lift it off the heat.', 'Pour slowly and let the cup settle for a minute.'] },
    jebena:    { name: 'Jebena',           serving: 'sini cups (60 ml)',    ml: 60,  ratio: 12, grindStep: 1, grind: 'Fine, pounded or ground',      temp: 'Rolling boil', time: '8:00', secs: 480,
                 pair: 'The traditional Ethiopian clay pot. Use Jebena Dark or Bonga Forest.',
                 steps: ['Bring the water to a boil in the jebena.', 'Add the coffee and return it to a boil.', 'Take it off the heat and rest it tilted for 5 minutes so the grounds settle.', 'Pour in one steady stream into small sini cups.'] },
    drip:      { name: 'Batch brewer',     serving: 'cups (250 ml)',        ml: 250, ratio: 17, grindStep: 3, grind: 'Medium, like sand',            temp: '92 to 96 °C, set by the machine', time: '5:00', secs: 300,
                 pair: 'Limu Kossa or Sidama Decaf for an easy full pot.',
                 steps: ['Fit a basket filter and rinse it.', 'Add the coffee and level the bed.', 'Fill the tank with fresh, filtered water and start.', 'Swirl the pot before pouring so the first and last cups taste the same.'] },
    coldbrew:  { name: 'Cold brew',        serving: 'glasses (200 ml, diluted)', ml: 100, ratio: 8, grindStep: 5, grind: 'Coarse, like sea salt', temp: 'Cold or room temperature', time: '16 hours', secs: 0, yieldLabel: 'Water for the concentrate',
                 pair: 'Naturals such as Bonga Forest turn chocolatey and sweet.',
                 steps: ['Put the coffee in the mesh core and fill the jar with water.', 'Stir so all the grounds are wet.', 'Steep in the fridge for 14 to 18 hours.', 'Lift the core out. Dilute the concentrate one to one with water or milk. It keeps for a week.'] }
  };

  const FIXES = [
    { label: 'Sour or sharp',   why: 'Under-extracted. The water did not pull enough out of the coffee.',
      fixes: ['Grind one step finer.', 'Use hotter water, up to 96 °C.', 'Brew longer or pour more slowly.'] },
    { label: 'Bitter or dry',   why: 'Over-extracted. The water took too much.',
      fixes: ['Grind one step coarser.', 'Drop the water temperature by 2 to 3 °C.', 'Shorten the brew or pour faster.'] },
    { label: 'Weak or watery',  why: 'Too little coffee for the water.',
      fixes: ['Weigh the dose. Aim for 60 g per litre.', 'Use less water for the same dose.', 'Check the grind is not too coarse.'] },
    { label: 'Too strong',      why: 'Too much coffee for the water.',
      fixes: ['Add a splash of hot water to the cup. This is the quickest fix.', 'Lower the dose by a gram or two next time.', 'Keep the grind and time the same.'] },
    { label: 'Muddy or gritty', why: 'Fine particles are getting through the filter.',
      fixes: ['Grind coarser.', 'Switch to a paper filter, or leave the last sip in the press.', 'Fine dust is a sign of a blade grinder or worn burrs.'] },
    { label: 'Draining slowly', why: 'The coffee bed is clogged.',
      fixes: ['Grind coarser.', 'Stir and swirl less.', 'Rinse the paper first and pour gently in the centre.'] },
    { label: 'Flat or dull',    why: 'The coffee is stale or the water is too cool.',
      fixes: ['Check the roast date. Past 30 days it fades.', 'Grind just before brewing.', 'Preheat the brewer and use hotter water.'] }
  ];

  const FREE_SHIPPING = 40, SHIPPING = 5, KILO_FACTOR = 3.4;
  const TOP_SCORE = Math.max(...LOTS.map(l => l.score));

  /* One catalogue for everything the bag can hold */
  const CATALOG = {};
  LOTS.forEach(l  => { CATALOG[l.id] = { ...l, kind: 'coffee', img: `images/lots/${l.id}.svg` }; });
  GEAR.forEach(g  => { CATALOG[g.id] = { ...g, kind: 'gear',   img: `images/gear/${g.id}.svg` }; });
  PLANS.forEach(p => { CATALOG[p.id] = { ...p, kind: 'plan' }; });

  /* ---------- 2. State & helpers ---------- */
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = id => document.getElementById(id);
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const fmt = n => money.format(n);

  const state = {
    filter: 'all', sort: 'featured', query: '',          // coffee shop
    gearCat: 'brewers', gearQuery: '',                   // equipment shop
    sizes: {}, freqs: {},                                // chosen bag size per lot, frequency per plan
    cart: [], method: 'pourover', servings: 2, fix: 0, checkoutNote: false
  };

  /** A "variant" is the bag size for coffee (250 | 1000), the weeks between deliveries for plans, 0 for equipment. */
  const VARIANTS = { coffee: [250, 1000], plan: [1, 2, 4], gear: [0] };
  const chosenVariant = item => item.kind === 'coffee' ? (state.sizes[item.id] || 250) : item.kind === 'plan' ? (state.freqs[item.id] || 2) : 0;
  const unitPrice = (item, v) => item.kind === 'coffee' && v === 1000 ? Math.round(item.price * KILO_FACTOR) : item.price;
  const variantText = (item, v) => item.kind === 'coffee' ? (v === 1000 ? '1 kg' : '250 g') : item.kind === 'plan' ? FREQS[v] : '';

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem('kaffa-bag-v2') || '[]');
      return Array.isArray(raw) ? raw.filter(l => CATALOG[l.id] && VARIANTS[CATALOG[l.id].kind].includes(l.v) && l.qty > 0) : [];
    } catch (e) { return []; }
  }
  function saveCart() {
    try { localStorage.setItem('kaffa-bag-v2', JSON.stringify(state.cart)); } catch (e) { /* storage blocked: the bag lives in memory */ }
  }
  state.cart = loadCart();

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

  const segmented = (item, values, chosen, attr, label) => `
    <div class="sizes" role="radiogroup" aria-label="${label}">${values.map(v => `
      <input class="sr-only" type="radio" name="${attr}-${item.id}" id="${attr}-${item.id}-${v}" value="${v}" data-${attr}-for="${item.id}"${chosen === v ? ' checked' : ''}>
      <label for="${attr}-${item.id}-${v}">${attr === 'size' ? variantText(item, v) : v === 1 ? 'Weekly' : v + ' weeks'}</label>`).join('')}
    </div>`;

  /* ---------- 3. Coffee shop ---------- */
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
    const item = CATALOG[l.id], size = chosenVariant(item);
    const badge = l.score === TOP_SCORE ? 'Top score' : (l.type === 'single' && l.region === 'Kaffa' ? 'Home lot' : '');
    const pips = [1, 2, 3, 4, 5].map(k => `<span class="pip${k <= l.roast ? ' on' : ''}" style="--k:${k}"></span>`).join('');
    return `
      <article class="lot" style="--i:${i}">
        <div class="lot-media">
          <img src="${item.img}" alt="Kraft bag of ${l.name} coffee" width="400" height="300" loading="lazy">
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
            ${segmented(item, VARIANTS.coffee, size, 'size', `Bag size for ${l.name}`)}
            <span class="price" data-price-for="${l.id}">${fmt(unitPrice(item, size))}</span>
          </div>
          <button class="btn btn-primary btn-block" type="button" data-add="${l.id}">Add to bag</button>
        </div>
      </article>`;
  }

  const emptyState = (id, msg) => `<div class="empty" style="grid-column: 1 / -1"><p>${msg}</p><button class="btn" type="button" id="${id}">Clear the search</button></div>`;

  function renderLots() {
    const list = visibleLots();
    $('result-count').textContent = `${list.length} of ${LOTS.length} lots`;
    $('lots').innerHTML = list.length ? list.map(lotCard).join('') : emptyState('clear-lots', 'No lots match that search.');
  }
  function setFilter(filter) {
    state.filter = filter;
    document.querySelectorAll('#chips .chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === filter)));
    renderLots();
  }
  $('chips').addEventListener('click', e => { const chip = e.target.closest('[data-filter]'); if (chip) setFilter(chip.dataset.filter); });
  $('lot-search').addEventListener('input', e => { state.query = e.target.value; renderLots(); });
  $('lot-sort').addEventListener('change', e => { state.sort = e.target.value; renderLots(); });
  $('lots').addEventListener('click', e => {
    if (e.target.id !== 'clear-lots') return;
    state.query = ''; $('lot-search').value = ''; setFilter('all');
  });

  /* ---------- 4. Equipment shop ---------- */
  function gearCard(g, i) {
    const item = CATALOG[g.id];
    return `
      <article class="lot gear" style="--i:${Math.min(i, 12)}">
        <div class="lot-media"><img src="${item.img}" alt="${g.name}" width="400" height="300" loading="lazy"></div>
        <div class="lot-body">
          <div class="lot-title">
            <span class="lot-code mono">${GEAR_CATS[g.cat]}</span>
            <h3>${g.name}</h3>
          </div>
          <ul class="gear-specs">${g.specs.map(s => `<li>${s}</li>`).join('')}</ul>
          <div class="lot-buy">
            <span class="price">${fmt(g.price)}</span>
            <button class="btn btn-primary" type="button" data-add="${g.id}">Add to bag</button>
          </div>
        </div>
      </article>`;
  }
  function renderGear() {
    const q = state.gearQuery.trim().toLowerCase();
    // a search looks across every category
    const list = GEAR.filter(g => q ? [g.name, GEAR_CATS[g.cat], ...g.specs].join(' ').toLowerCase().includes(q) : state.gearCat === 'all' || g.cat === state.gearCat);
    $('gear-count').textContent = q ? `${list.length} of ${GEAR.length} items match` : `${list.length} of ${GEAR.length} items`;
    $('gear-grid').innerHTML = list.length ? list.map(gearCard).join('') : emptyState('clear-gear', 'Nothing on the shelf matches that search.');
    document.querySelectorAll('#gear-chips .chip').forEach(c => c.setAttribute('aria-pressed', String(!q && c.dataset.cat === state.gearCat)));
  }
  $('gear-chips').innerHTML = Object.entries(GEAR_CATS).map(([k, v]) => `<button class="chip" type="button" data-cat="${k}" aria-pressed="false">${v}</button>`).join('');
  $('gear-chips').addEventListener('click', e => {
    const chip = e.target.closest('[data-cat]');
    if (!chip) return;
    state.gearCat = chip.dataset.cat; state.gearQuery = ''; $('gear-search').value = '';
    renderGear();
  });
  $('gear-search').addEventListener('input', e => { state.gearQuery = e.target.value; renderGear(); });
  $('gear-grid').addEventListener('click', e => {
    if (e.target.id !== 'clear-gear') return;
    state.gearQuery = ''; $('gear-search').value = ''; renderGear();
  });

  /* ---------- 5. Subscriptions ---------- */
  function renderPlans() {
    $('plans').innerHTML = PLANS.map((p, i) => {
      const item = CATALOG[p.id];
      return `
        <article class="plan${p.featured ? ' band' : ''}" data-reveal style="--d:${i}">
          ${p.featured ? '<span class="plan-tag mono">Our pick</span>' : ''}
          <div class="plan-top">
            <img class="plan-img" src="${p.img}" alt="" width="76" height="57" loading="lazy">
            <div><h3 class="display">${p.name.replace(' plan', '')}</h3><span class="muted">${p.what}</span></div>
          </div>
          <p class="plan-price">${fmt(p.price)}<small>per delivery</small></p>
          <ul class="ticks">${p.perks.map(x => `<li>${x}</li>`).join('')}</ul>
          <div class="plan-freq">
            <span class="mono muted">How often</span>
            ${segmented(item, VARIANTS.plan, chosenVariant(item), 'freq', `Delivery frequency for the ${p.name}`)}
          </div>
          <button class="btn btn-primary btn-block" type="button" data-add="${p.id}">Add plan to bag</button>
        </article>`;
    }).join('');
  }

  /* ---------- 6. Adding to the bag (shared by all three shops) ---------- */
  document.addEventListener('change', e => {
    const d = e.target.dataset;
    if (d.sizeFor) {
      state.sizes[d.sizeFor] = Number(e.target.value);
      document.querySelector(`[data-price-for="${d.sizeFor}"]`).textContent = fmt(unitPrice(CATALOG[d.sizeFor], state.sizes[d.sizeFor]));
    } else if (d.freqFor) {
      state.freqs[d.freqFor] = Number(e.target.value);
    }
  });

  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add]');
    if (!btn) return;
    const item = CATALOG[btn.dataset.add], v = chosenVariant(item), vt = variantText(item, v), label = btn.textContent;
    addToCart(item.id, v);
    flyToBag(btn.closest('.lot, .plan').querySelector('img'));
    showToast(`${item.name}${vt ? ', ' + vt.toLowerCase() : ''}, added to your bag.`);
    if (btn._t) return;                               // already showing "Added"
    btn.textContent = 'Added';
    btn._t = setTimeout(() => { btn.textContent = label; btn._t = 0; }, 1200);
  });

  /** A copy of the product picture flies from the card to the bag button. */
  function flyToBag(img) {
    const bump = () => { const c = $('bag-count'); c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); };
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

  /* ---------- 7. Bag drawer ---------- */
  const cart = $('cart');

  function addToCart(id, v) {
    const line = state.cart.find(l => l.id === id && l.v === v);
    if (line) line.qty += 1; else state.cart.push({ id, v, qty: 1 });
    cartChanged();
  }
  function cartChanged() {
    state.cart = state.cart.filter(l => l.qty > 0);
    state.checkoutNote = false;
    saveCart();
    renderCart();
  }
  function cartTotals() {
    const subtotal = state.cart.reduce((sum, l) => sum + unitPrice(CATALOG[l.id], l.v) * l.qty, 0);
    const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING ? 0 : SHIPPING;
    return { subtotal, shipping, total: subtotal + shipping, count: state.cart.reduce((n, l) => n + l.qty, 0) };
  }

  function renderCart() {
    const t = cartTotals(), lines = $('cart-lines'), foot = $('cart-foot');
    $('bag-count').textContent = t.count;
    $('bag-open').setAttribute('aria-label', `Open bag, ${t.count} ${t.count === 1 ? 'item' : 'items'}`);

    if (!state.cart.length) {
      lines.innerHTML = `<div class="empty" style="margin-top:1rem"><p>Your bag is empty.</p><p class="muted">Add coffee, equipment or a plan to start an order.</p></div>`;
      foot.innerHTML = `<button class="btn btn-block" type="button" data-cart="close">Keep shopping</button>`;
      return;
    }

    lines.innerHTML = state.cart.map((l, i) => {
      const item = CATALOG[l.id], unit = unitPrice(item, l.v), vt = variantText(item, l.v);
      const each = item.kind === 'plan' ? 'per delivery' : 'each';
      return `
        <div class="line">
          <img class="line-thumb" src="${item.img}" alt="" width="60" height="45">
          <div><div class="line-name">${item.name}</div><div class="muted">${vt ? vt + ' · ' : ''}${fmt(unit)} ${each}</div></div>
          <div class="line-price">${fmt(unit * l.qty)}</div>
          <div class="qty">
            <button type="button" data-cart="dec" data-i="${i}" aria-label="Remove one ${item.name}">−</button>
            <span aria-label="Quantity">${l.qty}</span>
            <button type="button" data-cart="inc" data-i="${i}" aria-label="Add one ${item.name}">+</button>
          </div>
          <button class="link-btn line-remove" type="button" data-cart="remove" data-i="${i}">Remove</button>
        </div>`;
    }).join('');

    const left = FREE_SHIPPING - t.subtotal;
    const pct = Math.min(100, Math.round(t.subtotal / FREE_SHIPPING * 100));
    const hasPlan = state.cart.some(l => CATALOG[l.id].kind === 'plan');
    foot.innerHTML = `
      <div class="ship-meter">
        <span>${left > 0 ? `Add ${fmt(left)} more for free shipping.` : 'This order ships free.'}</span>
        <div class="ship-track"><div class="ship-fill" style="width:${pct}%"></div></div>
      </div>
      <dl class="totals">
        <dt>Subtotal</dt><dd>${fmt(t.subtotal)}</dd>
        <dt>Shipping</dt><dd>${t.shipping ? fmt(t.shipping) : 'Free'}</dd>
        <dt class="grand">${hasPlan ? 'Due today' : 'Total'}</dt><dd class="grand">${fmt(t.total)}</dd>
      </dl>
      ${hasPlan ? '<p class="muted" style="font-size:.9375rem">Plans show the price of the first delivery.</p>' : ''}
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

  /* ---------- 8. Brew guide + timer ---------- */
  const RING = 2 * Math.PI * 52;
  const timer = { total: 180, left: 180, running: false, startedAt: 0, base: 180, id: 0 };
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
    document.querySelectorAll('#grind-scale [data-grind]').forEach(li => li.classList.toggle('active', Number(li.dataset.grind) === m.grindStep));
    const img = $('brew-img');
    img.src = `images/brew/${state.method}.svg`;
    if (!REDUCED && img.animate) img.animate([{ opacity: 0, transform: 'scale(.88) rotate(-6deg)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2, .7, .2, 1)' });

    // long steeps get a note instead of a countdown
    const timed = m.secs > 0;
    $('timer').hidden = !timed;
    $('timer-note').hidden = timed;
    $('timer-note').textContent = timed ? '' : `No timer for this one. Leave it for ${m.time} and come back tomorrow.`;
    resetTimer(timed ? m.secs : 1);
  }

  $('methods').innerHTML = Object.entries(METHODS).map(([k, v]) => `<button class="chip" type="button" data-method="${k}" aria-pressed="false">${v.name}</button>`).join('');
  $('methods').addEventListener('click', e => {
    const b = e.target.closest('[data-method]');
    if (!b || b.dataset.method === state.method) return;
    state.method = b.dataset.method;
    renderBrew(true);
  });
  $('brew-servings').addEventListener('input', e => { state.servings = Number(e.target.value); renderBrew(false); });

  /* ---------- 9. Fix your cup ---------- */
  function renderFix() {
    const f = FIXES[state.fix];
    document.querySelectorAll('#fix-chips [data-fix]').forEach(c => c.setAttribute('aria-pressed', String(Number(c.dataset.fix) === state.fix)));
    $('fix-panel').innerHTML = `
      <div><span class="mono muted">What is happening</span><h4>${f.label}</h4><p>${f.why}</p></div>
      <div><span class="mono muted">Try this, in order</span><ol class="recipe-steps">${f.fixes.map((x, k) => `<li style="--k:${k}">${x}</li>`).join('')}</ol></div>`;
  }
  $('fix-chips').innerHTML = FIXES.map((f, i) => `<button class="chip" type="button" data-fix="${i}" aria-pressed="false">${f.label}</button>`).join('');
  $('fix-chips').addEventListener('click', e => {
    const c = e.target.closest('[data-fix]');
    if (!c) return;
    state.fix = Number(c.dataset.fix);
    renderFix();
  });

  /* ---------- 10. Small UI: mobile menu, copy email ---------- */
  const nav = $('site-nav'), navToggle = $('nav-toggle');
  const setMenu = open => { nav.classList.toggle('open', open); navToggle.setAttribute('aria-expanded', String(open)); navToggle.textContent = open ? 'Close' : 'Menu'; };
  navToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
  nav.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });

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

  /* ---------- 11. Motion ---------- */
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

    // Reveal on scroll. Once an element has arrived, drop the attribute so its own hover transitions take over.
    if ('IntersectionObserver' in window) {
      document.documentElement.classList.add('js-motion');
      const io = new IntersectionObserver(entries => entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        el.classList.add('in'); io.unobserve(el);
        setTimeout(() => el.removeAttribute('data-reveal'), 1600);
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

  /* ---------- 12. Boot ---------- */
  state.servings = Number($('brew-servings').value) || 2;
  renderLots();
  renderGear();
  renderPlans();
  renderCart();
  renderBrew(true);
  renderFix();
  initMotion();          // last, so it can see the cards rendered above
})();
