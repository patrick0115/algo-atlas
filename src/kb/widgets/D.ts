// @ts-nocheck —— 原講義 public/semi/D-package.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    // 形狀：[class, x, y, w, h]；圓：['c', cx, cy, r, class]；路徑：['p', d, class]；文字：['t', x, y, 字, class]；箭頭：['a', x, y1, y2]
    const dies = (y, h, gap, cls) => {
      const out = [];
      for (let i = 0; i < 8; i++) out.push([cls || 'm-sub', 40 + i * 70 + gap / 2, y, 70 - gap, h]);
      return out;
    };
    const SUBS = ['m-pcb', 120, 200, 400, 24];
    const GLUE = ['m-glue', 230, 192, 180, 8];
    const DIE = ['m-sub', 230, 162, 180, 30];
    const PADS = [['m-cu', 140, 196, 20, 4], ['m-cu', 166, 196, 18, 4], ['m-cu', 456, 196, 18, 4], ['m-cu', 480, 196, 20, 4]];
    const WIRES = [['p', 'M240,162 Q232,120 150,196', 'wire'], ['p', 'M400,162 Q408,120 490,196', 'wire'],
                   ['p', 'M260,162 Q256,132 175,196', 'wire'], ['p', 'M380,162 Q384,132 465,196', 'wire']];
    const MOLD = ['m-mold', 120, 128, 400, 72];
    const BALLS = [];
    for (let x = 150; x <= 490; x += 42.5) BALLS.push(['c', x, 232, 8, 'm-solder']);
    const PKG = [SUBS, GLUE, DIE, ...PADS, ...WIRES, MOLD, ...BALLS];

    const steps = [
      { code: 'B → D', name: '晶圓完成', ph: '測試',
        what: '晶圓廠交出整片晶圓，上面排滿同樣的晶片（die），還沒切開。',
        why: 'B 章的終點就是 D 章的起點。這時候還不知道哪幾顆是好的。',
        d: [...dies(170, 40, 2), ['t', 40, 160, '一整片晶圓（側面），每一格是一顆晶片', 't-small']] },
      { code: 'D04', name: 'CP 晶圓測試', ph: '測試',
        what: '探針卡的細針扎在每顆晶片的 pad 上，ATE 送訊號、比對結果。壞的晶片標記在 wafer map 上。',
        why: '壞晶片在這裡就丟掉，不浪費封裝成本。針扎太多次會傷 pad，影響後面打線。',
        d: [...dies(170, 40, 2), ['bx', 180, 80, 140, 30], ['t', 214, 100, '探針卡', ''],
            ['ln-fg', 200, 110, 1, 60], ['ln-fg', 225, 110, 1, 60], ['ln-fg', 275, 110, 1, 60], ['ln-fg', 300, 110, 1, 60],
            ['t', 489, 196, '✕', 't-strong'], ['t', 420, 236, '壞的晶片記在 wafer map', 't-small']] },
      { code: 'D01', name: '背面研磨', ph: '封裝',
        what: '把晶圓背面磨薄，讓封裝做得更薄，也比較好切。',
        why: '晶圓原本約 775 µm 厚，薄型封裝會磨到一兩百微米甚至更薄。磨太薄容易破、翹。',
        d: [['bx', 40, 170, 560, 40], ...dies(170, 20, 2), ['t', 40, 160, '虛線是原本的厚度', 't-small'], ['t', 40, 236, '從背面磨掉', 't-small']] },
      { code: 'D01', name: '切割', ph: '封裝',
        what: '晶圓貼在切割膠帶上，用鑽石刀或雷射沿著晶片之間的切割道切開。',
        why: '切割會造成邊緣崩缺（chipping），太嚴重會讓晶片裂開。',
        d: [['m-tape', 40, 190, 560, 10], ...dies(170, 20, 8), ['c', 320, 140, 26, 'bx'], ['t', 354, 130, '切割刀', 't-small'], ['t', 40, 220, '切割膠帶', 't-small']] },
      { code: 'D02', name: '黏晶', ph: '封裝',
        what: '把好的晶片撿起來，用黏晶膠固定在封裝基板上。',
        why: '只撿 CP 測過是好的晶片。黏晶膠也是散熱路徑，有空洞會讓晶片過熱。',
        d: [SUBS, GLUE, DIE, ['t', 290, 182, '晶片', ''], ['t', 130, 240, '封裝基板（多層有機板）', 't-small'], ['t', 420, 188, '黏晶膠', 't-small']] },
      { code: 'D02', name: '打線', ph: '封裝',
        what: '用金線或銅線把晶片上的 pad 一根一根接到基板的接點上。',
        why: '第一點在晶片燒球壓下（ball bond），第二點在基板壓扁拉斷（stitch bond）。覆晶封裝則是晶片翻過來直接用凸塊接，沒有這一步。',
        d: [SUBS, GLUE, DIE, ...PADS, ...WIRES, ['t', 290, 182, '晶片', ''], ['t', 130, 240, '金屬線從晶片拉到基板', 't-small']] },
      { code: 'D01', name: '封膠', ph: '封裝',
        what: '用環氧樹脂封膠（mold compound）把晶片和線整個包起來。',
        why: '保護晶片和線不受碰撞、水氣。封膠會吸濕，這就是 MSL 與爆米花效應的由來（D05）。',
        d: [SUBS, GLUE, DIE, ...PADS, ...WIRES, MOLD, ['t', 280, 120, '封膠', 't-small']] },
      { code: 'D01', name: '植球', ph: '封裝',
        what: '在基板底面植上錫球，之後焊到客戶的 PCB 上。',
        why: '錫球排成整面陣列，所以叫 BGA。錫球要吃下晶片、基板、PCB 之間的熱膨脹差。',
        d: [...PKG, ['t', 130, 262, '錫球（之後焊到 PCB）', 't-small']] },
      { code: 'D04', name: 'FT 最終測試', ph: '測試',
        what: '整顆封裝放進測試座，ATE 測全部功能與速度，再依結果分 bin。',
        why: '抓封裝造成的問題（打線、應力），並依速度、功耗分等級出貨。',
        d: [['bx', 100, 110, 440, 150], ...PKG, ['t', 110, 104, '測試座（socket），連到 ATE', 't-small'],
            ['ln-fg', 150, 240, 1, 18], ['ln-fg', 235, 240, 1, 18], ['ln-fg', 320, 240, 1, 18], ['ln-fg', 405, 240, 1, 18], ['ln-fg', 490, 240, 1, 18]] },
      { code: 'D05', name: 'Burn-in／可靠度', ph: '可靠度',
        what: '放進高溫爐加偏壓：burn-in 篩掉早夭品；HTOL、HAST、TC 等抽樣測試證明能用好幾年。',
        why: '用高溫、高濕、溫度循環把老化加速。失效的樣品送 FA 找原因。',
        d: [['bx', 80, 70, 480, 200], ...PKG, ['t', 96, 96, '高溫爐：例如 125 °C 加偏壓', 't-small'], ['t', 96, 114, '加速老化，把早夭期燒過去', 't-small']] },
    ];

    const NS = 'http://www.w3.org/2000/svg';
    const $ = id => document.getElementById(id);
    let cur = 0;
    const el = (tag, attrs) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    };

    function draw(i) {
      const g = $('layers');
      g.innerHTML = '';
      steps[i].d.forEach(s => {
        if (s[0] === 't') {
          const t = el('text', { x: s[1], y: s[2], class: s[4] });
          t.textContent = s[3];
          g.appendChild(t);
        } else if (s[0] === 'c') {
          g.appendChild(el('circle', { cx: s[1], cy: s[2], r: s[3], class: s[4] }));
        } else if (s[0] === 'p') {
          g.appendChild(el('path', { d: s[1], class: s[2] }));
        } else if (s[0] === 'bx') {
          g.appendChild(el('rect', { class: 'bx dash', x: s[1], y: s[2], width: s[3], height: s[4], rx: 6 }));
        } else if (s[0] === 'ln-fg') {
          g.appendChild(el('line', { class: 'ln-fg', x1: s[1], y1: s[2], x2: s[1], y2: s[2] + s[4] }));
        } else {
          g.appendChild(el('rect', { class: s[0], x: s[1], y: s[2], width: s[3], height: s[4] }));
        }
      });
      const st = steps[i];
      $('stTitle').textContent = `${i + 1}. ${st.name}（${st.code}）`;
      $('stWhat').textContent = st.what;
      $('stWhy').textContent = st.why;
      $('phase').textContent = `${st.ph}　第 ${i + 1} / ${steps.length} 步`;
      document.querySelectorAll('#steps button').forEach((b, k) => b.classList.toggle('on', k === i));
      $('prev').disabled = i === 0;
      $('next').disabled = i === steps.length - 1;
    }

    const ul = $('steps');
    steps.forEach((st, i) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = `<span class="no">${i + 1}</span>${st.name}`;
      b.addEventListener('click', () => { cur = i; draw(cur); });
      li.appendChild(b);
      ul.appendChild(li);
    });
    $('prev').addEventListener('click', () => { if (cur > 0) draw(--cur); });
    $('next').addEventListener('click', () => { if (cur < steps.length - 1) draw(++cur); });
    draw(0);
  })();
  return cleanup
}
