// @ts-nocheck —— 原講義 public/semi/L-bus.html 的互動程式照搬,不改邏輯。
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

    // 每條訊號：{ name, tr: [[t, level], ...], cls }；level 0/1，tr 依時間排序
    function i2c() {
      const scl = [[0, 1]], sda = [[0, 1]], marks = [];
      sda.push([1, 0]); scl.push([2, 0]);
      const bits = [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0];
      const lbl = ['A6', 'A5', 'A4', 'A3', 'A2', 'A1', 'A0', 'W', 'ACK', 'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1', 'D0', 'ACK'];
      let t = 2;
      bits.forEach((b, i) => {
        sda.push([t + 0.15, b]); scl.push([t + 0.5, 1]); scl.push([t + 1, 0]);
        marks.push({ t: t + 0.5, s: lbl[i] === 'ACK' ? 'ACK' : String(b), row: 1, ack: lbl[i] === 'ACK' });
        t += 1;
      });
      sda.push([t + 0.15, 0]); scl.push([t + 0.5, 1]); sda.push([t + 1, 1]);
      return {
        T: t + 1.6, rows: [{ name: 'SCL', tr: scl }, { name: 'SDA', tr: sda }], marks,
        phases: [
          [0, 1, '閒置', 'SCL、SDA 都被上拉電阻拉在高電位，沒人說話。'],
          [1, 2, 'START', 'SCL 還是高的時候，master 把 SDA 拉低。START 和 STOP 是僅有的兩種「SCL 高時 SDA 改變」的情況，所有 slave 看到就知道：要開始了。'],
          [2, 9, '位址 7 bit', 'master 送出 7-bit 位址 0x50（1010000），MSB 先送。SDA 只在 SCL 低時改變，SCL 高時保持穩定讓對方取樣。'],
          [9, 10, 'R/W', '第 8 個 bit：0＝寫、1＝讀。這裡是寫。0x50 加上 W 合起來就是常說的「8-bit 位址 0xA0」。'],
          [10, 11, 'ACK（slave 回）', '第 9 個 clock：master 放開 SDA，位址對上的 slave 把 SDA 拉低＝ACK。沒人拉低就是 NACK（位址錯或 slave 沒上電）。'],
          [11, 19, '資料 8 bit', 'master 送出資料 0xA5（10100101）。若是讀取，這段改由 slave 驅動 SDA。'],
          [19, 20, 'ACK', '每個 byte 後面都有一個 ACK。這就是 I²C 比 SPI 多出來的協定負擔，也是它能確認「對方真的收到」的原因。'],
          [20, t + 1.6, 'STOP', 'SCL 先放開變高，SDA 再由低變高＝STOP，釋放匯流排。若要接著讀，常改送 Repeated START 不放掉匯流排。'],
        ],
      };
    }

    function spi(mode) {
      const cpol = mode >> 1, cpha = mode & 1;
      const mosiBits = [1, 0, 1, 0, 0, 1, 0, 1], misoBits = [0, 0, 1, 1, 1, 1, 0, 0];
      const cs = [[0, 1], [0.6, 0]], clk = [[0, cpol]], mosi = [[0, 0]], miso = [[0, 0]], marks = [], samples = [];
      let t = 1;
      for (let i = 0; i < 8; i++) {
        const d0 = cpha ? t + 0.5 : t;
        mosi.push([d0, mosiBits[i]]); miso.push([d0, misoBits[i]]);
        clk.push([t + 0.5, 1 - cpol]); clk.push([t + 1, cpol]);
        const st = cpha ? t + 1 : t + 0.5;
        samples.push(st);
        marks.push({ t: st, s: String(mosiBits[i]), row: 2 }, { t: st, s: String(misoBits[i]), row: 3 });
        t += 1;
      }
      cs.push([t + 0.6, 1]);
      return {
        T: t + 1.2, samples, marks,
        rows: [{ name: 'CS', tr: cs }, { name: 'SCLK', tr: clk }, { name: 'MOSI', tr: mosi }, { name: 'MISO', tr: miso }],
        phases: [
          [0, 1, 'CS 拉低', `master 把這顆 slave 的 CS 拉低：選中它。其他 slave 的 CS 維持高，MISO 保持高阻抗不干擾。目前是 mode ${mode}（CPOL=${cpol}：時脈閒置為${cpol ? '高' : '低'}）。`],
          [1, 9, '8 個時脈，一進一出', `每個時脈 master 從 MOSI 送出 1 bit、同時從 MISO 收進 1 bit（全雙工）。藍色虛線是取樣點：CPHA=${cpha}，在每個週期的${cpha ? '第二個' : '第一個'}邊緣取樣。這裡送出 0xA5、收到 0x3C。`],
          [9, t + 1.2, 'CS 拉高', 'CS 放開，這筆傳輸結束。整個過程沒有 ACK：對方有沒有收到、收得對不對，SPI 協定本身不管。'],
        ],
      };
    }

    function uart(parity) {
      const data = [1, 0, 0, 0, 0, 0, 1, 0]; // 'A' = 0x41，LSB 先送
      const tx = [[0, 1], [1, 0]], marks = [{ t: 1.5, s: 'S', row: 0 }];
      let t = 2;
      data.forEach((b, i) => { tx.push([t, b]); marks.push({ t: t + 0.5, s: 'D' + i, row: 0 }); t += 1; });
      const ph = [
        [0, 1, '閒置', 'UART 閒置時線維持在高電位。沒有時脈線，雙方事先約好 baud rate（例如 115200）。'],
        [1, 2, 'Start bit', '線從高掉到低＝start bit。接收端看到這個下降邊，就開始用過取樣時脈數半個 bit，之後每隔一個 bit 時間在中間取樣。'],
        [2, 10, '資料 8 bit（LSB 先）', "送的是 'A'（0x41 = 01000001）。注意 UART 是 LSB 先送，所以線上看到的順序是 1,0,0,0,0,0,1,0。"],
      ];
      if (parity) {
        const p = data.reduce((a, b) => a + b, 0) % 2;
        tx.push([t, p]); marks.push({ t: t + 0.5, s: 'P=' + p, row: 0 });
        ph.push([10, 11, '同位位元（偶）', `資料裡有 2 個 1，偶同位要讓 1 的總數是偶數，所以同位位元是 ${p}。接收端重算不符就報 parity error；但兩個 bit 同時錯就抓不到。`]);
        t += 1;
      }
      tx.push([t, 1]); marks.push({ t: t + 0.5, s: 'Stop', row: 0 });
      ph.push([t, t + 1, 'Stop bit', 'stop bit 一定是 1。接收端在這個位置讀到 0 就是 framing error（baud 不合或雜訊）。stop bit 也保證下一個 start bit 前有一個下降邊可以對齊。']);
      ph.push([t + 1, t + 2, '回到閒置', `一個 byte 共 ${parity ? 11 : 10} 個 bit 時間。8N1 下 115200 baud 約每秒 11520 byte。`]);
      return { T: t + 2, rows: [{ name: 'TX', tr: tx }], marks, phases: ph, samples: marks.map(m => m.t) };
    }

    function can() {
      // SOF + 11-bit ID，在第 8 個 ID bit（ID3）分出勝負
      const A = [0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1], B = [0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 0];
      const lose = 8;
      const ta = [[0, 1]], tb = [[0, 1]], bus = [[0, 1]], marks = [];
      for (let i = 0; i < A.length; i++) {
        const t = 1 + i;
        const b = i <= lose ? B[i] : 1;
        ta.push([t, A[i]]); tb.push([t, b]); bus.push([t, A[i] & b]);
        const nm = i === 0 ? 'SOF' : 'ID' + (11 - i);
        marks.push({ t: t + 0.5, s: nm, row: 2 });
      }
      const T = A.length + 1;
      ta.push([T, 1]); tb.push([T, 1]); bus.push([T, 1]);
      return {
        T: T + 0.5, marks, lostAt: 1 + lose,
        rows: [{ name: '節點 A', tr: ta }, { name: '節點 B', tr: tb }, { name: 'Bus', tr: bus }],
        phases: [
          [0, 1, '閒置（recessive）', '匯流排閒置是 recessive（1）。0 是 dominant：只要有任何一個節點送 0，整條線就是 0。'],
          [1, 2, 'SOF', 'A、B 同時想送訊息，都送出 start of frame（dominant 0）。'],
          [2, 1 + lose, 'ID 前幾位相同', '兩邊一邊送 ID、一邊聽匯流排。ID 前幾位一樣，聽到的跟自己送的相同，繼續送。'],
          [1 + lose, 2 + lose, 'B 輸掉仲裁', 'B 送 1（recessive），卻在匯流排上聽到 0：代表有人送了 dominant。B 立刻停止發送、改成接收。A 送的 0 完全沒被破壞，繼續傳。'],
          [2 + lose, T + 0.5, 'A 繼續送', 'A 的 ID 數值較小（前面先出現 0），所以優先權較高。這種「邊送邊聽、輸的自動退出」叫非破壞性仲裁；B 會等匯流排空了再試。'],
        ],
      };
    }

    const state = { p: 'i2c', mode: 0, parity: false, i: 0, d: null };

    function build() {
      state.d = state.p === 'i2c' ? i2c() : state.p === 'spi' ? spi(state.mode) : state.p === 'uart' ? uart(state.parity) : can();
      const ow = $('optWrap');
      ow.innerHTML = '';
      if (state.p === 'spi') {
        ow.innerHTML = 'SPI mode <select id="mode"><option>0</option><option>1</option><option>2</option><option>3</option></select>';
        $('mode').value = state.mode;
        $('mode').addEventListener('change', e => { state.mode = +e.target.value; state.i = 0; build(); });
      } else if (state.p === 'uart') {
        ow.innerHTML = `<input type="checkbox" id="par" ${state.parity ? 'checked' : ''}> 加偶同位`;
        $('par').addEventListener('change', e => { state.parity = e.target.checked; state.i = 0; build(); });
      }
      draw();
    }

    function draw() {
      const d = state.d, svg = $('wv');
      svg.innerHTML = '';
      const X0 = 90, W = 790, rowH = 52, top = 30;
      svg.setAttribute('viewBox', `0 0 900 ${top + d.rows.length * rowH + 16}`);
      const x = t => X0 + t / d.T * W;
      const ph = d.phases[state.i];
      svg.appendChild(el('rect', { x: x(ph[0]), y: 8, width: x(ph[1]) - x(ph[0]), height: top + d.rows.length * rowH - 4, class: 'bx-accent', rx: 4 }));
      d.phases.forEach((p, k) => {
        if (k > 0) svg.appendChild(el('line', { x1: x(p[0]), y1: 8, x2: x(p[0]), y2: top + d.rows.length * rowH + 4, class: 'ln-soft' }));
      });
      (d.samples || []).forEach(t => svg.appendChild(el('line', { x1: x(t), y1: top - 4, x2: x(t), y2: top + d.rows.length * rowH, class: 'ln-accent dash' })));
      d.rows.forEach((r, k) => {
        const yH = top + k * rowH + 6, yL = yH + 26;
        svg.appendChild(el('text', { x: 4, y: yL - 6, class: 't-strong' }, r.name));
        let pts = '', lv = r.tr[0][1];
        pts += `${x(0)},${lv ? yH : yL} `;
        r.tr.slice(1).forEach(([t, l]) => {
          pts += `${x(t)},${lv ? yH : yL} ${x(t)},${l ? yH : yL} `;
          lv = l;
        });
        pts += `${x(d.T)},${lv ? yH : yL}`;
        svg.appendChild(el('polyline', { points: pts, class: 'ln-fg', 'stroke-width': 1.8 }));
      });
      d.marks.forEach(m => {
        const y = top + m.row * rowH + 4;
        svg.appendChild(el('text', { x: x(m.t) - 8, y: y, class: m.ack ? 't-accent' : 't-small', 'font-size': 10 }, m.s));
      });
      if (d.lostAt) svg.appendChild(el('text', { x: x(d.lostAt + 1) + 6, y: top + rowH + 24, class: 't-accent' }, '← B 送 1 卻聽到 0，退出'));
      $('stTitle').textContent = ph[2];
      $('stWhat').textContent = ph[3];
      $('phase').textContent = `第 ${state.i + 1} / ${d.phases.length} 段`;
      $('prev').disabled = state.i === 0;
      $('next').disabled = state.i === d.phases.length - 1;
    }

    document.querySelectorAll('#proto button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#proto button').forEach(x => x.classList.toggle('on', x === b));
      state.p = b.dataset.p; state.i = 0; build();
    }));
    $('prev').addEventListener('click', () => { if (state.i > 0) { state.i--; draw(); } });
    $('next').addEventListener('click', () => { if (state.i < state.d.phases.length - 1) { state.i++; draw(); } });
    build();
  })();
  return cleanup
}
