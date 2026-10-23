// @ts-nocheck —— 原講義 public/semi/F-industry.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    const $ = id => document.getElementById(id);
    const NS = 'http://www.w3.org/2000/svg';
    const el = (tag, attrs, txt) => {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      if (txt !== undefined) e.textContent = txt;
      return e;
    };

    const W = 150, H = 60;
    // 價值鏈方塊
    const N = {
      ip:     { x: 10,  y: 130, t: 'IP／EDA',  s: '工具與矽智財' },
      design: { x: 192, y: 130, t: 'IC 設計',  s: 'Fabless' },
      eq:     { x: 283, y: 20,  t: '設備',     s: '曝光、蝕刻、沉積' },
      mat:    { x: 465, y: 20,  t: '材料',     s: '晶圓、光阻、特化' },
      fab:    { x: 374, y: 130, t: '晶圓代工', s: 'Foundry' },
      osat:   { x: 556, y: 130, t: '封裝測試', s: 'OSAT' },
      sys:    { x: 738, y: 130, t: '系統廠',   s: '品牌、ODM、面板廠' },
    };

    const kv = rows => rows.map(([k, v]) => `<p class="kv"><span class="k">${k}</span>${v}</p>`).join('');

    const CHAIN = [
      { id: 'ip', title: 'IP／EDA：賣工具與零件給設計公司', body: kv([
        ['做什麼', 'EDA 是設計晶片用的軟體；IP 是現成的電路區塊（CPU 核心、高速介面、記憶體編譯器）。'],
        ['代表廠商', 'EDA：Synopsys 約 31%、Cadence 約 30%、Siemens EDA 約 13～14%（截至 2024）。IP：Arm、Synopsys、Cadence。'],
        ['怎麼收錢', 'EDA 收年度授權；IP 收授權費＋每顆權利金。'],
        ['毛利特性', '軟體型，毛利高；資本支出低，但研發門檻極高。'],
        ['台灣位置', '弱。台灣設計公司幾乎全用美系 EDA；2025 年 5～7 月美國曾暫停 EDA 對中國銷售，可見它也是管制開關。'],
      ]) },
      { id: 'design', title: 'IC 設計：定規格、畫電路、賣晶片', body: kv([
        ['做什麼', '定義規格、設計與驗證電路、寫測試程式，製造全部外包，最後以自己的品牌賣晶片。'],
        ['代表廠商', 'Nvidia、Qualcomm、AMD、聯發科；顯示驅動 IC：聯詠、奇景、矽創、天鈺、LX Semicon、Samsung LSI。'],
        ['怎麼收錢', '賣晶片。成本＝晶圓＋封測＋權利金＋攤提的光罩費與研發。'],
        ['毛利特性', '依產品差很多：有獨家性的 AI 晶片很高，成熟規格的 DDIC 會被價格戰壓低。'],
        ['台灣位置', '強，DDIC 尤其集中。天鈺本身就在這一格：DDIC、TCON、電源 IC。'],
      ]) },
      { id: 'eq', title: '設備：蓋晶圓廠要買的機台', body: kv([
        ['做什麼', '曝光、蝕刻、沉積、CMP、離子佈植、量測檢測。'],
        ['代表廠商', 'ASML（EUV 獨家）、Applied Materials、Lam Research、Tokyo Electron、KLA。'],
        ['怎麼收錢', '賣機台＋長期服務與零件。EUV 一台最高約 2 億美元，High-NA 約 3.7 億美元。'],
        ['毛利特性', '高，獨家機種議價力最強。'],
        ['台灣位置', '弱，以零組件、二手機台整修與廠務為主。美、日、荷掌握，是出口管制最常下手的一段。'],
      ]) },
      { id: 'mat', title: '材料：每天都在消耗的東西', body: kv([
        ['做什麼', '矽晶圓、光阻、濕化學品、CMP 研磨液、靶材、特殊氣體。'],
        ['代表廠商', '矽晶圓：信越、SUMCO、環球晶、Siltronic、SK Siltron。光阻：JSR、TOK、信越等日本廠。'],
        ['怎麼收錢', '賣耗材，量跟著晶圓廠稼動率走。'],
        ['毛利特性', '中等；但換供應商要重新驗證，客戶黏著度高。'],
        ['台灣位置', '矽晶圓有環球晶（全球第三，截至 2022）。日本 2019 年曾用光阻等三種材料卡住韓國。'],
      ]) },
      { id: 'fab', title: '晶圓代工：照別人的圖把晶圓做出來', body: kv([
        ['做什麼', '用客戶的光罩在晶圓上做出電晶體與金屬連線，交出已完成的晶圓。'],
        ['代表廠商', '台積電 72.5%、三星 5.9%、中芯 5.4%、聯電 3.9%、GF 3.2%（TrendForce，2026 Q2 營收市佔）。DDIC 常用聯電、世界先進、晶合、力積電。'],
        ['怎麼收錢', '按片計價，節點越先進片價越高；另收光罩費。'],
        ['毛利特性', '資本最密集。龍頭很高：台積電 2026 Q2 毛利率 67.7%；成熟製程二線廠較低、隨稼動率起伏。'],
        ['台灣位置', '全球最強。前十大裡台灣有台積電、聯電、世界先進、力積電四家。'],
      ]) },
      { id: 'osat', title: '封裝測試：把晶圓變成能焊上去的零件', body: kv([
        ['做什麼', '晶圓測試（CP）、切割、封裝、成品測試（FT）。DDIC 要先做金凸塊（bumping），再做 COF 捲帶封裝或直接 COG 貼到玻璃。'],
        ['代表廠商', '日月光、Amkor、長電；DDIC 封測：頎邦、南茂。先進封裝（CoWoS）台積電自己也做。'],
        ['怎麼收錢', '按顆或按片收加工費。'],
        ['毛利特性', '一般封測偏低到中；先進封裝因 AI 需求吃緊、議價力上升。'],
        ['台灣位置', '強。Nexperia 事件提醒：封測地點也會被政治化。'],
      ]) },
      { id: 'sys', title: '系統廠：真正決定要什麼晶片的人', body: kv([
        ['做什麼', '把晶片做進產品：手機、伺服器、面板模組、車。定規格、決定導入哪一家。'],
        ['代表廠商', 'Apple、Google、AWS、Nvidia（也賣整機系統）；DDIC 的直接客戶是面板廠與模組廠。'],
        ['怎麼收錢', '賣終端產品或服務。'],
        ['毛利特性', '品牌高、代工組裝（ODM／EMS）低。'],
        ['台灣位置', 'ODM／EMS 很強（鴻海、廣達、緯創）；面板有友達、群創。量大的系統廠開始自研晶片（見「系統廠自研」模式）。'],
      ]) },
    ];

    const MODES = {
      idm: { title: 'IDM：一家公司包辦設計、製造、封測', body: kv([
        ['例子', 'Intel、Samsung、TI、SK hynix、Micron。'],
        ['好處', '製程跟設計一起調，類比、功率、記憶體這類「製程就是產品」的東西做得出差異；產能自己掌握。'],
        ['代價', '工廠折舊與研發全自己扛；景氣下行時產能閒置照樣付錢；先進邏輯要追上代工龍頭的投資規模很難，所以 Intel 也開始外包部分晶片並開放代工。'],
        ['DDIC 例子', 'Samsung LSI 設計 DDIC、Samsung Foundry 製造、供給同集團的 Samsung Display：集團內一條龍。'],
      ]), bars: [{ x1: 192, x2: 706, y: 222, h: 56, l1: '同一家公司：設計＋製造＋（多半）封測', l2: 'Intel、Samsung、TI、SK hynix、Micron', hi: ['design', 'fab', 'osat'] }],
        note: 'IP／EDA 仍向外買；客戶是系統廠' },
      fabless: { title: 'Fabless＋Foundry：三家公司接力', body: kv([
        ['例子', '天鈺／聯詠設計 → 聯電、晶合等代工 → 頎邦、南茂做金凸塊與 COF → 面板廠。'],
        ['好處', '設計公司輕資產、轉型快；代工廠把很多客戶的量集中，用滿產能、持續投資下一代節點。'],
        ['代價', '產能、交期、良率不在自己手上；換代工要重新驗證；景氣好時搶不到產能，管制來時跟著代工廠一起受影響。'],
        ['要握住的', '規格、電路、test program、跟代工與封測的良率資料交換；關鍵產品要有第二來源。'],
      ]), bars: [
        { x1: 192, x2: 342, y: 222, h: 56, l1: 'Fabless', l2: '聯詠、天鈺、Nvidia', hi: ['design'] },
        { x1: 374, x2: 524, y: 222, h: 56, l1: 'Foundry', l2: '台積電、聯電、晶合', hi: ['fab'] },
        { x1: 556, x2: 706, y: 222, h: 56, l1: 'OSAT', l2: '日月光、頎邦、南茂', hi: ['osat'] },
      ], note: '三家公司各做一段，錢由右往左付' },
      lite: { title: 'Fab-lite：留下有差異的廠，其他外包', body: kv([
        ['例子', 'Infineon、NXP、ST、Renesas。'],
        ['做法', '功率、類比、車用特殊製程留在自己的廠（這些靠製程做差異）；需要先進節點的 MCU、處理器交給台積電等代工；部分封測外包。'],
        ['好處', '不用追先進節點的天價投資，又保住核心製程技術。'],
        ['代價', '兩邊都要管：自有廠的稼動率，加上外包的產能與交期。'],
      ]), bars: [
        { x1: 192, x2: 524, y: 222, h: 50, l1: '自己設計＋自有成熟／特殊製程廠', l2: 'Infineon、NXP、ST、Renesas', hi: ['design', 'fab'] },
        { x1: 374, x2: 706, y: 284, h: 44, l1: '先進邏輯、部分封測 → 外包代工與 OSAT', l2: '', dash: true, hi: [] },
      ], note: '' },
      sys: { title: '系統廠自研：買晶片的人自己做晶片', body: kv([
        ['例子', 'Apple（自研處理器）、Google（TPU）、AWS（自研伺服器晶片）。'],
        ['做法', '系統廠定架構與前段設計，後段實體設計與投片管理委託設計服務公司（創意、世芯、Broadcom 的 ASIC 部門等），製造仍找台積電。'],
        ['為什麼', '量夠大時，自研能拿到剛好符合自家軟體的晶片，並省下付給晶片商的毛利。AI 加速器是近年最大的推手。'],
        ['對 fabless 的意義', '大客戶可能變成競爭者；設計服務公司則因此成長。'],
      ]), bars: [
        { x1: 738, x2: 888, y: 222, h: 56, l1: '自己定規格', l2: 'Apple、Google、AWS', hi: ['sys'] },
        { x1: 192, x2: 342, y: 222, h: 56, l1: 'ASIC 設計服務', l2: '創意、世芯、Broadcom', hi: ['design'] },
      ], note: '', arrow: true },
    };

    const state = { m: 'chain', i: 0 };

    function box(svg, k, cls) {
      const n = N[k];
      const g = el('g', { class: state.m === 'chain' ? 'hot' : '' });
      g.appendChild(el('rect', { x: n.x, y: n.y, width: W, height: H, rx: 6, class: cls }));
      g.appendChild(el('text', { x: n.x + 12, y: n.y + 25, class: 't-strong' }, n.t));
      g.appendChild(el('text', { x: n.x + 12, y: n.y + 46, class: 't-small' }, n.s));
      if (state.m === 'chain') g.addEventListener('click', () => { state.i = CHAIN.findIndex(c => c.id === k); draw(); });
      svg.appendChild(g);
    }

    function draw() {
      const svg = $('vc');
      svg.innerHTML = '';
      const defs = el('defs', {});
      const mk = el('marker', { id: 'ahv', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'fill-muted' }));
      defs.appendChild(mk);
      svg.appendChild(defs);

      // 連線
      const ar = (x1, y1, x2, y2) => svg.appendChild(el('line', { x1, y1, x2, y2, class: 'ln', 'marker-end': 'url(#ahv)' }));
      ar(162, 160, 190, 160); ar(344, 160, 372, 160); ar(526, 160, 554, 160); ar(708, 160, 736, 160);
      ar(400, 82, 420, 128); ar(500, 82, 480, 128); ar(580, 82, 600, 128);
      svg.appendChild(el('text', { x: 10, y: 44, class: 't-small' }, '上游供應'));
      svg.appendChild(el('text', { x: 10, y: 64, class: 't-small' }, '（設備材料賣給'));
      svg.appendChild(el('text', { x: 10, y: 84, class: 't-small' }, '　晶圓廠與封測廠）'));

      let hi = [];
      if (state.m === 'chain') hi = [CHAIN[state.i].id];
      else MODES[state.m].bars.forEach(b => hi = hi.concat(b.hi));
      Object.keys(N).forEach(k => box(svg, k, hi.includes(k) ? 'bx-accent' : 'bx'));

      if (state.m === 'chain') {
        svg.appendChild(el('text', { x: 10, y: 240, class: 't-small' }, '錢怎麼流：系統廠付錢給 IC 設計 → IC 設計付給代工（片價＋光罩）、封測（加工費）、IP（授權＋權利金）、EDA（年費）'));
        svg.appendChild(el('text', { x: 10, y: 264, class: 't-small' }, '代工與封測再付錢給設備商與材料商。資本最重的是晶圓代工；議價力最強的是獨家供應者（EUV、EDA、龍頭代工）。'));
        svg.appendChild(el('text', { x: 10, y: 300, class: 't-accent' }, '點任一方塊，或用下方按鈕逐段看。'));
      } else {
        const md = MODES[state.m];
        // 括號線先畫，後面的說明框會蓋住穿過的部分
        md.bars.forEach(b => {
          svg.appendChild(el('line', { x1: b.x1 + 4, y1: 194, x2: b.x1 + 4, y2: b.y, class: 'ln dash' }));
          svg.appendChild(el('line', { x1: b.x2 - 4, y1: 194, x2: b.x2 - 4, y2: b.y, class: 'ln dash' }));
        });
        md.bars.forEach(b => {
          svg.appendChild(el('rect', { x: b.x1, y: b.y, width: b.x2 - b.x1, height: b.h, rx: 6, class: b.dash ? 'bx dash' : 'bx-soft' }));
          svg.appendChild(el('text', { x: b.x1 + 12, y: b.y + 22, class: 't-accent' }, b.l1));
          if (b.l2) svg.appendChild(el('text', { x: b.x1 + 12, y: b.y + 42, class: 't-small' }, b.l2));
        });
        if (md.arrow) {
          svg.appendChild(el('line', { x1: 736, y1: 250, x2: 346, y2: 250, class: 'ln-accent', 'marker-end': 'url(#ahv)' }));
          svg.appendChild(el('text', { x: 380, y: 242, class: 't-small' }, '委託後段設計'));
          svg.appendChild(el('text', { x: 380, y: 300, class: 't-small' }, '製造仍交給代工（台積電），封測交給 OSAT 或代工的先進封裝'));
        }
        if (md.note) svg.appendChild(el('text', { x: 10, y: 320, class: 't-small' }, md.note));
      }

      const info = state.m === 'chain' ? CHAIN[state.i] : MODES[state.m];
      $('stTitle').textContent = info.title;
      $('stWhat').innerHTML = info.body;
      const isChain = state.m === 'chain';
      $('prev').disabled = !isChain || state.i === 0;
      $('next').disabled = !isChain || state.i === CHAIN.length - 1;
      $('phase').textContent = isChain ? `第 ${state.i + 1} / ${CHAIN.length} 段` : '切回「價值鏈」可逐段看';
    }

    document.querySelectorAll('#mode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#mode button').forEach(x => x.classList.toggle('on', x === b));
      state.m = b.dataset.m; draw();
    }));
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; draw(); } });
    $('next').addEventListener('click', () => { if (state.i < CHAIN.length - 1) { state.i++; draw(); } });
    draw();
  })();
  return cleanup
}
