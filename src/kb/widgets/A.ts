// @ts-nocheck —— 原講義 public/semi/A-device.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    const VT = 0.4;
    const $ = id => document.getElementById(id);
    const parts = {
      body: ['基板（body）', 'A01 半導體基礎物理', 'p 型矽：電洞是多數載子。能帶、摻雜、費米能階都在講它。基板接的電壓會透過 body effect 改變 Vt（A03）。', '#a01'],
      dep: ['空乏區', 'A02 PN 接面', '源極、汲極（n+）和 p 型基板形成 PN 接面，交界處沒有自由載子。平常逆偏，帶來寄生的接面電容與接面漏電。', '#a02'],
      sd: ['源極／汲極（n+）', 'A02 PN 接面／B05 佈植', '高濃度 n 型區，是電子進出通道的地方。用離子佈植以閘極為遮罩自對準做出來。', '#a02'],
      gdep: ['閘極下的空乏區', 'A03 MOSFET', '閘極的正電壓把表面電洞推走，留下不能動的負離子（游離受體）。V_G 到 Vt 之前，閘極電壓都花在撐開這一層；超過 Vt 後空乏區幾乎不再變厚，多出來的電荷都變成通道電子。', '#a03'],
      ch: ['通道（反轉層）', 'A03 MOSFET', '閘極電壓超過 Vt，p 型表面被反轉成 n 型的一層薄電子層，源汲極因此接通。', '#a03'],
      ox: ['閘極氧化層', 'A04 微縮與變異', '越薄閘極控制越強，但薄到 1 nm 左右電子會直接穿隧，閘極漏電暴增，所以改用 high-k 材料。', '#a04'],
      gate: ['閘極', 'A03／A04／A05', '施加電壓控制通道。閘長 L 越短越快，但短到一個程度會出現短通道效應；FinFET／GAA 就是讓閘極包更多面。', '#a04'],
    };

    // ---- 載子：電洞○、游離受體−、通道電子● ----
    const NS = 'http://www.w3.org/2000/svg';
    const DEP_MAX = 50, N_E = 40;
    const mk = (tag, attrs, parent) => {
      const el = document.createElementNS(NS, tag);
      for (const a in attrs) el.setAttribute(a, attrs[a]);
      parent.appendChild(el);
      return el;
    };
    const g = $('carriers');
    const holes = [];   // 閘極下會被推走的電洞（附帶留下的 −）
    for (let y = 178; y <= 226; y += 16)
      for (let x = 250; x <= 390; x += 20) {
        const minus = mk('text', { x: x - 3, y: y + 4, class: 't-muted', 'font-size': 12, opacity: 0 }, g);
        minus.textContent = '−';
        const h = mk('circle', { cx: x, cy: y, r: 3, fill: 'none', stroke: 'var(--fg)', 'stroke-width': 1 }, g);
        h.style.transition = 'opacity .3s, transform .3s';
        holes.push({ y, h, minus });
      }
    for (let y = 242; y <= 290; y += 16)   // 其他地方的電洞，固定不動
      for (let x = 32 + (y % 32 ? 10 : 0); x <= 610; x += 20)
        mk('circle', { cx: x, cy: y, r: 3, fill: 'none', stroke: 'var(--faint)', 'stroke-width': 1 }, g);
    const elecs = Array.from({ length: N_E }, (_, i) => ({
      x: 242 + 156 * i / N_E, f: Math.random(),
      el: mk('circle', { r: 2.4, class: 'fill-fg', opacity: 0 }, g),
    }));
    // 源極／汲極 n+ 本來就有大量自由電子；缺的只是中間那座橋（通道）
    const pool = (x0) => Array.from({ length: 28 }, () => ({
      x0, x: x0 + Math.random() * 186, y: 174 + Math.random() * 36,
      el: mk('circle', { r: 2.4, class: 'fill-fg' }, g),
    }));
    const reservoirs = [...pool(52), ...pool(402)];
    function drawPools() {
      reservoirs.forEach(e => {
        e.el.setAttribute('cx', e.x.toFixed(1));
        e.el.setAttribute('cy', e.y.toFixed(1));
      });
    }

    let cur = { ov: 0, vd: 0, ts: 0, td: 0, xp: 400, sat: false, I: 0 };
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

    function thick(x) {   // 通道在位置 x 的厚度（px）
      if (cur.ov <= 0) return 0;
      if (!cur.sat) return cur.ts + (cur.td - cur.ts) * (x - 240) / 160;
      return x < cur.xp ? Math.max(1.5, cur.ts * (1 - (x - 240) / (cur.xp - 240))) : 1.5;
    }

    function drawElecs() {
      const n = cur.ov <= 0 ? 0 : Math.round(N_E * Math.min(cur.ov, 0.8) / 0.8);
      elecs.forEach((e, i) => {
        const on = i < n;
        e.el.setAttribute('opacity', on ? 1 : 0);
        if (!on) return;
        const t = thick(e.x);
        e.el.setAttribute('cx', e.x.toFixed(1));
        e.el.setAttribute('cy', (171.5 + e.f * Math.max(0, t - 3)).toFixed(1));
      });
    }

    function update() {
      const vg = +$('vg').value, vd = +$('vd').value;
      $('vgv').textContent = vg.toFixed(2) + ' V';
      $('vdv').textContent = vd.toFixed(2) + ' V';
      const ov = vg - VT, k = 20 / 0.8;
      let pts = '', region, txt, pinch = '';
      // 空乏區：V_G 到 Vt 之前持續撐開，之後大致固定
      const dep = DEP_MAX * Math.sqrt(Math.min(vg, VT) / VT);
      $('gdep').setAttribute('height', dep);
      holes.forEach(o => {
        const gone = o.y < 170 + dep;
        o.h.style.opacity = gone ? 0 : 1;
        o.h.style.transform = gone ? 'translateY(14px)' : '';
        o.minus.setAttribute('opacity', gone ? 1 : 0);
      });
      cur = { ov, vd, ts: 0, td: 0, xp: 400, sat: false, I: 0 };
      if (ov <= 0) {
        region = '截止區';
        txt = vg === 0
          ? `V_G = 0：閘極下的表面跟基板一樣，滿滿是電洞，源汲極之間是兩個背對背的 PN 接面，電子過不去。`
          : `V_G（${vg.toFixed(2)} V）還沒到 Vt（${VT} V）：表面電洞被推走，形成空乏區，只剩不能動的負離子；但吸上來的電子還不夠，沒有通道。仍有一點點次臨界漏電，溫度越高越多。`;
      } else if (vd < ov) {
        const ts = ov * k, td = (ov - vd) * k;
        pts = `240,170 400,170 400,${170 + td} 240,${170 + ts}`;
        cur = { ov, vd, ts, td, xp: 400, sat: false, I: ov * vd - vd * vd / 2 };
        region = '線性區';
        txt = `V_D（${vd.toFixed(2)} V）< V_G − Vt（${ov.toFixed(2)} V）：通道從源極一路連到汲極，靠汲極那端稍薄。電流大致隨 V_D 線性增加，像一顆電阻。`;
      } else {
        const ts = ov * k, xp = 400 - Math.min(40, 40 * (vd - ov) / 0.8);
        pts = `240,170 ${xp},170 240,${170 + ts}`;
        cur = { ov, vd, ts, td: 0, xp, sat: true, I: ov * ov / 2 };
        region = '飽和區';
        txt = `V_D（${vd.toFixed(2)} V）≥ V_G − Vt（${ov.toFixed(2)} V）：汲極端的通道被夾止。電子流到夾止點後被強電場直接掃進汲極；多加的 V_D 都落在夾止區，電流幾乎不再增加。`;
        pinch = '↑ 夾止區';
        $('pinch').setAttribute('x', xp - 24);
      }
      $('ch').setAttribute('points', pts);
      $('pinch').textContent = pinch;
      $('region').textContent = region;
      $('regionTxt').textContent = txt;
      let flow, flow2 = '';
      if (ov <= 0) { flow = '沒有通道：S、D 的電子過不去'; flow2 = '中間只有電洞和空乏區，沒有橋'; }
      else if (vd === 0) { flow = '通道接通了，但 V_D = 0'; flow2 = '兩端沒有電壓差，電子原地不動'; }
      else { flow = '電子流：S ⟶ D'; flow2 = '電流方向相反（D → S），因為電子帶負電'; }
      $('flow').textContent = flow;
      $('flow2').textContent = flow2;
      drawElecs();
      drawPools();
    }

    // 電子從源極流到汲極；速度 ∝ 電流 ÷ 通道電荷量
    let last = 0;
    function tick(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const v = cur.ov > 0 ? 400 * cur.I / cur.ov : 0;
      reservoirs.forEach(e => {   // n+ 裡電子很多，同樣電流下走得比通道慢
        e.x += v * 0.5 * dt + (Math.random() - 0.5) * 0.8;
        e.y = Math.min(210, Math.max(174, e.y + (Math.random() - 0.5) * 0.8));
        if (e.x > e.x0 + 186) e.x -= 186;
        if (e.x < e.x0) e.x += 186;
      });
      drawPools();
      if (cur.ov > 0) {
        elecs.forEach(e => {
          const boost = cur.sat && e.x > cur.xp ? 3 : 1;
          e.x += v * boost * dt;
          if (e.x > 398) { e.x -= 156; e.f = Math.random(); }
          e.f = Math.min(1, Math.max(0, e.f + (Math.random() - 0.5) * 0.15));
        });
        drawElecs();
      }
      requestAnimationFrame(tick);
    }
    if (!reduce) requestAnimationFrame(tick);

    // 自動播放：先掃 V_G 看通道出現，再掃 V_D 看夾止
    let playT0 = null;
    function stopPlay() {
      playT0 = null;
      $('play').textContent = '▶ 自動播放';
    }
    function play(now) {
      if (playT0 === null) return;
      const t = (now - playT0) / 1000;
      if (t < 6) { $('vg').value = 1.2 * t / 6; $('vd').value = 0.1; }
      else if (t < 10) { $('vg').value = 1.2; $('vd').value = 0.1 + 1.1 * (t - 6) / 4; }
      else { $('vg').value = 1.2; $('vd').value = 1.2; update(); stopPlay(); return; }
      update();
      requestAnimationFrame(play);
    }
    $('play').addEventListener('click', () => {
      if (playT0 !== null) { stopPlay(); return; }
      $('play').textContent = '■ 停止';
      playT0 = performance.now();
      requestAnimationFrame(play);
    });

    document.querySelectorAll('#mos .hot').forEach(el => el.addEventListener('click', () => {
      const p = parts[el.dataset.k];
      document.querySelectorAll('#mos .hot').forEach(e => e.classList.toggle('sel', e.dataset.k === el.dataset.k));
      $('partTitle').textContent = `${p[0]}（${p[1]}）`;
      $('partTxt').innerHTML = `${p[2]} <a href="${p[3]}">看這一節 →</a>`;
    }));
    $('vg').addEventListener('input', () => { stopPlay(); update(); });
    $('vd').addEventListener('input', () => { stopPlay(); update(); });
    update();
  })();
  return cleanup
}
