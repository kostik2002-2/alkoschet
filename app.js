// ==========================================================
// DOM helpers and state
// ==========================================================
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

let mood = 'normal';

// ==========================================================
// Calculator controls
// ==========================================================
const ids = ['nonDrinkers', 'men', 'hours', 'food', 'season'];
ids.forEach(id => {
  $('#' + id).addEventListener('input', () => calc(true));
  $('#' + id).addEventListener('change', () => calc(true));
});

$('#guests').addEventListener('input', () => {
  if ($('#guests').value === '') return;
  calc(false);
});

$('#guests').addEventListener('change', () => calc(true));

$('#mood').addEventListener('click', e => {
  if (!e.target.dataset.mood) return;
  mood = e.target.dataset.mood;
  $$('#mood button').forEach(b => b.classList.toggle('on', b === e.target));
  calc();
});

// ==========================================================
// Calculator helpers
// ==========================================================
function ceil(n) { return Math.max(0, Math.ceil(n)); }
function num(id) { return Math.max(0, parseFloat($('#' + id).value) || 0); }
function pluralGuest(n) {
  n = Math.abs(Math.trunc(n)) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return 'гостей';
  if (n1 === 1) return 'гость';
  if (n1 > 1 && n1 < 5) return 'гостя';
  return 'гостей';
}


function drinkingPhrase(n) {
  n = Math.abs(Math.trunc(n));
  const n100 = n % 100;
  const n10 = n % 10;
  if (n100 >= 11 && n100 <= 14) return `${n} гостей пьют`;
  if (n10 === 1) return `${n} гость пьёт`;
  if (n10 >= 2 && n10 <= 4) return `${n} гостя пьют`;
  return `${n} гостей пьют`;
}


// ==========================================================
// Calculator logic
// ==========================================================
function enforceLimits(forceGuestsMinimum = true) {
  const guestsEl = $('#guests');
  let guests = parseInt(guestsEl.value, 10);
  if (!Number.isFinite(guests)) guests = 10;
  if (forceGuestsMinimum && guests < 10) guests = 10;
  if (guests > 1000) guests = 1000;
  if (forceGuestsMinimum || parseInt(guestsEl.value, 10) > 1000) guestsEl.value = guests;

  const nonEl = $('#nonDrinkers');
  let non = Math.max(0, parseInt(nonEl.value || 0));
  nonEl.max = guests;
  if (non > guests) {
    non = guests;
    nonEl.value = guests;
  }

  const menEl = $('#men');
  const maxMen = Math.max(0, Math.min(guests - non, guests - 1));
  menEl.max = maxMen;
  if ((parseInt(menEl.value || 0)) > maxMen) {
    menEl.value = maxMen;
  }
}

function calc(forceGuestsMinimum = true) {
  enforceLimits(forceGuestsMinimum); const guests = num('guests'), non = Math.min(num('nonDrinkers'), guests), rawMen = num('men'), drinkers = (non === 0 && rawMen === 0) ? Math.max(0, guests - 1) : Math.max(0, guests - non), men = Math.min(rawMen, Math.max(0, Math.min(drinkers, guests - 1))), women = Math.max(0, drinkers - men), hours = Math.min(8, Math.max(4, num('hours')));
  $('#hours').value = hours;
  const moodK = { soft: .68, normal: 1, party: 1.23 }[mood], timeK = Math.min(1.35, Math.max(.82, hours / 7)), winter = $('#season').value === 'winter', meat = $('#food').value === 'meat', fish = $('#food').value === 'fish';
  const foodStrong = meat ? 1.08 : fish ? .92 : 1; const seasonStrong = winter ? 1.1 : .96;
  const champagneMood = mood === 'soft' ? .82 : mood === 'party' ? 1.08 : 1;
  const champagneB = drinkers === 0 ? 0 : ceil((guests * .24 + drinkers * .12) * champagneMood);
  const wineB = ceil(((women * .72 + men * .32) * moodK * timeK * (fish ? 1.12 : 1)) / .75);
  const strongL = (men * .52 + women * .2) * moodK * timeK * foodStrong * seasonStrong; const strongB = ceil(strongL / .5);
  const extraHours = Math.max(0, hours - 4);
  const beerPeoplePerLiter = { soft: 6, normal: 3, party: 2 }[mood];
  const beerL = ceil((drinkers / beerPeoplePerLiter) * (1 + extraHours * .1));
  const waterBase = winter ? guests / 3 : guests / 2;
  const waterL = ceil(waterBase * (1 + extraHours * .05));
  const juiceL = ceil((guests / 2) * (1 + extraHours * .05));
  
  $('#drinkersBadge').textContent = drinkingPhrase(drinkers);
  $('#champagne').textContent = champagneB + ' бут.';
  $('#wine').textContent = wineB + ' бут.';
  $('#strong').textContent = strongB + ' бут.';
  $('#beer').textContent = beerL + ' л';
  $('#water').textContent = waterL + ' л';
  $('#juice').textContent = juiceL + ' л';
  
  $('#champagneL').textContent = `примерно ${ceil(champagneB * .75)} л`;
  $('#wineL').textContent = `примерно ${ceil(wineB * .75)} л`;
  $('#strongL').textContent = `примерно ${ceil(strongB * .5)} л`;
  $('#totalText').textContent = `Для ${guests} гостей: ${champagneB} бут. шампанского, ${wineB} бут. вина, ${strongB} бут. крепкого.`;
}

