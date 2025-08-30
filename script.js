/* ====== 妖精さん育成ミニ：シンプル版 ====== */
/* Safari(iOS)前提。ドラッグ無効・タップPill・16:9安全レイアウト。 */

(() => {
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const $ = (q) => document.querySelector(q);
  const $$ = (q) => Array.from(document.querySelectorAll(q));

  const STORAGE_KEY = 'yousei_minigame_v1';

  // デフォルト状態
  const defaultState = {
    mood: 3,     // ♥️ 0..5
    sweets: 2,   // 🍬 0..5
    sleep: 3,    // 💤 0..5（ﾈﾝﾈで全回復）
    acorns: 10,  // 🌰 初期どんぐり
    isDay: true, // 昼/夜トグル
    wallpaper: 'milk' // 壁紙キー
  };

  const state = load();

  // DOM参照
  const sky = $('#sky');
  const fairy = $('#fairy');
  const sleepZ = $('#sleepZ');
  const fx = $('#fx');
  const statMood = $('#stat-mood');
  const statSweets = $('#stat-sweets');
  const statSleep = $('#stat-sleep');
  const acornEl = $('#acorns');

  const btnNade = $('#btn-nade');
  const btnOyatsu = $('#btn-oyatsu');
  const btnNenne = $('#btn-nenne');
  const btnDayNight = $('#btn-daynight');
  const btnShop = $('#btn-shop');

  const shopModal = $('#shopModal');
  const shopClose = $('#shopClose');
  const wallList = $('#wallList');

  // 壁紙候補（画像を増やさずCSSだけで変える）
  const WALLPAPERS = [
    { key: 'milk',  name: 'ミルク',  css: 'linear-gradient(180deg,#f7f8fc 0%,#eceff6 100%)', price: 3 },
    { key: 'mint',  name: 'ミント',  css: 'linear-gradient(180deg,#e8f8f4 0%,#d9f1eb 100%)', price: 3 },
    { key: 'navy',  name: 'ネイビー', css: 'linear-gradient(180deg,#0b1020 0%,#141c2c 100%)', price: 3 },
  ];

  /* ---------- 初期化 ---------- */
  applyWallpaper(state.wallpaper);
  applyDayNight(state.isDay);
  renderAll();

  // 画像ドラッグ無効（念のため）
  $$('img').forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault(), { passive: true });
  });

  /* ---------- ボタン動作 ---------- */
  btnNade.addEventListener('click', onNade);
  btnOyatsu.addEventListener('click', onOyatsu);
  btnNenne.addEventListener('click', onNenne);
  btnDayNight.addEventListener('click', onDayNight);
  btnShop.addEventListener('click', openShop);

  // Escでモーダル閉
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeShop();
  });

  // モーダル背景・ボタンで閉じる（必ず閉まる仕様）
  shopModal.addEventListener('click', (e) => {
    if (e.target.dataset.close) closeShop();
  });
  shopClose.addEventListener('click', closeShop);

  // 画面遷移/終了前に保存（保険）
  window.addEventListener('beforeunload', save, { passive: true });

  /* ---------- アクション実装 ---------- */

  // 1) ﾅﾃﾞﾅﾃﾞ = ｺﾞｷｹﾞﾝ+1 + ジャンプ演出
  function onNade() {
    state.mood = clamp(state.mood + 1, 0, 5);
    jumpFairy();
    maybeBonusAcorn(0.15);
    renderAll(); save();
  }

  // 2) ｵﾔﾂ = 🍒/🥮が降下 → 口パク → ジャンプ
  function onOyatsu() {
    const emoji = Math.random() < 0.5 ? '🍒' : '🥮';
    dropSnackToFairy(emoji).then(() => {
      // 口パク（立ち→ハッピー→立ち）
      mouthAnim(500);
      state.sweets = clamp(state.sweets + 1, 0, 5);
      jumpFairy();
      maybeBonusAcorn(0.1);
      renderAll(); save();
    });
  }

  // 3) ﾈﾝﾈ = 簡易移動 + 💤表示 + 睡眠全回復
  function onNenne() {
    // 窓の近くに少しだけ移動して寝たっぽい演出
    // （安全：位置はtranslateXだけ調整）
    const baseX = -50;        // 中央基準
    const shift = Math.random() < 0.5 ? -20 : 20; // 左右どちらか
    fairy.style.transition = 'transform .35s ease';
    fairy.style.transform = `translateX(${baseX + shift}%)`;

    // Zzz表示
    sleepZ.classList.add('show');
    setTimeout(() => sleepZ.classList.remove('show'), 1200);

    // フル回復
    state.sleep = 5;
    // 戻す
    setTimeout(() => {
      fairy.style.transform = `translateX(${baseX}%)`;
    }, 700);

    renderAll(); save();
  }

  // 5) 昼/夜トグル（窓の画像切替）
  function onDayNight() {
    state.isDay = !state.isDay;
    applyDayNight(state.isDay);
    save();
  }

  /* ---------- ビジュアル補助 ---------- */

  function jumpFairy() {
    fairy.classList.remove('jump');
    // リフローで再適用
    // eslint-disable-next-line no-unused-expressions
    fairy.offsetWidth;
    fairy.classList.add('jump');
  }

  function mouthAnim(ms = 400) {
    fairy.src = 'assets/fairy-happy.png';
    setTimeout(() => { fairy.src = 'assets/fairy-stand.png'; }, ms);
  }

  function dropSnackToFairy(emoji) {
    return new Promise((resolve) => {
      const rectStage = $('#stage').getBoundingClientRect();
      const rectFairy = fairy.getBoundingClientRect();

      // 目標位置（妖精の口あたり：少し上）
      const targetX = rectFairy.left + rectFairy.width * 0.5 - rectStage.left;
      const targetY = rectFairy.top + rectFairy.height * 0.3 - rectStage.top;

      const el = document.createElement('div');
      el.className = 'drop';
      el.textContent = emoji;
      fx.appendChild(el);

      // 開始位置：妖精の真上ちょいずれ
      const startX = targetX + (Math.random() * 80 - 40);
      const startY = -24; // ステージ上端外

      el.style.left = `${startX}px`;
      el.style.top = `0px`; // translateで制御
      el.style.setProperty('--tx', `${targetX - startX}px`);
      el.style.setProperty('--ty', `${targetY - 0}px`);

      // 次フレームで落下
      requestAnimationFrame(() => {
        el.classList.add('land');
        // 到達後、少しでフェード
        setTimeout(() => {
          el.classList.add('fade');
          setTimeout(() => {
            fx.removeChild(el);
            resolve();
          }, 180);
        }, 820);
      });
    });
  }

  function applyDayNight(isDay) {
    sky.src = isDay ? 'assets/sky-day.png' : 'assets/sky-night.png';
  }

  function applyWallpaper(key) {
    const item = WALLPAPERS.find(w => w.key === key) || WALLPAPERS[0];
    document.documentElement.style.setProperty('--wallpaper', item.css);
  }

  function renderAll() {
    statMood.textContent = '♥️'.repeat(state.mood) + '・'.repeat(5 - state.mood);
    statSweets.textContent = '🍬'.repeat(state.sweets) + '・'.repeat(5 - state.sweets);
    statSleep.textContent = '💤'.repeat(state.sleep) + '・'.repeat(5 - state.sleep);
    acornEl.textContent = String(state.acorns);
  }

  function maybeBonusAcorn(prob = 0.1) {
    if (Math.random() < prob) {
      state.acorns += 1;
    }
  }

  /* ---------- ショップ ---------- */

  function openShop() {
    // リスト生成（毎回最新状態で）
    wallList.innerHTML = '';
    WALLPAPERS.forEach(item => {
      const li = document.createElement('li');
      li.className = 'wall';

      const prev = document.createElement('div');
      prev.className = 'preview';
      prev.style.background = item.css;

      const meta = document.createElement('div');
      meta.className = 'meta';

      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = item.name;

      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = `🌰 ${item.price}`;

      const btn = document.createElement('button');
      btn.className = 'buy';
      btn.textContent = '購入して適用';
      btn.disabled = state.acorns < item.price;

      btn.addEventListener('click', () => {
        if (state.acorns >= item.price) {
          state.acorns -= item.price;
          state.wallpaper = item.key;
          applyWallpaper(item.key);
          renderAll(); save();
        }
      });

      meta.appendChild(name);
      meta.appendChild(price);
      meta.appendChild(btn);

      li.appendChild(prev);
      li.appendChild(meta);
      wallList.appendChild(li);
    });

    shopModal.classList.remove('hidden');
    // フォーカスを閉じるボタンへ（VoiceOver配慮）
    requestAnimationFrame(() => $('#shopClose').focus());
  }

  function closeShop() {
    shopModal.classList.add('hidden');
  }

  /* ---------- ストレージ ---------- */

  function save() {
    // 7. ローカル保存（所持どんぐり・壁紙・ステータス・空の状態）
    const data = {
      mood: state.mood,
      sweets: state.sweets,
      sleep: state.sleep,
      acorns: state.acorns,
      isDay: state.isDay,
      wallpaper: state.wallpaper
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (_) {
      // 失敗しても致命ではない
    }
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    } catch (_) {
      return { ...defaultState };
    }
  }
})();
