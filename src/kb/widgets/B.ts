// @ts-nocheck —— 原講義 public/semi/B-process.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (() => {
    // 剖面圖的形狀：[class, x, y, w, h]；文字：['t', x, y, 字, class]；箭頭：['a', x, y1, y2]
    const SUB = ['m-sub', 20, 190, 600, 90];
    const GOX = ['m-ox', 20, 184, 600, 6];
    const POLY = ['m-poly', 20, 154, 600, 30];
    const GATE = [['m-ox', 260, 184, 120, 6], ['m-poly', 260, 154, 120, 30]];
    const NP = [['m-nplus', 60, 190, 200, 18], ['m-nplus', 380, 190, 200, 18]];
    const NP2 = [['m-nplus', 52, 190, 214, 26], ['m-nplus', 374, 190, 214, 26]];
    const ILD = ['m-ild', 20, 100, 600, 90];
    const BUMP = ['m-ild', 240, 80, 160, 20];
    const HOLES = [['m-void', 150, 100, 24, 90], ['m-void', 466, 100, 24, 90]];
    const PLUGS = [['m-w', 150, 100, 24, 90], ['m-w', 466, 100, 24, 90]];
    const arrows = (y1, y2, skip) => {
      const out = [];
      for (let x = 50; x <= 590; x += 45) {
        if (skip && x > skip[0] && x < skip[1]) continue;
        out.push(['a', x, y1, y2]);
      }
      return out;
    };
    const subLbl = ['t', 30, 270, 'p 型矽基板', 't-small'];
    const gateLbl = ['t', 292, 174, '閘極', ''];
    const sdLbl = [['t', 120, 236, '源極 n+', 't-small'], ['t', 440, 236, '汲極 n+', 't-small']];

    const steps = [
      { code: 'B01', name: '裸晶圓', ph: 'FEOL',
        what: '一片拋光好的 p 型單晶矽晶圓，表面像鏡子一樣平。',
        why: '從長晶、切片到拋光都在 B01。之後所有東西都做在這片矽的表面上。',
        d: [SUB, subLbl] },
      { code: 'B04', name: '長氧化層＋沉積多晶矽', ph: 'FEOL',
        what: '先長一層很薄的閘極氧化層，再用 CVD 鋪一層多晶矽，之後要做成閘極。',
        why: '迴圈第 1 格「沉積」。這兩層之後會被刻成閘極，所以現在先整面鋪滿。',
        d: [SUB, GOX, POLY, ['t', 30, 174, '多晶矽', ''], ['t', 500, 182, '閘極氧化層（很薄）', 't-small'], subLbl] },
      { code: 'B02', name: '塗佈光阻', ph: 'FEOL',
        what: '晶圓高速旋轉，把光阻均勻甩成一層薄膜，再軟烤去掉溶劑。',
        why: '迴圈第 2 格「微影」的開始。光阻就是之後的盾牌。',
        d: [SUB, GOX, POLY, ['m-pr', 20, 126, 600, 28], ['t', 30, 145, '光阻', ''], subLbl] },
      { code: 'B02', name: '曝光', ph: 'FEOL',
        what: '光透過光罩照下來：光罩不透光的地方（閘極位置）擋住光，其他地方的光阻被照到、化學性質改變。',
        why: '光罩上的圖形在這一步「印」到光阻上。線能印多細，看 R = k₁·λ/NA。',
        d: [SUB, GOX, POLY, ['m-pr-exp', 20, 126, 240, 28], ['m-pr', 260, 126, 120, 28], ['m-pr-exp', 380, 126, 240, 28],
            ['ln-soft', 20, 44, 600, 2], ['m-mask', 260, 40, 120, 10], ['t', 30, 34, '光罩', 't-small'], ['t', 290, 34, '不透光', 't-small'],
            ...arrows(54, 118, [250, 390]), subLbl] },
      { code: 'B02', name: '顯影', ph: 'FEOL',
        what: '正光阻被照到的部分溶掉，只剩閘極位置的光阻。',
        why: '圖形從光罩轉到晶圓上了。下一步蝕刻時，光阻蓋住的地方會被保護。',
        d: [SUB, GOX, POLY, ['m-pr', 260, 126, 120, 28], ['t', 295, 145, '光阻', ''], subLbl] },
      { code: 'B03', name: '蝕刻', ph: 'FEOL',
        what: '電漿往下挖，把沒被光阻蓋住的多晶矽挖掉，停在底下很薄的閘極氧化層上。',
        why: '迴圈第 3 格。要挖得準、挖得直、各處一樣。閘極氧化層只有幾奈米，全靠多晶矽對氧化層的高選擇比（可超過 100:1）讓蝕刻停住、不傷到矽。',
        d: [SUB, GOX, GATE[1], ['m-pr', 260, 126, 120, 28], ...arrows(60, 148, [250, 390]), ['t', 30, 54, '電漿離子往下轟擊', 't-small'], gateLbl, subLbl] },
      { code: 'B03', name: '去光阻', ph: 'FEOL',
        what: '用氧電漿把光阻燒掉（ashing），再清洗。閘極以外露出的薄氧化層也在這裡一併去掉（簡化畫法）。',
        why: '迴圈第 4 格。盾牌用完就拿掉，閘極成形了。',
        d: [SUB, ...GATE, gateLbl, subLbl] },
      { code: 'B05', name: '離子佈植', ph: 'FEOL',
        what: '把磷或砷離子打進矽裡，閘極兩側變成 n+ 的源極和汲極。',
        why: '閘極自己擋住離子，所以源汲極自動對齊閘極兩側（自對準），不用另做光罩對準。',
        d: [SUB, ...NP, ...GATE, ...arrows(50, 148), ['t', 30, 44, 'n 型離子（P／As）', 't-small'], gateLbl, ...sdLbl, subLbl] },
      { code: 'B05', name: '退火', ph: 'FEOL',
        what: '快速加熱：修復被撞亂的晶格，讓雜質活化。雜質會往外擴散一點點。',
        why: '不退火，打進去的雜質大多不導電。但加熱越久擴散越遠，所以先進製程用極短時間的退火。',
        d: [SUB, ...NP2, ...GATE, gateLbl, ...sdLbl, ['t', 230, 250, '邊緣微微擴進閘極下方', 't-small'], subLbl] },
      { code: 'B04', name: '沉積介電層', ph: 'MOL',
        what: '用 CVD 蓋一層厚的氧化層，把電晶體包起來。表面會跟著閘極凸起來。',
        why: '介電層把電晶體和上面的金屬隔開。表面不平，下一層微影就對不到焦。',
        d: [SUB, ...NP2, ILD, BUMP, ...GATE, gateLbl, ['t', 30, 120, '介電層（ILD）', 't-small'], ['t', 410, 92, '跟著閘極凸起', 't-small'], subLbl] },
      { code: 'B06', name: 'CMP 平坦化', ph: 'MOL',
        what: '化學機械研磨把表面磨平。',
        why: '迴圈第 5 格。磨平之後下一層微影才能整片對焦。',
        d: [SUB, ...NP2, ILD, ...GATE, gateLbl, ['t', 30, 120, '表面磨平了', 't-small'], subLbl] },
      { code: 'B02 B03', name: '開接觸孔', ph: 'MOL',
        what: '再做一次微影＋蝕刻，在源極、汲極上方挖出接觸孔。',
        why: '又跑了一次迴圈。孔要剛好對到下面的源汲極，這就是疊對（overlay）。',
        d: [SUB, ...NP2, ILD, ...GATE, ...HOLES, gateLbl, ['t', 180, 120, '接觸孔', 't-small'], subLbl] },
      { code: 'B04 B06', name: '填鎢＋CMP', ph: 'MOL',
        what: '把鎢填進接觸孔，再用 CMP 磨掉表面多出來的鎢。',
        why: '鎢插塞把電晶體接到上面的金屬層。「填滿再磨掉多的」是後面銅導線也會用的套路。',
        d: [SUB, ...NP2, ILD, ...GATE, ...PLUGS, gateLbl, ['t', 180, 120, '鎢插塞', 't-small'], subLbl] },
      { code: 'B06', name: '第一層銅導線', ph: 'BEOL',
        what: '再鋪一層介電層，挖溝、鋪阻障層與晶種層、電鍍銅、CMP，做出第一層金屬（M1）。',
        why: '鑲嵌法：銅不能直接蝕刻，所以先挖溝再填。之後同樣的步驟往上重複十幾層。',
        d: [SUB, ...NP2, ILD, ...GATE, ...PLUGS, ['m-ild', 20, 60, 600, 40], ['m-cu', 130, 60, 64, 40], ['m-cu', 446, 60, 64, 40],
            gateLbl, ['t', 210, 54, 'M1 銅導線（往上重複十幾層）', 't-small'], subLbl] },
    ];

    const NS = 'http://www.w3.org/2000/svg';
    const $ = id => document.getElementById(id);
    let cur = 0;

    function el(tag, attrs) {
      const e = document.createElementNS(NS, tag);
      for (const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function draw(i) {
      const g = $('layers');
      g.innerHTML = '';
      steps[i].d.forEach(s => {
        if (s[0] === 't') {
          const t = el('text', { x: s[1], y: s[2], class: s[4] });
          t.textContent = s[3];
          g.appendChild(t);
        } else if (s[0] === 'a') {
          g.appendChild(el('line', { x1: s[1], y1: s[2], x2: s[1], y2: s[3], class: 'arrow', 'marker-end': 'url(#ah)' }));
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