function listText() {
  return `Алкосчёт — список напитков\nГостей: ${num('guests')}, непьющих/детей: ${num('nonDrinkers')}\nШампанское: ${$('#champagne').textContent}\nВино: ${$('#wine').textContent}\nКрепкий алкоголь: ${$('#strong').textContent}\nПиво: ${$('#beer').textContent}\nВода: ${$('#water').textContent}\nСоки/морсы: ${$('#juice').textContent}\n\nРасчет примерный, округлен вверх.`;
}

$('#copyBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(listText()); } catch (e) {}
  $('#toast').classList.add('show');
  setTimeout(() => $('#toast').classList.remove('show'), 1700);
});

// ==========================================================
// Article data
// ==========================================================
const articleHeroes = {
  traditions: { src: 'img/001.webp', alt: 'Роскошная свадебная сервировка с розами, свечами и хрустальными бокалами' },
  a20: { src: 'img/002.webp', alt: 'Зимний свадебный стол в уютном деревянном доме на севере России' },
  a50: { src: 'img/003.webp', alt: 'Классическая светлая свадебная сервировка в элегантном банкетном зале' },
  a100: { src: 'img/004.webp', alt: 'Южная свадебная сервировка на террасе у моря на закате' },
  faq: { src: 'img/005.webp', alt: 'Современная свадебная сервировка с цветами, свечами и башней из бокалов' }
};

const preloadedArticleHeroes = new Map();

Object.values(articleHeroes).forEach(({ src }) => {
  const img = new Image();
  img.src = src;
  preloadedArticleHeroes.set(src, img);
});

function updateArticleHero(hero) {
  const heroImg = $('#articleHeroImg');
  if (!heroImg) return;

  heroImg.alt = hero.alt;

  const cachedImg = preloadedArticleHeroes.get(hero.src);
  if (cachedImg?.complete) {
    heroImg.src = hero.src;
    return;
  }

  const img = cachedImg || new Image();
  img.onload = () => {
    heroImg.src = hero.src;
  };
  img.src = hero.src;
  preloadedArticleHeroes.set(hero.src, img);
}

const articleAd = '<div class="article-ad"><b>Полезное предложение</b><br>Свадебный сервис, банкетная площадка или аккуратная реклама.</div>';

const galleryData = {
  traditions: [
    { src: 'img/006.webp', alt: 'Хрустальные бокалы и свечи на свадебном столе', cap: 'Хрусталь и свечи' },
    { src: 'img/007.webp', alt: 'Традиционный свадебный каравай на вышитом рушнике', cap: 'Каравай' },
    { src: 'img/008.webp', alt: 'Вышитый свадебный текстиль и праздничная сервировка', cap: 'Вышивка и традиции' }
  ],
  a20: [
    { src: 'img/009.webp', alt: 'Зимняя северная сервировка у окна со снегом', cap: 'Северная традиция' },
    { src: 'img/010.webp', alt: 'Официант разливает шампанское в башню из бокалов', cap: 'Игристое' },
    { src: 'img/011.webp', alt: 'Руки гостей поднимают хрустальные бокалы для свадебного тоста', cap: 'Свадебный тост' }
  ],
  a50: [
    { src: 'img/012.webp', alt: 'Роскошная цветочная композиция на свадебном столе', cap: 'Цветочная композиция' },
    { src: 'img/013.webp', alt: 'Премиальная свадебная сервировка с фарфором и золотыми приборами', cap: 'Премиальная сервировка' },
    { src: 'img/014.webp', alt: 'Свадебный десертный стол с тортом, макаронами и свечами', cap: 'Десертный стол' }
  ],
  a100: [
    { src: 'img/015.webp', alt: 'Современная минималистичная свадебная сервировка', cap: 'Современный стиль' },
    { src: 'img/016.webp', alt: 'Исторический банкетный зал с люстрами и свадебными столами', cap: 'Исторический зал' },
    { src: 'img/017.webp', alt: 'Тихий свадебный зал после праздника со свечами и цветами', cap: 'После праздника' }
  ],
  faq: [
    { src: 'img/018.webp', alt: 'Южная свадебная сервировка у моря с цитрусами и цветами', cap: 'Южное застолье' },
    { src: 'img/019.webp', alt: 'Летняя веранда со свадебным столом, свечами и блюдами', cap: 'Летняя веранда' },
    { src: 'img/020.webp', alt: 'Подарок гостю и именная карточка на свадебной сервировке', cap: 'Подарки гостям' }
  ]
};

const gallery = name => `<div class="illustrations">${(galleryData[name] || galleryData.traditions).map((img, i) => `<button class="gallery-item" type="button" data-gallery="${name}" data-index="${i}" aria-label="Открыть фото"><img src="${img.src}" alt="${img.alt}" loading="lazy"></button>`).join('')}</div>`;
let currentArticleName = 'traditions';

const articles = {
  a20: ['Сколько алкоголя нужно на свадьбу на 20 гостей', `<p>Свадьба на 20 человек — это камерный формат: гости хорошо знают друг друга, ведущий легко держит темп, а напитки проще рассчитать без огромного склада бутылок. Но запас всё равно нужен: в маленькой компании одна-две активные пары гостей могут заметно изменить расход.</p><h3>Примерный набор</h3><table><tr><th>Напиток</th><th>Ориентир</th></tr><tr><td>Шампанское</td><td>7–9 бутылок</td></tr><tr><td>Вино</td><td>8–12 бутылок</td></tr><tr><td>Крепкий алкоголь</td><td>5–8 бутылок по 0,5 л</td></tr><tr><td>Пиво</td><td>3–12 л, если оно нужно гостям</td></tr><tr><td>Вода</td><td>7–12 л: зимой меньше, летом больше</td></tr><tr><td>Соки, морсы, лимонады</td><td>10–12 л</td></tr></table>${articleAd}<h3>Как считать аккуратнее</h3><p>Сначала вычтите детей, водителей и гостей, которые точно не пьют. Затем разделите оставшихся не по полу, а по привычкам: кто выбирает вино, кто крепкий алкоголь, кто пьёт только символически. Для маленькой свадьбы это обычно точнее любой универсальной формулы.</p>${gallery('a20')}<h3>Где лучше добавить запас</h3><p>На камерной свадьбе чаще всего не хватает не крепкого алкоголя, а игристого для первых тостов и обычной воды. Сок считаем проще: примерно 1 литр на 2 гостей, а каждый дополнительный час после четырёх часов немного увеличивает запас.</p>`],
  a50: ['Сколько алкоголя нужно на свадьбу на 50 гостей', `<p>Пятьдесят гостей — самый удобный размер для расчёта: уже есть полноценный банкет, но компания ещё не настолько большая, чтобы терять контроль над запасами. Обычно в таком формате важно сбалансировать три группы: игристое для встречи, вино для еды и крепкий алкоголь для тостов.</p><h3>Базовый ориентир</h3><table><tr><th>Напиток</th><th>Ориентир</th></tr><tr><td>Шампанское</td><td>16–22 бутылки</td></tr><tr><td>Вино</td><td>20–32 бутылки</td></tr><tr><td>Крепкий алкоголь</td><td>14–22 бутылки по 0,5 л</td></tr><tr><td>Пиво</td><td>9–35 л, зависит от режима компании</td></tr><tr><td>Вода</td><td>17–30 л: зимой меньше, летом больше</td></tr><tr><td>Соки, морсы, лимонады</td><td>25–30 л</td></tr></table>${articleAd}<h3>От чего сильнее всего меняется расчёт</h3><ul><li><b>Длительность банкета.</b> Четыре часа и восемь часов — это разные праздники.</li><li><b>Сезон.</b> Летом быстрее расходуются вода, лимонады и лёгкое вино.</li><li><b>Состав гостей.</b> Молодёжная компания, родственники старшего поколения и смешанный формат пьют по-разному.</li><li><b>Меню.</b> Плотное мясное меню чаще требует большего запаса крепких напитков, лёгкое меню — вина и воды.</li></ul>${gallery('a50')}<h3>Практичный совет</h3><p>Для 50 гостей лучше не пытаться покупать “ровно в ноль”. Воду считаем отдельно по сезону, сок — примерно 1 литр на 2 гостей, а пиво — по настроению компании: спокойный, средний или активный формат.</p>`],
  a100: ['Сколько алкоголя нужно на свадьбу на 100 гостей', `<p>Свадьба на 100 гостей требует уже не просто расчёта, а организации. Важно заранее решить, где будет храниться запас, кто контролирует выдачу напитков и как банкетная площадка работает с вашим алкоголем.</p><h3>Базовый ориентир</h3><table><tr><th>Напиток</th><th>Ориентир</th></tr><tr><td>Шампанское</td><td>32–45 бутылок</td></tr><tr><td>Вино</td><td>45–65 бутылок</td></tr><tr><td>Крепкий алкоголь</td><td>30–45 бутылок по 0,5 л</td></tr><tr><td>Пиво</td><td>17–70 л, зависит от режима компании</td></tr><tr><td>Вода</td><td>34–60 л: зимой меньше, летом больше</td></tr><tr><td>Соки, морсы, лимонады</td><td>50–60 л</td></tr></table>${articleAd}<h3>Что важно на большом банкете</h3><p>При большом количестве гостей часть напитков лучше распределять по этапам: встреча гостей, первый стол, горячее, торт и финал вечера. Так меньше риск, что что-то закончится слишком рано или, наоборот, останется нераспакованным в коробках.</p>${gallery('a100')}<h3>Не забывайте безалкогольные напитки</h3><p>На большой свадьбе воду и соки лучше считать прозрачной формулой: вода — 1 литр на 2 гостей летом или на 3 гостей зимой, сок — 1 литр на 2 гостей в любом режиме. Каждый час после четырёх часов банкета немного увеличивает запас.</p>`],
  traditions: ['Российские свадебные застолья: традиции, регионы и современные привычки', `<h3>Общий принцип</h3><p>Российская свадьба часто строится вокруг длинного банкета: тосты, горячее, закуски, танцы и несколько волн подачи блюд. Поэтому напитки считают не только “по бокалам”, а с запасом на длительность вечера, состав гостей и сезон.</p>${articleAd}<h3>Кто и что чаще выбирает</h3><p>В практическом свадебном расчёте обычно учитывают простую разницу: часть гостей выбирает крепкий алкоголь, часть — вино и игристое, а часть не пьёт совсем. Поэтому калькулятор не должен считать всех одинаково. Пиво считается отдельно по темпу застолья, а вода и сок — по более понятным бытовым нормам.</p>${gallery('traditions')}<h3>Север, юг и крупные города</h3><ul><li><b>Север и холодные регионы.</b> В расчётах часто закладывают больше крепких напитков и меньше лёгких летних позиций, но итог всё равно зависит от конкретной компании.</li><li><b>Юг России.</b> Чаще уместнее расширять винную часть, добавлять воду, морсы, лимонады и безалкогольные напитки: жара сильно влияет на расход.</li><li><b>Москва, Петербург, крупные города.</b> Всё чаще встречается формат с вином, игристым, коктейлями и красивой безалкогольной альтернативой.</li></ul><h3>Народы России и семейные традиции</h3><p>У разных семей традиции могут отличаться сильнее, чем у регионов. На кавказских свадьбах часто важны масштабность застолья, тосты и большое количество гостей. У татарских, башкирских и других семей многое зависит от религиозности и семейных правил. У ромских свадеб часто подчёркивают щедрость, музыку, размах и длительное празднование, но конкретный набор напитков нельзя выводить только из национальности.</p><h3>Тенденции последних лет</h3><ul><li>На свадьбах чаще заранее учитывают непьющих гостей, детей, водителей и пожилых родственников.</li><li>Вырос интерес к вину, игристому и красивой подаче напитков.</li><li>Воду, соки, морсы и безалкогольные альтернативы всё чаще считают отдельно: вода зависит от сезона, сок — от количества гостей, а не от “настроения компании”.</li><li>Крепкий алкоголь по-прежнему важен для многих российских банкетов, но его лучше считать по составу гостей, а не “по максимуму”.</li></ul>`],
  faq: ['Частые вопросы о напитках на свадьбу', `<h3>Сколько шампанского нужно на свадьбу?</h3><p>Обычно шампанское нужно для встречи гостей, первого тоста, фотозоны и символических моментов. Если игристое будет только в начале, расход меньше. Если его будут пить весь вечер, его нужно считать уже как отдельную категорию напитков.</p><h3>Сколько воды брать?</h3><p>Воду считаем от сезона: летом ориентир — 1 литр на 2 гостей, зимой — 1 литр на 3 гостей. Если банкет длится дольше четырёх часов, каждый дополнительный час немного увеличивает запас.</p>${articleAd}<h3>Нужно ли покупать алкоголь с запасом?</h3><p>Да, но запас должен быть разумным. Лучше округлить вверх игристое, воду и несколько бутылок вина. Соки считаем примерно 1 литр на 2 гостей, а пиво — по режиму компании: 1 литр на 6 гостей в спокойном режиме, на 3 гостей в среднем и на 2 гостей в активном.</p>${gallery('faq')}<h3>Можно ли считать всё одной формулой?</h3><p>Можно для грубой прикидки, но лучше учитывать длительность банкета, сезон, меню и состав гостей. Именно поэтому калькулятор на главной странице даёт результат сразу, но позволяет менять параметры. Шампанское, вино и крепкий алкоголь считаются по основной формуле калькулятора. Пиво, вода и соки считаются отдельно: они зависят от режима, сезона и длительности банкета от 4 до 8 часов.</p>`]
};

// ==========================================================
// Navigation and routing
// ==========================================================
function route(name) {
  const home = $('#homeScreen');
  const article = $('#articleScreen');
  const isArticleOpen = document.body.classList.contains('article-open');
  const currentActiveScreen = isArticleOpen ? article : home;
  
  currentActiveScreen.classList.remove('screen-animate-in');
  currentActiveScreen.classList.add('screen-animate-out');
  
  setTimeout(() => {
    $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.route === name));
    
    if (name === 'home') {
      document.body.classList.remove('article-open');
      home.style.display = 'grid';
      article.classList.remove('show', 'screen-animate-out');
      
      home.classList.remove('screen-animate-out');
      home.classList.add('screen-animate-in');
      history.replaceState(null, '', '#');
      return;
    }
    
    const a = articles[name] || articles.faq;
    currentArticleName = name;
    document.body.classList.add('article-open');
    $('#articleTitle').textContent = a[0];
    
    const hero = articleHeroes[name] || articleHeroes.traditions;
    updateArticleHero(hero);
    $('#articleText').innerHTML = a[1];
    
    home.style.display = 'none';
    home.classList.remove('screen-animate-out');
    
    article.classList.add('show');
    article.classList.remove('screen-animate-out');
    article.classList.add('screen-animate-in');
    
    $('.article-scroll')?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
    history.replaceState(null, '', '#' + name);
  }, 240);
}

document.addEventListener('click', e => {
  const r = e.target.closest('[data-route]'); if (r) route(r.dataset.route);
  const item = e.target.closest('.gallery-item'); if (item) { e.preventDefault(); openGallery(item.dataset.gallery, Number(item.dataset.index || 0)); }
  const ph = e.target.closest('.ph,.mid-ph'); if (ph && ph.dataset.light) openLight(ph.dataset.light);
});

// ==========================================================
// Lightbox and gallery
// ==========================================================
let activeGallery = 'traditions', activeIndex = 0;

function clearLightboxText() {
  const wrapper = $('.lightbox-inner');
  wrapper.querySelectorAll('h3, p').forEach(el => el.remove());
}

function closeLightbox() {
  $('#lightbox').classList.remove('show', 'captioned');
  $('#lightImg').src = '';
  clearLightboxText();
}

function renderGallery() {
  const items = galleryData[activeGallery] || galleryData.traditions;
  const img = items[activeIndex];
  $('#lightImg').src = img.src; $('#lightImg').alt = img.alt;
}

function openGallery(name, index = 0) {
  clearLightboxText();
  activeGallery = name in galleryData ? name : 'traditions';
  activeIndex = Math.max(0, Math.min(index, (galleryData[activeGallery] || []).length - 1));
  $('#lightbox').classList.add('captioned');
  renderGallery();
  $('#lightbox').classList.add('show');
}

function stepGallery(delta) {
  const items = galleryData[activeGallery] || galleryData.traditions;
  activeIndex = (activeIndex + delta + items.length) % items.length; renderGallery();
}

function openLight(text, title = 'Информация') {
  $('#lightbox').classList.remove('captioned');
  $('#lightImg').src = '';
  clearLightboxText();

  const wrapper = $('.lightbox-inner');
  const h3 = document.createElement('h3');
  const p = document.createElement('p');

  h3.textContent = title;
  p.textContent = text;

  wrapper.insertBefore(h3, $('#closeLight'));
  wrapper.insertBefore(p, $('#closeLight'));

  $('#lightbox').classList.add('show');
}

$('#lbPrev').onclick = e => { e.stopPropagation(); stepGallery(-1); };
$('#lbNext').onclick = e => { e.stopPropagation(); stepGallery(1); };

$('#closeLight').onclick = closeLightbox;
$('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') closeLightbox(); });

document.addEventListener('keydown', e => {
  if (!$('#lightbox').classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  if ($('#lightbox').classList.contains('captioned') && e.key === 'ArrowLeft') stepGallery(-1);
  if ($('#lightbox').classList.contains('captioned') && e.key === 'ArrowRight') stepGallery(1);
});

let touchX = null;
$('#lightbox').addEventListener('touchstart', e => { touchX = e.changedTouches[0].clientX; }, { passive: true });
$('#lightbox').addEventListener('touchend', e => {
  if (touchX === null || !$('#lightbox').classList.contains('captioned')) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) stepGallery(dx > 0 ? -1 : 1);
  touchX = null;
}, { passive: true });

// ==========================================================
// Legal modal
// ==========================================================
const legalTexts = {
  privacy: 'Мы не собираем паспортные данные, адреса, телефоны и платежную информацию. Калькулятор работает прямо в браузере: введенные числа нужны только для расчета напитков и не отправляются владельцу сайта. На сайте присутствует Яндекс Реклама, счетчики посещаемости и кнопка доната — у этих сервисов могут быть собственные правила обработки данных.',
  terms: 'Алкосчёт дает примерный бытовой расчет напитков для свадебного банкета. Итог не является обязательной нормой покупки и может отличаться от реального расхода: на него влияют гости, сезон, меню, длительность праздника и правила площадки. Пользуясь сайтом, вы самостоятельно принимаете решение о количестве и составе напитков.'
};

function openLegalButton(btn) {
  if (!btn) return;
  openLight(legalTexts[btn.dataset.legal], btn.dataset.legal === 'privacy' ? 'Политика конфиденциальности' : 'Условия использования');
}

document.addEventListener('click', e => {
  const l = e.target.closest('[data-legal]');
  if (!l) return;
  e.preventDefault();
  e.stopPropagation();
  openLegalButton(l);
}, true);

document.addEventListener('pointerup', e => {
  const l = e.target.closest('[data-legal]');
  if (!l) return;
  e.preventDefault();
  e.stopPropagation();
  openLegalButton(l);
}, true);

// ==========================================================
// Initial render
// ==========================================================
calc();
if (location.hash) route(location.hash.slice(1));
