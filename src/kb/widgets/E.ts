// @ts-nocheck —— 原講義 public/semi/E-display-chain.html 的互動程式照搬,不改邏輯。
// 唯一的差別:document、計時器換成 scope() 給的替身,只在目前這一頁的範圍裡找元素,離開頁面時清掉計時器。
import { scope } from './scope'

export function mount(root: HTMLElement) {
  const { document, setInterval, setTimeout, requestAnimationFrame, cleanup } = scope(root);
  (function(){
    const NS="http://www.w3.org/2000/svg";
    const PIX=[
      {n:"P1",rgb:[255,0,0],hex:"FF0000"},{n:"P2",rgb:[0,255,0],hex:"00FF00"},
      {n:"P3",rgb:[0,0,255],hex:"0000FF"},{n:"P4",rgb:[255,255,255],hex:"FFFFFF"},
      {n:"P5",rgb:[0,0,0],hex:"000000"},{n:"P6",rgb:[255,255,0],hex:"FFFF00"},
      {n:"P7",rgb:[0,255,255],hex:"00FFFF"},{n:"P8",rgb:[255,0,255],hex:"FF00FF"}
    ];
    const lum=p=>0.299*p.rgb[0]+0.587*p.rgb[1]+0.114*p.rgb[2];
    const tc=p=> lum(p)>140?"#FFFFFF":"#111111";
    const rgb=p=>`rgb(${p.rgb.join(",")})`;
    function field(x0,y0,cs,gap,lit){const C={b:"#3b82f6",Y:"#fbbf24",g:"#22c55e"},P=["bbbYbb","bbbbbb","gggggg","gggggg"];let s="";
      P.forEach((row,r)=>{[...row].forEach((ch,c)=>{s+=`<rect x="${x0+c*(cs+gap)}" y="${y0+r*(cs+gap)}" width="${cs}" height="${cs}" rx="1.5" fill="${C[ch]}" opacity="${lit?1:.85}"/>`;});});return s;}

    /* ---------- mini-vizzes (pipeline cards) ---------- */
    const miniSource=()=>`<svg viewBox="0 0 132 74">${field(4,12,11,2,false)}<text x="86" y="26" class="dig">10110</text><text x="86" y="42" class="dig">01001</text><text x="86" y="58" class="dig">11010</text></svg>`;
    const miniTcon=()=>`<svg viewBox="0 0 132 74"><line x1="22" y1="10" x2="22" y2="60" stroke="#A3A3A3" stroke-width="1.3"/><line x1="22" y1="60" x2="116" y2="60" stroke="#A3A3A3" stroke-width="1.3"/><path d="M22,60 C 54,58 66,46 76,34 C 86,22 100,14 116,12" fill="none" stroke="#6B6B6B" stroke-width="2.2"/><text x="38" y="26" style="font:700 12px sans-serif;fill:#6B6B6B">&#947;</text></svg>`;
    const miniDriver=()=>{const bars=[22,32,18,40,28];let b="";bars.forEach((h,i)=>{const x=64+i*13;b+=`<rect x="${x}" y="${62-h}" width="9" height="${h}" rx="1.5" fill="#0E7490" opacity="${(.55+.09*i).toFixed(2)}"/>`;});return `<svg viewBox="0 0 132 74"><text x="10" y="28" class="dig">1010</text><text x="10" y="44" class="dig">0110</text><line x1="38" y1="36" x2="52" y2="36" stroke="#A3A3A3" stroke-width="1.3"/><path d="M52,32 L58,36 L52,40 Z" fill="#A3A3A3"/>${b}</svg>`;};
    const miniPanel=()=>{const cols=5,rows=3,cs=13,gap=3,x0=20,y0=10,cw=cols*(cs+gap)-gap,colC=["#ff5a5a","#3ddc84","#5b8def","#ff5a5a","#3ddc84"];let dim="",lit="";
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const rx=x0+c*(cs+gap),ry=y0+r*(cs+gap);dim+=`<rect x="${rx}" y="${ry}" width="${cs}" height="${cs}" rx="2" fill="${colC[c]}" opacity="0.16"/>`;lit+=`<rect x="${rx}" y="${ry}" width="${cs}" height="${cs}" rx="2" fill="${colC[c]}"/>`;}
      return `<svg viewBox="0 0 132 74">${dim}<g class="pv-lit">${lit}</g><rect class="pv-bar" x="${x0-3}" y="${y0-3}" width="${cw+6}" height="5" rx="2.5" fill="#B45309"/></svg>`;};
    const miniLight=()=>{const rc=["#ff5a5a","#3ddc84","#5b8def"];let rays="",cf="";for(let i=0;i<7;i++){const x=22+i*12,col=rc[i%3];rays+=`<line x1="${x}" y1="18" x2="${x}" y2="8" stroke="${col}" stroke-width="3" stroke-linecap="round"/>`;cf+=`<rect x="${x-4}" y="24" width="8" height="12" fill="${col}" opacity="0.85"/>`;}return `<svg viewBox="0 0 132 74">${rays}${cf}<rect x="18" y="40" width="90" height="6" rx="2" fill="#E5E5E5"/><rect class="bl" x="18" y="50" width="90" height="12" rx="3" fill="#111111"/></svg>`;};
    const miniImage=()=>`<svg viewBox="0 0 132 74"><rect x="24" y="6" width="84" height="62" rx="5" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.3"/>${field(30,12,11,2,true)}</svg>`;

    /* ---------- detail vizzes (static) ---------- */
    const sigImg=()=>{const cw=52,chh=34,gap=4,x0=8,y0=6;let s=`<svg viewBox="0 0 232 84">`;PIX.forEach((p,i)=>{const c=i%4,r=Math.floor(i/4),x=x0+c*(cw+gap),y=y0+r*(chh+gap);s+=`<rect x="${x}" y="${y}" width="${cw}" height="${chh}" rx="4" fill="${rgb(p)}" stroke="#E5E5E5"/><text x="${x+cw/2}" y="${y+15}" text-anchor="middle" style="font:700 10px sans-serif;fill:${tc(p)}">${p.n}</text><text x="${x+cw/2}" y="${y+27}" text-anchor="middle" style="font:600 8px ui-monospace,monospace;fill:${tc(p)}">${p.hex}</text>`;});return s+`</svg>`;};
    const sigWave=()=>{const T=13,X=t=>130+t*40;let bands="";[[3,7],[8,12]].forEach(([a,b])=>bands+=`<rect x="${X(a)}" y="22" width="${X(b)-X(a)}" height="194" fill="#F4F4F4" opacity="0.65"/>`);
      const tracks=[{lbl:"VSYNC",low:46,high:30,hi:[[0.2,1.6]],col:"#6B6B6B"},{lbl:"HSYNC",low:86,high:70,hi:[[2.2,2.8],[7.3,7.9]],col:"#C2410C"},{lbl:"DE",low:126,high:110,hi:[[3,7],[8,12]],col:"#047857"},{lbl:"DCLK",low:166,high:150,hi:(()=>{let a=[];for(let i=0;i<T;i++)a.push([i,i+0.5]);return a;})(),col:"#6B6B6B"}];
      let w="";tracks.forEach(t=>{w+=`<line x1="${X(0)}" y1="${t.low}" x2="${X(T)}" y2="${t.low}" stroke="#E5E5E5" stroke-width="1"/>`;let d=`M ${X(0)} ${t.low}`;t.hi.forEach(([a,b])=>{d+=` L ${X(a)} ${t.low} L ${X(a)} ${t.high} L ${X(b)} ${t.high} L ${X(b)} ${t.low}`;});d+=` L ${X(T)} ${t.low}`;w+=`<path d="${d}" fill="none" stroke="${t.col}" stroke-width="2"/><text x="120" y="${(t.low+t.high)/2+4}" text-anchor="end" class="trk">${t.lbl}</text>`;});
      const dy=184,dh=28;let data=`<line x1="${X(0)}" y1="${dy+dh/2}" x2="${X(T)}" y2="${dy+dh/2}" stroke="#E5E5E5" stroke-width="1" stroke-dasharray="3 3"/><text x="120" y="${dy+dh/2+4}" text-anchor="end" class="trk">DATA</text>`;
      [[3,0],[4,1],[5,2],[6,3],[8,4],[9,5],[10,6],[11,7]].forEach(([s,idx])=>{const p=PIX[idx];data+=`<rect x="${X(s)+2}" y="${dy}" width="36" height="${dh}" rx="3" fill="${rgb(p)}" stroke="#FFFFFF"/><text x="${X(s)+20}" y="${dy+dh/2+3}" text-anchor="middle" style="font:600 8.5px ui-monospace,monospace;fill:${tc(p)}">${p.hex}</text>`;});
      const brk=(a,b,l)=>{const y=224;return `<path d="M ${X(a)} ${y-4} L ${X(a)} ${y} L ${X(b)} ${y} L ${X(b)} ${y-4}" fill="none" stroke="#A3A3A3" stroke-width="1.3"/><text x="${(X(a)+X(b))/2}" y="${y+12}" text-anchor="middle" class="brk">${l}</text>`;};
      return `<svg viewBox="0 0 680 244">${bands}${w}${data}${brk(3,7,"Line 1(第 1 列,4 像素)")}${brk(8,12,"Line 2(第 2 列)")}</svg>`;};
    const gamma=()=>`<svg viewBox="0 0 300 160"><line x1="40" y1="130" x2="40" y2="30" stroke="#A3A3A3" stroke-width="1.5"/><line x1="40" y1="130" x2="282" y2="130" stroke="#A3A3A3" stroke-width="1.5"/><line x1="40" y1="130" x2="282" y2="34" stroke="#A3A3A3" stroke-width="1.2" stroke-dasharray="4 4"/><path d="M40,130 C 120,127 152,108 178,82 C 204,56 234,44 282,40" fill="none" stroke="#6B6B6B" stroke-width="2.5"/><text x="160" y="150" text-anchor="middle" class="axl">數位輸入值</text><text x="16" y="84" text-anchor="middle" class="axl" transform="rotate(-90 16 84)">電壓 / 亮度</text><text x="206" y="62" class="axl" fill="#6B6B6B" style="font-weight:700">Gamma γ</text><text x="150" y="78" class="axl" fill="#A3A3A3">線性參考</text></svg>`;
    const dac=()=>{const bars=[18,30,24,40,32,46];let b="";bars.forEach((h,i)=>{const x=190+i*15;b+=`<rect x="${x}" y="${128-h}" width="11" height="${h}" rx="1.5" fill="#0E7490" opacity="${(.5+.08*i).toFixed(2)}"/>`;});return `<svg viewBox="0 0 300 150"><text x="14" y="60" class="dig2">10110110</text><text x="14" y="76" class="axl">數位值</text><line x1="98" y1="62" x2="116" y2="62" stroke="#A3A3A3" stroke-width="1.5"/><path d="M116,58 L122,62 L116,66 Z" fill="#A3A3A3"/><rect x="124" y="46" width="40" height="32" rx="5" fill="#FFFFFF" stroke="#0E7490"/><text x="144" y="66" text-anchor="middle" style="font:700 11px sans-serif;fill:#6B6B6B">DAC</text><line x1="166" y1="62" x2="180" y2="62" stroke="#A3A3A3" stroke-width="1.5"/><path d="M180,58 L186,62 L180,66 Z" fill="#A3A3A3"/>${b}<line x1="184" y1="128" x2="282" y2="128" stroke="#E5E5E5"/><text x="150" y="146" text-anchor="middle" class="axl">數位值 → DAC(參考 Gamma)→ 類比電壓</text></svg>`;};
    const light=()=>{const rc=["#ff5a5a","#3ddc84","#5b8def"];let rays="",cf="";for(let i=0;i<11;i++){const x=24+i*16,col=rc[i%3];rays+=`<line x1="${x}" y1="36" x2="${x}" y2="14" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;cf+=`<rect x="${x-6}" y="46" width="12" height="22" fill="${col}" opacity="0.85"/>`;}return `<svg viewBox="0 0 280 170">${rays}${cf}<rect x="18" y="76" width="180" height="12" rx="3" fill="#E5E5E5"/><rect class="bl" x="18" y="96" width="180" height="22" rx="4" fill="#111111"/><text x="270" y="26" text-anchor="end" class="axl" fill="#111111">光</text><text x="270" y="60" text-anchor="end" class="axl">CF</text><text x="270" y="90" text-anchor="end" class="axl">液晶 LC(光閥)</text><text x="270" y="112" text-anchor="end" class="axl">背光</text><path d="M10,118 L10,30" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="3 3"/><path d="M6,40 L10,30 L14,40 Z" fill="#fbbf24"/><text x="4" y="130" class="axl" fill="#fbbf24">白光↑</text></svg>`;};
    const finalImg=()=>`<svg viewBox="0 0 220 160"><rect x="22" y="10" width="176" height="140" rx="8" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.6"/>${field(38,24,22,3,true)}</svg>`;
    const tconIO=()=>`<svg viewBox="0 0 330 200"><line x1="60" y1="100" x2="104" y2="100" stroke="#A3A3A3" stroke-width="1.6"/><path d="M97,96 L104,100 L97,104 Z" fill="#A3A3A3"/><path d="M190,100 L212,100" stroke="#A3A3A3" stroke-width="1.6" fill="none"/><path d="M212,100 L212,47 L248,47" stroke="#A3A3A3" stroke-width="1.6" fill="none"/><path d="M241,43 L248,47 L241,51 Z" fill="#A3A3A3"/><path d="M212,100 L212,153 L248,153" stroke="#A3A3A3" stroke-width="1.6" fill="none"/><path d="M241,149 L248,153 L241,157 Z" fill="#A3A3A3"/><rect x="6" y="80" width="54" height="40" rx="8" fill="#FFFFFF" stroke="#0369A1" stroke-width="1.4"/><text x="33" y="99" text-anchor="middle" style="font:700 12px sans-serif;fill:#0369A1">SoC</text><text x="33" y="112" text-anchor="middle" class="axl">主晶片</text><rect x="104" y="64" width="86" height="72" rx="9" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.6"/><text x="147" y="88" text-anchor="middle" style="font:700 13px sans-serif;fill:#6B6B6B">T-CON</text><text x="147" y="106" text-anchor="middle" class="axl">拆包 · 修正</text><text x="147" y="120" text-anchor="middle" class="axl">重排 · 發節拍</text><rect x="248" y="26" width="76" height="42" rx="8" fill="#FFFFFF" stroke="#0E7490" stroke-width="1.4"/><text x="286" y="44" text-anchor="middle" style="font:700 11px sans-serif;fill:#0E7490">Source Driver</text><text x="286" y="58" text-anchor="middle" class="axl">(COF)</text><rect x="248" y="132" width="76" height="42" rx="8" fill="#FFFFFF" stroke="#B45309" stroke-width="1.4"/><text x="286" y="150" text-anchor="middle" style="font:700 11px sans-serif;fill:#B45309">Gate Driver</text><text x="286" y="164" text-anchor="middle" class="axl">(GOA)</text><rect x="63" y="80" width="38" height="15" rx="4" fill="#FFFFFF" stroke="#A3A3A3"/><text x="82" y="91" text-anchor="middle" style="font:600 9px sans-serif;fill:#6B6B6B">LVDS</text><rect x="183" y="64" width="60" height="15" rx="4" fill="#FFFFFF" stroke="#A3A3A3"/><text x="213" y="75" text-anchor="middle" style="font:600 9px sans-serif;fill:#6B6B6B">Mini-LVDS</text><rect x="185" y="118" width="56" height="15" rx="4" fill="#FFFFFF" stroke="#E5E5E5"/><text x="213" y="129" text-anchor="middle" style="font:600 9px sans-serif;fill:#B45309">閘極控制</text></svg>`;

    const sourceChain=()=>`<svg viewBox="0 0 330 150">`+[["資料",8],["移位/鎖存",70],["DAC",132],["極性±",194],["緩衝",256]].map(([t,x])=>`<rect x="${x}" y="52" width="50" height="36" rx="7" fill="#FFFFFF" stroke="#0E7490" stroke-width="1.3"/><text x="${x+25}" y="74" text-anchor="middle" style="font:600 8.5px sans-serif;fill:#6B6B6B">${t}</text>`).join("")+[58,120,182,244].map(x=>`<line x1="${x}" y1="70" x2="${x+12}" y2="70" stroke="#A3A3A3" stroke-width="1.4"/><path d="M${x+9},67 L${x+12},70 L${x+9},73 Z" fill="#A3A3A3"/>`).join("")+`<rect x="132" y="10" width="50" height="16" rx="5" fill="#FFFFFF" stroke="#6B6B6B"/><text x="157" y="21" text-anchor="middle" style="font:600 8px sans-serif;fill:#6B6B6B">Gamma 參考</text><line x1="157" y1="26" x2="157" y2="52" stroke="#6B6B6B" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M154,49 L157,52 L160,49 Z" fill="#6B6B6B"/><text x="219" y="102" text-anchor="middle" class="axl">以 VCOM 為基準</text><line x1="281" y1="88" x2="281" y2="108" stroke="#A3A3A3" stroke-width="1.4"/><path d="M278,105 L281,108 L284,105 Z" fill="#A3A3A3"/><text x="281" y="122" text-anchor="middle" style="font:600 8.5px sans-serif;fill:#111111">data line(Dn)</text></svg>`;
    const gateScan=()=>{const ys=[16,48,80,112],act=1;let st="";ys.forEach((y,i)=>{const on=i===act;st+=`<rect x="72" y="${y}" width="56" height="26" rx="5" fill="${on?'#E5E5E5':'#FFFFFF'}" stroke="${on?'#B45309':'#A3A3A3'}" stroke-width="${on?1.8:1.2}"/><text x="100" y="${y+17}" text-anchor="middle" style="font:600 9px sans-serif;fill:${on?'#B45309':'#6B6B6B'}">第${i+1}排</text><line x1="128" y1="${y+13}" x2="150" y2="${y+13}" stroke="${on?'#B45309':'#A3A3A3'}" stroke-width="1.4"/><path d="M147,${y+10} L150,${y+13} L147,${y+16} Z" fill="${on?'#B45309':'#A3A3A3'}"/><text x="158" y="${y+17}" style="font:700 9px sans-serif;fill:${on?'#B45309':'#6B6B6B'}">G${i+1}</text>`;});return `<svg viewBox="0 0 210 170"><text x="100" y="9" text-anchor="middle" style="font:600 8.5px sans-serif;fill:#111111">STV</text><line x1="100" y1="10" x2="100" y2="16" stroke="#A3A3A3" stroke-width="1.4"/><path d="M97,13 L100,16 L103,13 Z" fill="#A3A3A3"/><text x="22" y="72" style="font:600 8.5px sans-serif;fill:#6B6B6B">CKV</text><line x1="44" y1="69" x2="72" y2="69" stroke="#A3A3A3" stroke-width="1.2"/><path d="M69,66 L72,69 L69,72 Z" fill="#A3A3A3"/><text x="22" y="98" style="font:600 8.5px sans-serif;fill:#6B6B6B">GOE</text><line x1="44" y1="95" x2="72" y2="95" stroke="#A3A3A3" stroke-width="1.2"/><path d="M69,92 L72,95 L69,98 Z" fill="#A3A3A3"/><line x1="60" y1="20" x2="60" y2="132" stroke="#A3A3A3" stroke-width="1.2" stroke-dasharray="3 3"/><path d="M57,129 L60,134 L63,129 Z" fill="#A3A3A3"/><text x="40" y="152" style="font:600 8px sans-serif;fill:#6B6B6B">↓ 由上往下掃</text>`+st+`</svg>`;};
    const topMap=()=>{const B=[["map-soc","#0369A1",8,76,58,38,"SoC"],["map-tcon","#6B6B6B",92,72,64,46,"T-CON"],["map-src","#0E7490",190,34,78,38,"Source"],["map-gate","#B45309",190,118,78,38,"Gate"],["map-panel","#047857",300,72,64,46,"面板"],["map-light","#C2410C",400,76,62,38,"出光"],["map-image","#6B6B6B",498,76,62,38,"畫面"]];const bw=t=>{let w=0;for(const ch of t)w+=ch.charCodeAt(0)>0x2E80?11:6.2;return w+12;};const boxes=B.map(([id,c,x,y,w,h,t])=>`<rect id="${id}" class="mapbox" style="--bc:${c}" x="${x}" y="${y}" width="${w}" height="${h}" rx="7" fill="#FFFFFF"/><text x="${x+w/2}" y="${y+h/2+4}" text-anchor="middle" class="mlbl" fill="${c}">${t}</text>`).join("");const A=[[66,95,92,95],[156,86,190,53],[156,104,190,137],[268,53,300,86],[268,137,300,104],[364,95,400,95],[462,95,498,95]];const arr=A.map(([x1,y1,x2,y2])=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#A3A3A3" stroke-width="1.5" marker-end="url(#amap)"/>`).join("");const badge=(x,y,t,col)=>{const w=bw(t);return `<rect x="${x-w/2}" y="${y-8}" width="${w}" height="16" rx="4" fill="#FFFFFF" stroke="${col?'#A3A3A3':'#E5E5E5'}"/><text x="${x}" y="${y+3}" text-anchor="middle" class="mif"${col?` fill="${col}"`:''}>${t}</text>`;};const lbls=badge(79,84,"LVDS","#6B6B6B")+badge(176,56,"Mini-LVDS","#6B6B6B")+badge(176,134,"閘極控制","#B45309")+badge(286,60,"data")+badge(286,130,"gate")+badge(382,86,"光");return `<svg viewBox="0 0 580 172"><defs><marker id="amap" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L6,3 L0,6 Z" fill="#A3A3A3"/></marker></defs>${arr}${boxes}${lbls}</svg>`;};
    const crossSection=()=>{
      const lx=200,lw=300,rl=595,ml=lx+lw/2;
      const lab=(y,t)=>`<text x="${rl}" y="${y}" text-anchor="end" class="mif">${t}</text>`;
      let s="";
      for(let i=0;i<5;i++){const cx=lx+30+i*60;s+=`<line class="lray" x1="${cx}" y1="160" x2="${cx}" y2="52" stroke="#fbbf24" stroke-width="1.6" stroke-dasharray="4 5" opacity="0.55"/><path d="M${cx-3},58 L${cx},52 L${cx+3},58 Z" fill="#fbbf24" opacity="0.7"/>`;}
      s+=`<rect x="${lx}" y="58" width="${lw}" height="12" rx="3" fill="#E5E5E5"/>`+lab(67,"上偏光板");
      s+=`<rect id="x-cf" class="ht st-panel" style="--bc:#047857" x="${lx}" y="72" width="${lw}" height="28" rx="4" fill="#E5E5E5"/>`;
      for(let i=0;i<24;i++){const cx=lx+8+i*12,col=["#ff5a5a","#3ddc84","#5b8def"][i%3];s+=`<rect x="${cx}" y="76" width="7" height="20" fill="${col}" opacity="0.45"/>`;}
      s+=lab(89,"彩色濾光片 CF");
      s+=`<rect id="x-lc" class="ht st-panel" style="--bc:#047857" x="${lx}" y="102" width="${lw}" height="14" rx="3" fill="#E5E5E5"/>`;
      for(let i=0;i<14;i++){const cx=lx+16+i*20;s+=`<line x1="${cx}" y1="105" x2="${cx+6}" y2="113" stroke="#6B6B6B" stroke-width="1.3" opacity="0.65"/>`;}
      s+=lab(112,"液晶 LC(光閥)");
      s+=`<rect id="x-tft" class="ht st-panel" style="--bc:#047857" x="${lx}" y="118" width="${lw}" height="28" rx="4" fill="#E5E5E5"/>`;
      for(let i=0;i<22;i++){const cx=lx+12+i*13,col=["#ff5a5a","#3ddc84","#5b8def"][i%3];s+=`<rect x="${cx-4}" y="119" width="8" height="4" rx="1" fill="${col}" opacity="0.7"/><circle cx="${cx}" cy="140" r="1.6" fill="#0E7490" opacity="0.85"/>`;}
      s+=lab(135,"TFT 玻璃");
      s+=`<rect x="${lx}" y="148" width="${lw}" height="12" rx="3" fill="#E5E5E5"/>`+lab(157,"下偏光板");
      s+=`<rect id="x-bl" class="ht st-light" style="--bc:#C2410C" x="${lx}" y="162" width="${lw}" height="36" rx="5" fill="#111111"/>`+lab(184,"背光 BLU");
      s+=`<text x="${ml}" y="16" text-anchor="middle" class="mlbl" fill="#6B6B6B">畫面 / 觀看</text>`;
      s+=`<g id="x-img" class="ht st-img" style="--bc:#6B6B6B"><circle cx="${ml}" cy="36" r="11" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="2"/><circle cx="${ml}" cy="36" r="4" fill="#6B6B6B"/></g>`;
      s+=`<rect id="x-goa" class="ht st-drv" style="--bc:#B45309" x="${lx-2}" y="118" width="12" height="28" rx="2" fill="#E5E5E5" stroke="#B45309" stroke-width="1"/>`;
      s+=`<text x="150" y="108" class="mif" fill="#B45309">GOA</text><line x1="168" y1="111" x2="${lx+4}" y2="123" stroke="#B45309" stroke-width="0.8" opacity="0.7"/>`;
      s+=`<text x="${lx+14}" y="159" class="mif" fill="#6B6B6B">畫素電極 + TFT(剖面只見斷面;列×行走線見「正視平面」)</text>`;
      s+=`<g id="x-cof" class="ht st-drv" style="--bc:#0E7490"><path d="M134,250 C 132,206 160,172 ${lx},148" stroke="#E5E5E5" stroke-width="11" fill="none" stroke-linecap="round"/><rect x="150" y="200" width="32" height="18" rx="4" fill="#FFFFFF" stroke="#0E7490" stroke-width="1.2"/></g>`;
      s+=`<text x="100" y="196" class="mif" fill="#0E7490">COF</text><text x="84" y="208" class="mif" fill="#6B6B6B">source driver</text>`;
      s+=`<rect x="80" y="250" width="106" height="34" rx="4" fill="#E5E5E5" stroke="#A3A3A3" stroke-width="1"/><text x="98" y="280" class="mif">PCB</text>`;
      s+=`<rect id="x-tcon" class="ht st-tcon" style="--bc:#6B6B6B" x="118" y="256" width="48" height="22" rx="3" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.2"/><text x="142" y="270" text-anchor="middle" class="mif" fill="#6B6B6B">T-CON</text>`;
      s+=`<rect id="x-soc" class="ht st-soc" style="--bc:#0369A1" x="12" y="252" width="46" height="30" rx="4" fill="#FFFFFF" stroke="#0369A1" stroke-width="1.2"/><text x="35" y="271" text-anchor="middle" class="mif" fill="#6B6B6B">SoC</text>`;
      s+=`<line x1="58" y1="267" x2="80" y2="267" stroke="#A3A3A3" stroke-width="1.4"/><path d="M75,264 L80,267 L75,270 Z" fill="#A3A3A3"/>`;
      s+=`<rect id="x-ls" class="ht st-drv" style="--bc:#B45309" x="86" y="256" width="28" height="18" rx="3" fill="#E5E5E5" stroke="#B45309" stroke-width="1.1"/><text x="100" y="269" text-anchor="middle" style="font:700 8px sans-serif;fill:#111111">LS</text>`;
      s+=`<line x1="100" y1="256" x2="100" y2="244" stroke="#B45309" stroke-width="1.2" stroke-dasharray="3 2"/><path d="M97,248 L100,243 L103,248 Z" fill="#B45309"/><text x="100" y="239" text-anchor="middle" class="brk" fill="#B45309">VGH/VGL</text>`;
      s+=`<rect x="168" y="200" width="14" height="18" rx="2" fill="#E5E5E5" opacity="0.95"/><text x="175" y="197" text-anchor="middle" class="brk" fill="#B45309">LS</text>`;
      s+=`<text x="8" y="314" class="brk">LS = Level Shifter:低壓邏輯 → 高壓(gate 為 VGH / VGL)</text>`;
      s+=`<g class="lpulse"><rect x="${lx+6}" y="152" width="${lw-12}" height="9" rx="4" fill="#111111" opacity="0.5"/></g>`;
      return `<svg viewBox="0 0 600 320">${s}</svg>`;
    };
    const planView=()=>{
      const ax=150,ay=34,aw=400,ah=176,NC=18,NR=8,cw=aw/NC,rh=ah/NR,rc=["#ff5a5a","#3ddc84","#5b8def"];
      let s="";
      s+=`<text x="${ax}" y="22" class="mif" fill="#6B6B6B">正面看:資料線(直/欄,R·G·B 循環)× 閘極線(橫/列)交織成像素陣列</text>`;
      s+=`<rect id="p-bl" class="ht st-light" style="--bc:#C2410C" x="466" y="8" width="92" height="18" rx="4" fill="#E5E5E5" stroke="#C2410C" stroke-width="1"/><text x="512" y="21" text-anchor="middle" class="mif" fill="#111111">背光 BLU(後方)</text>`;
      s+=`<rect id="p-grid" class="ht st-panel" style="--bc:#047857" x="${ax}" y="${ay}" width="${aw}" height="${ah}" rx="4" fill="#FFFFFF"/>`;
      for(let i=0;i<NC;i++){s+=`<rect x="${ax+i*cw}" y="${ay}" width="${cw}" height="${ah}" fill="${rc[i%3]}" opacity="0.13"/>`;}
      for(let j=0;j<NR;j++){const y=ay+(j+0.5)*rh;s+=`<line class="gflow" x1="${ax}" y1="${y}" x2="${ax+aw}" y2="${y}" stroke="#B45309" stroke-width="1" opacity="0.55"/>`;}
      for(let i=0;i<NC;i++){const x=ax+(i+0.5)*cw;s+=`<line class="dflow" x1="${x}" y1="${ay}" x2="${x}" y2="${ay+ah}" stroke="#0E7490" stroke-width="1" opacity="0.6"/>`;}
      s+=`<g class="pscan"><rect x="${ax}" y="${ay}" width="${aw}" height="${rh}" fill="#B45309" opacity="0.16"/></g>`;
      s+=`<rect id="p-screen" class="ht st-img" style="--bc:#6B6B6B" x="${ax-3}" y="${ay-3}" width="${aw+6}" height="${ah+6}" rx="6" fill="none" stroke="#6B6B6B" stroke-width="1.6"/>`;
      s+=`<rect id="p-goa" class="ht st-drv" style="--bc:#B45309" x="${ax-30}" y="${ay}" width="22" height="${ah}" rx="3" fill="#E5E5E5" stroke="#B45309" stroke-width="1"/>`;
      for(let j=0;j<NR;j++){const y=ay+(j+0.5)*rh;s+=`<line x1="${ax-8}" y1="${y}" x2="${ax}" y2="${y}" stroke="#B45309" stroke-width="1" opacity="0.6"/>`;}
      s+=`<text x="${ax-19}" y="${ay-6}" text-anchor="middle" class="mif" fill="#B45309">GOA</text>`;
      const NCOF=6,cofW=aw/NCOF-8;
      s+=`<g id="p-cof" class="ht st-drv" style="--bc:#0E7490">`;
      for(let k=0;k<NCOF;k++){const x=ax+k*(aw/NCOF)+4;s+=`<rect x="${x}" y="${ay+ah+10}" width="${cofW}" height="20" rx="4" fill="#FFFFFF" stroke="#0E7490" stroke-width="1.1"/>`;}
      s+=`</g>`;
      for(let i=0;i<NC;i++){const x=ax+(i+0.5)*cw;s+=`<line x1="${x}" y1="${ay+ah}" x2="${x}" y2="${ay+ah+10}" stroke="#0E7490" stroke-width="0.9" opacity="0.5"/>`;}
      s+=`<text x="${ax}" y="${ay+ah+44}" class="mif" fill="#0E7490">COF source driver ×6 — 資料線↑</text>`;
      s+=`<rect x="${ax}" y="268" width="270" height="30" rx="4" fill="#E5E5E5" stroke="#A3A3A3" stroke-width="1"/><text x="${ax+16}" y="294" class="mif">PCB</text>`;
      s+=`<rect id="p-tcon" class="ht st-tcon" style="--bc:#6B6B6B" x="${ax+150}" y="273" width="100" height="20" rx="3" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.1"/><text x="${ax+200}" y="287" text-anchor="middle" class="mif" fill="#6B6B6B">T-CON</text>`;
      s+=`<rect id="p-soc" class="ht st-soc" style="--bc:#0369A1" x="60" y="270" width="56" height="26" rx="4" fill="#FFFFFF" stroke="#0369A1" stroke-width="1.1"/><text x="88" y="287" text-anchor="middle" class="mif" fill="#6B6B6B">SoC</text>`;
      s+=`<line x1="116" y1="283" x2="${ax}" y2="283" stroke="#A3A3A3" stroke-width="1.3"/><path d="M${ax-5},280 L${ax},283 L${ax-5},286 Z" fill="#A3A3A3"/>`;
      s+=`<rect id="pl-ls" class="ht st-drv" style="--bc:#B45309" x="${ax+96}" y="274" width="40" height="18" rx="3" fill="#E5E5E5" stroke="#B45309" stroke-width="1.1"/><text x="${ax+116}" y="287" text-anchor="middle" style="font:700 8px sans-serif;fill:#111111">LS</text>`;
      s+=`<text x="${ax+96}" y="307" class="brk" fill="#B45309">LS → VGH / VGL → GOA</text>`;
      s+=`<path d="M${ax+60},268 C ${ax+60},250 ${ax+40},244 ${ax+40},${ay+ah+30}" stroke="#E5E5E5" stroke-width="6" fill="none"/>`;
      return `<svg viewBox="0 0 600 320">${s}</svg>`;
    };
    document.getElementById("topmap").innerHTML=crossSection();
    const levelShift=()=>{
      const xs=[110,160,205,255,305,346], lv=[0,1,0,1,0];
      const wave=(lo,hi)=>{let p=[];for(let i=0;i<lv.length;i++){const y=lv[i]?hi:lo;p.push(xs[i]+","+y,xs[i+1]+","+y);}return p.join(" ");};
      const iLo=58,iHi=42,oLo=184,oHi=112,zero=150;
      let s=`<defs><linearGradient id="lsg" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#F4F4F4"/><stop offset="1" stop-color="#E5E5E5"/></linearGradient></defs>`;
      [160,205,255,305].forEach(x=>{s+=`<line x1="${x}" y1="40" x2="${x}" y2="186" stroke="#E5E5E5" stroke-width="1" stroke-dasharray="2 4"/>`;});
      s+=`<line x1="110" y1="${zero}" x2="346" y2="${zero}" stroke="#A3A3A3" stroke-width="1" stroke-dasharray="4 3"/>`;
      s+=`<rect x="8" y="86" width="56" height="56" rx="8" fill="url(#lsg)" stroke="#A3A3A3" stroke-width="1.3"/>`;
      s+=`<text x="36" y="110" text-anchor="middle" style="font:700 9px sans-serif;fill:#111111">Level</text><text x="36" y="122" text-anchor="middle" style="font:700 9px sans-serif;fill:#111111">Shifter</text>`;
      s+=`<line x1="36" y1="86" x2="36" y2="66" stroke="#B45309" stroke-width="1.4"/><path d="M33,71 L36,66 L39,71 Z" fill="#B45309"/><text x="36" y="60" text-anchor="middle" style="font:700 8px sans-serif;fill:#B45309">VGH</text>`;
      s+=`<line x1="36" y1="142" x2="36" y2="160" stroke="#B45309" stroke-width="1.4"/><path d="M33,155 L36,160 L39,155 Z" fill="#B45309"/><text x="36" y="172" text-anchor="middle" style="font:700 8px sans-serif;fill:#B45309">VGL</text>`;
      s+=`<polyline points="${wave(iLo,iHi)}" fill="none" stroke="#6B6B6B" stroke-width="2"/>`;
      s+=`<text x="110" y="32" style="font:700 9px sans-serif;fill:#6B6B6B">① 低壓 logic(T-CON 送來)</text>`;
      s+=`<text x="104" y="${iHi+3}" text-anchor="end" class="brk" fill="#6B6B6B">1.8V</text><text x="104" y="${iLo+3}" text-anchor="end" class="brk">0V</text>`;
      s+=`<polyline points="${wave(oLo,oHi)}" fill="none" stroke="#B45309" stroke-width="2.4"/>`;
      s+=`<text x="110" y="104" style="font:700 9px sans-serif;fill:#B45309">② 高壓驅動 → 開關 TFT gate</text>`;
      s+=`<text x="104" y="${oHi+3}" text-anchor="end" class="brk" fill="#B45309">VGH</text><text x="104" y="${zero+3}" text-anchor="end" class="brk">0V</text><text x="104" y="${oLo+3}" text-anchor="end" class="brk" fill="#fbbf24">VGL</text>`;
      return `<svg viewBox="0 0 360 200">${s}</svg>`;
    };
    const D_SIGIMG=sigImg(), D_SIGWAVE=sigWave(), D_GAMMA=gamma(), D_DAC=dac(), D_LIGHT=light(), D_FINAL=finalImg(), D_TCONIO=tconIO(), D_SRC=sourceChain(), D_GATE=gateScan(), D_LS=levelShift();

    /* ---------- stages + details ---------- */
    const STAGES=[
      {name:"訊源 Host", short:"訊源", ac:"#0369A1", viz:miniSource()},
      {name:"T-CON", short:"T-CON", ac:"#6B6B6B", viz:miniTcon()},
      {name:"驅動IC(COF + GOA)", short:"驅動IC", ac:"#0E7490", viz:miniDriver()},
      {name:"面板 Pixel Array", short:"面板", ac:"#047857", viz:miniPanel()},
      {name:"出光成像", short:"出光", ac:"#C2410C", viz:miniLight()},
      {name:"畫面", short:"畫面", ac:"#6B6B6B", viz:miniImage()}
    ];
    const wrap=(i,body)=>`<div class="dt" style="--ac:${STAGES[i].ac}"><div class="dttl">${i+1}. ${STAGES[i].name}</div>${body}</div>`;
    const DETAILS=[
      wrap(0,`<p class="dtxt">要顯示這張 4×2 小圖,SoC 會一列一列、一個像素一個像素串流出去,並用同步訊號標出邊界。</p><div class="vc img">${D_SIGIMG}</div><p class="dtxt">raster 順序:<b>P1→P2→P3→P4</b>(第 1 列)→ <b>P5→P8</b>(第 2 列)。下面是訊號波形:</p><div class="vc wide">${D_SIGWAVE}</div><ul class="dlist"><li><b>DCLK</b>:每個像素跳一下,決定速率。</li><li><b>DE</b> 高 = 有效像素(綠底);低 = 消隱期。</li><li><b>HSYNC</b> = 換列;<b>VSYNC</b> = 換張。</li><li><b>DATA</b> = 該像素的 RGB 值(此處 16 進位)。</li><li><b>消隱期(blanking)不是浪費</b>:水平消隱讓該列收尾、準備換行;垂直消隱(VSYNC 前後的 porch)給 T-CON 處理時間、讓 GOA 回到第 1 列。遊戲設定裡的「VSync」就是等這個空檔才換幀,避免上半張新、下半張舊的<b>畫面撕裂</b>。</li></ul>`),
      wrap(1,`<p class="dtxt">T-CON 是螢幕的「中間人」:左邊接 SoC 一束打包好的影像,右邊分兩路送給驅動晶片。</p><div class="vc">${D_TCONIO}</div><ul class="dlist"><li><b>輸入(從 SoC)</b>:一條 LVDS 影像線 — 載 RGB + DCLK / HSYNC / VSYNC / DE(另有小設定線)。</li><li><b>輸出① 給 Source Driver(COF)</b>:Mini-LVDS — 修正、重排、切好的畫面資料 + 控制(極性 POL、鎖存)。</li><li><b>輸出② 給 Gate Driver(GOA)</b>:掃描節拍 — STV、CKV、GOE(高壓 VGH / VGL 由 PMIC 供)。</li><li><b>輸出③</b>:背光控制(PWM 調光)。</li></ul><p class="dtxt">至於它在中間做的「修正」,反應在這條 gamma 曲線上:</p><div class="vc">${D_GAMMA}</div><p class="dtxt"><b>Gamma</b>:液晶反應是歪的,先把數字調過讓亮度正確。<b>FRC</b>:用較少位元抖出更多色階。<b>Overdrive</b>:電壓推過頭一點讓液晶轉快、減少殘影。</p>`),
      wrap(2,`<p class="dtxt">「驅動IC」其實是兩種不同的工作,分給兩個東西做:<b>Source Driver(COF)</b> 處理「每一直行要給多少電壓」,<b>Gate Driver(GOA)</b> 處理「哪一排、何時開」。</p><p class="dtxt"><b>Source 這邊(資料 / 類比,較複雜)</b>,每個通道的處理鏈:</p><div class="vc">${D_SRC}</div><ul class="dlist"><li><b>移位 + 鎖存</b>:把 T-CON 送來的資料排到對的通道,湊滿一整列再「同時鎖存」,讓該列所有通道一起輸出。</li><li><b>DAC</b>:把每通道的數位值,參考 <b>Gamma 電壓</b>轉成對應的類比電壓。</li><li><b>極性 ±</b>:依 column inversion 套上正 / 負極性(以 VCOM 為基準)。</li><li><b>輸出緩衝</b>:用運算放大器把電壓有力地推上 data line(快速充電)。每顆 COF 只負責自己那段通道(如 D1–D961)。</li><li><b>充電時間極短</b>:FHD@60Hz 一列只分到約 15µs,還要扣掉走線的 RC 延遲——大面板離驅動端遠的位置容易「充不飽」(充電不足),對策有加粗走線、pre-charge 先預充,以及手機面板常見的 <b>1:3 MUX</b>(一個輸出輪流餵 R/G/B 三條 data line,省通道數)。</li></ul><p class="dtxt"><b>Gate 這邊(掃描 / 開關,簡單很多)</b>,一個做在玻璃上的高壓移位暫存器:</p><div class="vc">${D_GATE}</div><ul class="dlist"><li><b>STV</b> 起頭、<b>CKV</b>(多相時脈)每跳一下把「現在輪到哪排」往下移一排、<b>GOE</b> 控制脈衝寬度。</li><li>輪到的那排輸出 <b>VGH</b>(高壓,開那排 TFT),其餘排是 <b>VGL</b>(關);VGH / VGL 由 PMIC 供。</li><li>它完全不碰畫面資料,只負責「一次開一排、由上往下」——夠簡單,所以能直接做在玻璃上(GOA),不必另一顆貴的 IC。</li></ul><p class="dtxt"><b>中間的關鍵:Level Shifter(位準轉換)</b> — 不管 source 還是 gate,T-CON 送來的都是<b>低壓邏輯</b>(0 / 1.8V 之類);但真正去開關面板的電壓高很多。level shifter 站在中間當「翻譯官」:<b>內容、時序都不變,只把電壓擺幅放大</b>(gate 這邊最明顯,要放大到 VGH / VGL)。</p><div class="vc">${D_LS}</div><ul class="dlist"><li>同一個邊緣、同一個節拍(看上下對齊的虛線),只是<b>下面那條擺幅大很多、還跨到負壓</b>。</li><li><b>Gate 側</b>:低壓 STV / CKV / GOE → level shifter → <b>VGH(約 +15~+30V)/ VGL(約 −7~−15V)</b> 去切 TFT;GOA 面板的高壓 clock 就是這樣升上來的(常是一顆專門的 level shifter IC)。</li><li><b>Source 側</b>:前段數位邏輯(低壓)和後段 DAC / 輸出緩衝(高壓 AVDD、相對 VCOM)之間也有這道邊界,控制位元要先 level shift 上去。</li><li>實作:高壓域 <b>cross-coupled PMOS latch</b> + 低壓側 NMOS 差動對;大擺幅用 HV / LDMOS、必要時分段升壓,並盯 propagation delay 與轉態的 shoot-through。</li></ul><p class="dtxt">一句話:<b>source 管「給多少電壓」</b>(每行一個 DAC + 緩衝,類比重);<b>gate 管「開哪一排」</b>(高壓 on / off 排序,邏輯輕)。兩邊在面板上交會,就完成一次充電。</p>`),
      wrap(3,`<p class="dtxt">這就是 data line(來自 COF)與 gate line(來自 GOA)在 TFT 矩陣上交會的瞬間:gate 一次拉高一排,data 同時把電壓灌進去。</p><div class="da-status" id="da-status">準備中…</div><div class="vc gd"><svg id="da-grid" viewBox="0 0 560 348"></svg></div><div class="da-legend"><span><span class="ldot" style="background:#B45309"></span>gate 通電(GOA)</span><span><span class="ldot" style="background:#0E7490"></span>data 送電壓(COF)</span><span><span class="ldot" style="background:#ff5a5a"></span>R</span><span><span class="ldot" style="background:#3ddc84"></span>G</span><span><span class="ldot" style="background:#5b8def"></span>B</span></div>`),
      wrap(4,`<p class="dtxt">背光(白光)由下往上,穿過液晶與彩色濾光片。</p><div class="vc">${D_LIGHT}</div><p class="dtxt">液晶依前一站充進去的電壓控制透光量,再經彩色濾光片(R / G / B)決定該子像素的顏色與亮度。</p><p class="dtxt">上下還各有一片<b>偏光板</b>:下片先把光變成單一偏振,液晶負責「轉不轉」,上片決定「過不過」——這才是光閥的開關機制(見目錄「偏光板 × 液晶」;光一路的損耗見「穿透率與開口率」)。</p>`),
      wrap(5,`<p class="dtxt">幾百萬個子畫素(FHD 是 622 萬;4K 是它的 4 倍)的紅綠藍亮度合在一起,就成了看得見、會動的影像——也就是最一開始那張圖,現在被「點亮」顯示出來。</p><div class="vc">${D_FINAL}</div>`)
    ];

    /* ---------- render horizontal strip ---------- */
    const strip=document.getElementById("strip");
    strip.innerHTML=STAGES.map((s,i)=>`<div class="stage" id="stage-${i}" data-i="${i}" style="--ac:${s.ac}"><div class="sviz">${s.viz}</div><div class="srow"><div class="snum2">${i+1}</div><div class="sname">${s.short}</div></div></div>`+(i<STAGES.length-1?`<div class="scon">&#8250;</div>`:``)).join("");

    /* ---------- panel-driving animation (detail stage 3) ---------- */
    let __dtimer=null;
    function clearDetailTimer(){ if(__dtimer){clearInterval(__dtimer);__dtimer=null;} }
    function startPanelAnim(){
      const svg=document.getElementById("da-grid"), statusEl=document.getElementById("da-status");
      if(!svg) return;
      const COLS=6,ROWS=4,L=80,R=520,T=58,B=296,colW=(R-L)/COLS,rowH=(B-T)/ROWS;
      const colX=i=>L+colW*(i+0.5),rowY=j=>T+rowH*(j+0.5),pw=46,ph=40;
      const cc=["#ff5a5a","#3ddc84","#5b8def","#ff5a5a","#3ddc84","#5b8def"],sn=["R1","G1","B1","R2","G2","B2"];
      const EE=(t,a,x)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;return e;};
      const hl=EE("rect",{id:"da-hl","class":"rowhl",x:L-6,width:(R-L)+12,height:rowH-10,rx:6,y:rowY(0)-(rowH-10)/2});svg.appendChild(hl);
      for(let r=0;r<ROWS;r++) svg.appendChild(EE("line",{id:"da-g-"+r,"class":"gateline",x1:L-4,y1:rowY(r),x2:R+4,y2:rowY(r)}));
      for(let c=0;c<COLS;c++) svg.appendChild(EE("line",{id:"da-d-"+c,"class":"dataline",x1:colX(c),y1:T-2,x2:colX(c),y2:B+18}));
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){svg.appendChild(EE("rect",{id:"da-p-"+r+"-"+c,"class":"subpx",x:colX(c)-pw/2,y:rowY(r)-ph/2,width:pw,height:ph,rx:5,fill:cc[c]}));svg.appendChild(EE("circle",{id:"da-t-"+r+"-"+c,"class":"tft",cx:colX(c)-pw/2+5,cy:rowY(r)+ph/2-5,r:3.4}));}
      for(let r=0;r<ROWS;r++) svg.appendChild(EE("text",{id:"da-gl-"+r,"class":"glabel",x:L-16,y:rowY(r)+4,"text-anchor":"end"},"G"+(r+1)));
      for(let c=0;c<COLS;c++){svg.appendChild(EE("text",{"class":"dlabel",x:colX(c),y:24,"text-anchor":"middle"},"D"+(c+1)));svg.appendChild(EE("text",{"class":"dsub",x:colX(c),y:41,"text-anchor":"middle",fill:cc[c]},sn[c]));}
      svg.appendChild(EE("rect",{"class":"cof",x:L-6,y:B+18,width:(R-L)+12,height:26,rx:6}));
      svg.appendChild(EE("text",{"class":"coftext",x:(L+R)/2,y:B+35,"text-anchor":"middle"},"Source Driver(COF)— 資料電壓由這裡送上來"));
      const g=(r,on)=>{const a=document.getElementById("da-g-"+r);if(!a)return;a.classList.toggle("on",on);document.getElementById("da-gl-"+r).classList.toggle("on",on);for(let c=0;c<COLS;c++)document.getElementById("da-t-"+r+"-"+c).classList.toggle("on",on);};
      const ch=(r,on)=>{for(let c=0;c<COLS;c++){const e=document.getElementById("da-p-"+r+"-"+c);if(e)e.classList.toggle("charged",on);}};
      const fl=(on)=>{for(let c=0;c<COLS;c++){const e=document.getElementById("da-d-"+c);if(e)e.classList.toggle("flow",on);}};
      const sh=(r,on)=>{hl.setAttribute("y",rowY(r)-(rowH-10)/2);hl.classList.toggle("show",on);};
      let row=0,phase="writing";
      function tick(){
        if(!document.getElementById("da-grid")){clearDetailTimer();return;}
        for(let r=0;r<ROWS;r++) g(r,false);
        if(phase==="writing"){g(row,true);ch(row,true);fl(true);sh(row,true);statusEl.textContent="GOA 把 G"+(row+1)+" 拉高 → COF 經 D1～D6 同時寫入第 "+(row+1)+" 排";row++;if(row>=ROWS)phase="hold";}
        else if(phase==="hold"){fl(false);sh(0,false);statusEl.textContent="整張寫完 → 顯示中(保持電壓)";phase="reset";}
        else{for(let r=0;r<ROWS;r++) ch(r,false);statusEl.textContent="下一個影格,GOA 再從第 1 排掃起…";phase="writing";row=0;}
      }
      tick(); __dtimer=setInterval(tick,950);
    }

    /* ---------- selection + tour ---------- */
    const detail=document.getElementById("detail");
    const KEY=["soc","tcon","drv","panel","light","img"];
    const VIEWS={side:crossSection,plan:planView};
    function applyHot(){
      document.querySelectorAll(".ht").forEach(b=>b.classList.remove("hot"));
      document.querySelectorAll(".st-"+KEY[sel]).forEach(b=>b.classList.add("hot"));
    }
    let sel=0, tourTimer=null;
    function select(i){
      sel=i;
      STAGES.forEach((_,k)=>document.getElementById("stage-"+k).classList.toggle("sel",k===i));
      applyHot();
      const el=document.getElementById("stage-"+i); if(el&&el.scrollIntoView) el.scrollIntoView({behavior:"smooth",inline:"center",block:"nearest"});
      clearDetailTimer();
      detail.innerHTML=DETAILS[i];
      if(i===3) startPanelAnim();
    }
    document.querySelectorAll(".stage").forEach(el=>el.addEventListener("click",()=>{stopTour();select(+el.dataset.i);}));
    function setView(v){ document.getElementById("topmap").innerHTML=VIEWS[v](); document.querySelectorAll(".vtab[data-v]").forEach(b=>b.classList.toggle("on",b.dataset.v===v)); applyHot(); }
    document.querySelectorAll(".vtab[data-v]").forEach(b=>b.addEventListener("click",()=>setView(b.dataset.v)));
    const tourBtn=document.getElementById("tour");
    function stopTour(){ if(tourTimer){clearInterval(tourTimer);tourTimer=null;tourBtn.textContent="▶ 自動導覽";} }
    function startTour(){ tourBtn.textContent="⏸ 暫停"; tourTimer=setInterval(()=>select((sel+1)%STAGES.length),4200); }
    tourBtn.addEventListener("click",()=>{ tourTimer?stopTour():startTour(); });
    /* ---------- module: single-pixel light valve (the core demo) ---------- */
    const FCL=[[255,76,76],[76,210,110],[96,150,255]];
    let blOn=true;
    const Rv=document.getElementById("lv-r"),Gv=document.getElementById("lv-g"),Bv=document.getElementById("lv-b");
    function lvSub(x,w,fc,v){
      const f=blOn?v/255:0, emit=fc.map(c=>Math.round(c*f)), litH=Math.round(78*f), ang=(12+78*f).toFixed(0), cx=x+w/2;
      let g="";
      g+=`<rect x="${x}" y="182" width="${w}" height="18" rx="3" fill="${blOn?'#111111':'#E5E5E5'}"/>`;
      g+=`<rect x="${x}" y="98" width="${w}" height="80" rx="4" fill="#FFFFFF" stroke="#E5E5E5"/>`;
      g+=`<rect x="${x+3}" y="${176-litH}" width="${w-6}" height="${litH}" rx="2" fill="#111111" opacity="${(0.2+0.65*f).toFixed(2)}"/>`;
      for(let k=0;k<3;k++){const my=120+k*20;g+=`<line x1="${cx-9}" y1="${my}" x2="${cx+9}" y2="${my}" stroke="#6B6B6B" stroke-width="2.4" stroke-linecap="round" transform="rotate(${ang} ${cx} ${my})"/>`;}
      g+=`<rect x="${x}" y="74" width="${w}" height="20" rx="3" fill="rgb(${fc})"/>`;
      g+=`<line x1="${cx}" y1="98" x2="${cx}" y2="78" stroke="#111111" stroke-width="2.6" stroke-dasharray="3 3" opacity="${(0.12+0.7*f).toFixed(2)}"/>`;
      g+=`<rect x="${x}" y="30" width="${w}" height="40" rx="4" fill="rgb(${emit})" stroke="#E5E5E5"/>`;
      return g;
    }
    function renderLV(){
      if(!Rv) return;
      const r=+Rv.value,g=+Gv.value,b=+Bv.value;
      let s=lvSub(24,52,FCL[0],r)+lvSub(92,52,FCL[1],g)+lvSub(160,52,FCL[2],b);
      s+=`<text x="78" y="54" text-anchor="middle" class="mlbl" fill="#A3A3A3">+</text><text x="146" y="54" text-anchor="middle" class="mlbl" fill="#A3A3A3">+</text>`;
      s+=`<text x="222" y="55" class="mif">出光</text><text x="222" y="88" class="mif">濾光片</text><text x="222" y="142" class="mif">液晶(光閥)</text><text x="222" y="194" class="mif">${blOn?'背光(白·亮)':'背光(關)'}</text>`;
      [["R",24],["G",92],["B",160]].forEach(([t,x])=>{s+=`<text x="${x+26}" y="216" text-anchor="middle" class="mlbl" fill="#111111">${t}</text>`;});
      s+=`<path d="M214,44 L292,72" stroke="#A3A3A3" stroke-width="1.3" stroke-dasharray="4 4"/><path d="M284,69 L292,74 L283,76 Z" fill="#A3A3A3"/>`;
      const hex=[r,g,b].map(n=>n.toString(16).padStart(2,"0").toUpperCase()).join("");
      s+=`<text x="332" y="40" text-anchor="middle" class="mif">這顆畫素</text>`;
      s+=`<rect x="298" y="48" width="68" height="68" rx="9" fill="rgb(${blOn?r:0},${blOn?g:0},${blOn?b:0})" stroke="#A3A3A3" stroke-width="1.4"/>`;
      s+=`<text x="332" y="132" text-anchor="middle" class="dig2">#${blOn?hex:'000000'}</text>`;
      s+=`<text x="332" y="150" text-anchor="middle" class="mif">R ${r} · G ${g} · B ${b}</text>`;
      document.getElementById("lvbox").innerHTML=`<svg viewBox="0 0 380 226">${s}</svg>`;
    }
    if(Rv){
      [Rv,Gv,Bv].forEach(inp=>inp.addEventListener("input",renderLV));
      document.querySelectorAll(".lv-presets [data-lv]").forEach(btn=>btn.addEventListener("click",()=>{const p=btn.dataset.lv.split(",");Rv.value=p[0];Gv.value=p[1];Bv.value=p[2];if(!blOn){blOn=true;const bb=document.getElementById("lv-bl");if(bb)bb.textContent="關背光";}renderLV();}));
      const blBtn=document.getElementById("lv-bl");
      if(blBtn)blBtn.addEventListener("click",()=>{blOn=!blOn;blBtn.textContent=blOn?"關背光":"開背光";renderLV();});
      renderLV();
    }

    /* ---------- module: why-a-grid mini illustration ---------- */
    function whyGrid(){
      const ax=46,ay=16,cw=30,rh=22,NC=6,NR=4,act=1,rc=["#ff5a5a","#3ddc84","#5b8def"];
      let s=`<rect x="${ax}" y="${ay+act*rh}" width="${NC*cw}" height="${rh}" fill="#B45309" opacity="0.13"/>`;
      for(let r=0;r<NR;r++)for(let c=0;c<NC;c++)s+=`<rect x="${ax+c*cw+3}" y="${ay+r*rh+3}" width="${cw-6}" height="${rh-6}" rx="2" fill="${rc[c%3]}" opacity="${r===act?0.85:0.28}"/>`;
      for(let r=0;r<NR;r++){const y=ay+r*rh+rh/2,on=r===act;s+=`<line x1="22" y1="${y}" x2="${ax}" y2="${y}" stroke="${on?'#B45309':'#A3A3A3'}" stroke-width="${on?2:1.2}"/>`;}
      s+=`<text x="18" y="${ay+act*rh+rh/2+3}" text-anchor="end" class="mif" fill="#B45309">選列→</text>`;
      const by=ay+NR*rh;
      for(let c=0;c<NC;c++){const x=ax+c*cw+cw/2;s+=`<line x1="${x}" y1="${by}" x2="${x}" y2="${by+13}" stroke="#0E7490" stroke-width="1.3"/><path d="M${x-3},${by+3} L${x},${by-2} L${x+3},${by+3} Z" fill="#0E7490"/>`;}
      s+=`<text x="${ax+NC*cw/2}" y="${by+30}" text-anchor="middle" class="mif" fill="#0E7490">↑ 資料:每欄一條,COF 同時灌入這一列</text>`;
      return `<svg viewBox="0 0 ${ax+NC*cw+20} ${by+40}">${s}</svg>`;
    }
    { const wg=document.getElementById("whygrid"); if(wg) wg.innerHTML=whyGrid(); }

    /* ---------- module: structure-diagram animation speed ---------- */
    { const card=document.querySelector(".app"); document.querySelectorAll(".spd [data-spd]").forEach(b=>b.addEventListener("click",()=>{card.classList.remove("spd-slow","spd-stop");if(b.dataset.spd==="slow")card.classList.add("spd-slow");else if(b.dataset.spd==="stop")card.classList.add("spd-stop");document.querySelectorAll(".spd [data-spd]").forEach(x=>x.classList.toggle("on",x.dataset.spd===b.dataset.spd));})); }

    /* ---------- module: gamma correction ---------- */
    const GG=document.getElementById("gm-g"), gmv=document.getElementById("gm-v");
    function renderGamma(){
      if(!GG) return;
      const g=GG.value/100; if(gmv)gmv.textContent=g.toFixed(2);
      const x0=34,x1=292,y0=12,y1=92,W=x1-x0,H=y1-y0;
      let s=`<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y1}" stroke="#A3A3A3"/><line x1="${x0}" y1="${y0}" x2="${x0}" y2="${y1}" stroke="#A3A3A3"/>`;
      s+=`<text x="${x0}" y="${y1+12}" class="brk">0</text><text x="${x1}" y="${y1+12}" text-anchor="end" class="brk">255 碼</text><text x="${x0-4}" y="${y0+5}" text-anchor="end" class="brk">亮</text>`;
      s+=`<line x1="${x0}" y1="${y1}" x2="${x1}" y2="${y0}" stroke="#A3A3A3" stroke-width="1" stroke-dasharray="4 4"/><text x="${x1-2}" y="${y0+10}" text-anchor="end" class="brk" fill="#A3A3A3">線性</text>`;
      let pts=[];for(let i=0;i<=40;i++){const c=i/40,L=Math.pow(c,g);pts.push((x0+c*W).toFixed(1)+","+(y1-L*H).toFixed(1));}
      s+=`<polyline points="${pts.join(" ")}" fill="none" stroke="#6B6B6B" stroke-width="2.2"/><text x="${(x0+W*0.46).toFixed(0)}" y="${(y1-H*0.16).toFixed(0)}" class="brk" fill="#6B6B6B">γ 曲線</text>`;
      const ry=104,rh=20,N=48;
      for(let i=0;i<N;i++){const c=i/(N-1),v=Math.round(255*Math.pow(c,g));s+=`<rect x="${(x0+i*(W/N)).toFixed(1)}" y="${ry}" width="${(W/N+0.6).toFixed(1)}" height="${rh}" fill="rgb(${v},${v},${v})"/>`;}
      s+=`<text x="${x0}" y="${ry+rh+12}" class="brk">輸出亮度(碼 0→255 經 γ)</text>`;
      document.getElementById("gmbox").innerHTML=`<svg viewBox="0 0 300 142">${s}</svg>`;
    }
    if(GG){ GG.addEventListener("input",renderGamma); renderGamma(); }

    /* ---------- module: polarity inversion ---------- */
    let invScheme="frame", invPhase=0;
    const INVD={frame:"Frame:整面同極性,逐幀翻;最省電,但易整面閃。",line:"Line(列反轉):一列一列相反。",column:"Column(行反轉):一行一行相反。",dot:"Dot(點反轉):棋盤式,畫質最好、最耗電。"};
    function invPol(r,c){ let b; if(invScheme==="frame")b=0; else if(invScheme==="line")b=r&1; else if(invScheme==="column")b=c&1; else b=(r+c)&1; return b^invPhase; }
    function renderInv(){
      if(!document.getElementById("invbox")) return;
      const NC=8,NR=6,cw=30,ch=22,ax=8,ay=8; let s="";
      for(let r=0;r<NR;r++)for(let c=0;c<NC;c++){const p=invPol(r,c),x=ax+c*cw,y=ay+r*ch,col=p?"#3b6bd6":"#d6453b";s+=`<rect x="${x}" y="${y}" width="${cw-3}" height="${ch-3}" rx="3" fill="${col}" opacity="0.85"/><text x="${x+(cw-3)/2}" y="${y+(ch-3)/2+4}" text-anchor="middle" style="font:700 11px sans-serif;fill:#fff">${p?"−":"+"}</text>`;}
      document.getElementById("invbox").innerHTML=`<svg viewBox="0 0 ${ax*2+NC*cw} ${ay*2+NR*ch}">${s}</svg>`;
      const d=document.getElementById("inv-desc"); if(d)d.textContent=INVD[invScheme];
    }
    if(document.getElementById("invbox")){
      document.querySelectorAll("#invtabs [data-inv]").forEach(b=>b.addEventListener("click",()=>{invScheme=b.dataset.inv;document.querySelectorAll("#invtabs [data-inv]").forEach(x=>x.classList.toggle("on",x===b));renderInv();}));
      renderInv(); setInterval(()=>{invPhase^=1;renderInv();},1100);
    }

    /* ---------- module: pixel sample-and-hold ---------- */
    let shTarget=0.7, shHold=0.7, shT=0;
    const SHv=document.getElementById("sh-v");
    function renderSH(){
      const box=document.getElementById("shbox"); if(!box||box.closest("#lib")) return;
      const gateOn=shT<0.16;
      const v= gateOn ? shHold+(shTarget-shHold)*(shT/0.16) : shTarget;
      const g=Math.round(36+v*210);
      let s=`<text x="20" y="18" class="brk">畫素亮度</text><rect x="20" y="26" width="72" height="72" rx="8" fill="rgb(${g},${g},${g})" stroke="#A3A3A3"/>`;
      s+=`<text x="120" y="18" class="brk">電容電壓</text><rect x="120" y="26" width="24" height="72" rx="4" fill="#FFFFFF" stroke="#E5E5E5"/><rect x="123" y="${(26+72-v*72).toFixed(1)}" width="18" height="${(v*72).toFixed(1)}" rx="3" fill="#047857"/>`;
      s+=`<text x="170" y="18" class="brk">閘極</text><rect x="170" y="26" width="110" height="28" rx="7" fill="${gateOn?'#E5E5E5':'#FFFFFF'}" stroke="${gateOn?'#B45309':'#E5E5E5'}"/><text x="225" y="44" text-anchor="middle" style="font:700 11px sans-serif;fill:${gateOn?'#111111':'#A3A3A3'}">${gateOn?'開 · 充電':'關 · 保持'}</text>`;
      s+=`<text x="170" y="74" class="brk" fill="#6B6B6B">${gateOn?'資料電壓灌入電容':'電容保持,畫面不熄'}</text>`;
      s+=`<text x="170" y="90" class="brk">一幀 ≈ 16ms,閘極只開最前面一小段</text>`;
      box.innerHTML=`<svg viewBox="0 0 300 108">${s}</svg>`;
    }
    if(SHv){
      SHv.addEventListener("input",()=>{ shTarget=SHv.value/100; });
      setInterval(()=>{ shT+=0.02; if(shT>=1){ shT=0; shHold=shTarget; } renderSH(); },40);
    }

    /* ---------- module: bit depth / FRC ---------- */
    let btBits=6, btFrc=false, btFrame=0;
    function renderBits(){
      const box=document.getElementById("btbox"); if(!box) return;
      const L=Math.pow(2,btBits), N=72, x0=6,y=8,W=288,h=46; let s="";
      for(let i=0;i<N;i++){const t=i/(N-1); let lvl;
        if(!btFrc){ lvl=Math.round(t*(L-1)); }
        else { const lo=Math.floor(t*(L-1)), fr=t*(L-1)-lo, p=((btFrame+i)&3); lvl=lo+((fr>(p+0.5)/4)?1:0); if(lvl>L-1)lvl=L-1; }
        const v=Math.round(lvl/(L-1)*255);
        s+=`<rect x="${(x0+i*(W/N)).toFixed(1)}" y="${y}" width="${(W/N+0.6).toFixed(1)}" height="${h}" fill="rgb(${v},${v},${v})"/>`;
      }
      s+=`<text x="${x0}" y="${y+h+13}" class="brk">暗 → 亮(${L} 階${btFrc?' + FRC':''})</text>`;
      box.innerHTML=`<svg viewBox="0 0 300 ${y+h+20}">${s}</svg>`;
    }
    if(document.getElementById("btbox")){
      document.querySelectorAll("#bttabs [data-bit]").forEach(b=>b.addEventListener("click",()=>{btBits=+b.dataset.bit;document.querySelectorAll("#bttabs [data-bit]").forEach(x=>x.classList.toggle("on",x===b));renderBits();}));
      const fb=document.getElementById("bt-frc"); fb.addEventListener("click",()=>{btFrc=!btFrc;fb.textContent="FRC:"+(btFrc?"開":"關");fb.classList.toggle("on",btFrc);renderBits();});
      renderBits(); setInterval(()=>{ if(btFrc){btFrame=(btFrame+1)&3;renderBits();} },120);
    }

    /* ---------- module: response time / overdrive ---------- */
    let rtOD=false; const RTcells=new Array(44).fill(0); let rtPos=0;
    function renderRT(){
      const box=document.getElementById("rtbox"); if(!box||box.closest("#lib")) return;
      const N=RTcells.length, x0=6,y=10,W=288,h=44, cw=W/N, decay=rtOD?0.45:0.8;
      rtPos+=0.9; if(rtPos>=N) rtPos=0;
      for(let i=0;i<N;i++) RTcells[i]*=decay;
      RTcells[Math.floor(rtPos)]=1;
      let s="";
      for(let i=0;i<N;i++){const v=Math.round(RTcells[i]*235);s+=`<rect x="${(x0+i*cw).toFixed(1)}" y="${y}" width="${(cw+0.6).toFixed(1)}" height="${h}" fill="rgb(${v},${v},${v})"/>`;}
      s+=`<text x="${x0}" y="${y+h+14}" class="brk">${rtOD?'Overdrive 開:拖影短':'無 Overdrive:拖影長'}</text>`;
      box.innerHTML=`<svg viewBox="0 0 300 ${y+h+20}">${s}</svg>`;
    }
    if(document.getElementById("rtbox")){
      const ob=document.getElementById("rt-od"); ob.addEventListener("click",()=>{rtOD=!rtOD;ob.textContent="Overdrive:"+(rtOD?"開":"關");ob.classList.toggle("on",rtOD);});
      setInterval(renderRT,45);
    }

    /* ---------- module: subpixel rendering ---------- */
    let spPat="heart", spZoom=0;
    function spColor(x,y,W,H){
      if(spPat==="bars"){ const cols=[[230,60,60],[60,210,90],[80,140,255],[235,235,235],[235,210,60],[60,210,210]]; return cols[Math.floor(x/(W/cols.length))%cols.length]; }
      const nx=(x/(W-1))*2-1, ny=(y/(H-1))*2-1;
      if(spPat==="dot"){ return (nx*nx+ny*ny<=0.72)?[90,210,235]:[14,20,34]; }
      const X=nx*1.25, Y=-ny*1.25+0.25, e=Math.pow(X*X+Y*Y-1,3)-X*X*Y*Y*Y;
      return (e<=0)?[230,70,80]:[14,20,34];
    }
    function renderSP(){
      const box=document.getElementById("spbox"); if(!box) return;
      const W=14,H=10, cw=20,ch=20, ax=6,ay=6; let s="";
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const c=spColor(x,y,W,H),px=ax+x*cw,py=ay+y*ch;
        if(!spZoom){ s+=`<rect x="${px}" y="${py}" width="${cw-1}" height="${ch-1}" rx="1" fill="rgb(${c})"/>`; }
        else { const sw=(cw-1)/3; s+=`<rect x="${px}" y="${py}" width="${sw}" height="${ch-1}" fill="rgb(${c[0]},0,0)"/><rect x="${px+sw}" y="${py}" width="${sw}" height="${ch-1}" fill="rgb(0,${c[1]},0)"/><rect x="${px+2*sw}" y="${py}" width="${sw}" height="${ch-1}" fill="rgb(0,0,${c[2]})"/>`; }
      }
      box.innerHTML=`<svg viewBox="0 0 ${ax*2+W*cw} ${ay*2+H*ch}">${s}</svg>`;
    }
    if(document.getElementById("spbox")){
      document.querySelectorAll("#sptabs [data-sp]").forEach(b=>b.addEventListener("click",()=>{spPat=b.dataset.sp;document.querySelectorAll("#sptabs [data-sp]").forEach(x=>x.classList.toggle("on",x===b));renderSP();}));
      document.querySelectorAll("[data-spz]").forEach(b=>b.addEventListener("click",()=>{spZoom=+b.dataset.spz;document.querySelectorAll("[data-spz]").forEach(x=>x.classList.toggle("on",x===b));renderSP();}));
      renderSP();
    }

    /* ---------- module: raster scan-out ---------- */
    let scRow=0, scTimer=null;
    function scImg(x,y,W,H){
      const nx=x/(W-1), ny=y/(H-1), dx=nx-0.72, dy=ny-0.28;
      if(dx*dx+dy*dy<0.02) return [250,220,80];
      if(ny>0.66) return [70,170,90];
      const b=Math.round(120+ny*110); return [80,130,b>255?255:b];
    }
    function renderSC(){
      const box=document.getElementById("scbox"); if(!box) return;
      const W=20,H=14, cw=14,ch=14, ax=6,ay=6; let s="";
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){const px=ax+x*cw,py=ay+y*ch;
        if(y<scRow){const c=scImg(x,y,W,H);s+=`<rect x="${px}" y="${py}" width="${cw}" height="${ch}" fill="rgb(${c})"/>`;}
        else if(y===scRow){const c=scImg(x,y,W,H);s+=`<rect x="${px}" y="${py}" width="${cw}" height="${ch}" fill="rgb(${c})"/><rect x="${px}" y="${py}" width="${cw}" height="${ch}" fill="#B45309" opacity="0.45"/>`;}
        else {s+=`<rect x="${px}" y="${py}" width="${cw}" height="${ch}" fill="#FFFFFF"/>`;}
      }
      box.innerHTML=`<svg viewBox="0 0 ${ax*2+W*cw} ${ay*2+H*ch}">${s}</svg>`;
    }
    function scStep(){ scRow++; if(scRow>14) scRow=0; renderSC(); }
    if(document.getElementById("scbox")){
      const pb=document.getElementById("sc-play");
      document.getElementById("sc-step").addEventListener("click",()=>{ if(scTimer){clearInterval(scTimer);scTimer=null;pb.textContent="▶ 播放";pb.classList.remove("on");} scStep(); });
      document.getElementById("sc-reset").addEventListener("click",()=>{ scRow=0; renderSC(); });
      pb.addEventListener("click",()=>{ if(scTimer){clearInterval(scTimer);scTimer=null;pb.textContent="▶ 播放";pb.classList.remove("on");} else {scTimer=setInterval(scStep,150);pb.textContent="⏸ 暫停";pb.classList.add("on");} });
      renderSC();
    }

    /* ---------- HERO: one big schematic; click a component to expand its blocks ---------- */
    const heroDiagram=()=>{
      const px=300,py=110,pw=560,ph=380;
      let s="";
      s+=`<rect x="${px-10}" y="${py-10}" width="${pw+20}" height="${ph+20}" rx="14" fill="#E5E5E5" opacity="0.5"/>`;
      s+=`<g class="hot" data-blk="panel"><rect class="hotbg" x="${px}" y="${py}" width="${pw}" height="${ph}" rx="10"/><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="10" fill="#FFFFFF" stroke="#047857" stroke-width="1.5"/>`;
      {
        const C=4,R=3, cw=pw/C, ch=ph/R, p=12, gap=6, sw=(cw-2*p-2*gap)/3, sub=["#ff5a5a","#3ddc84","#5b8def"];
        const dlX=(c,si)=> px+c*cw+p+si*(sw+gap)+sw/2;
        const gateY=(r)=> py+r*ch+ch-16;
        for(let c=0;c<C;c++)for(let si=0;si<3;si++){const x=dlX(c,si);s+=`<line x1="${x}" y1="${py}" x2="${x}" y2="${py+ph}" stroke="#A3A3A3" stroke-width="1" opacity="0.5"/>`;}
        s+=`<defs><clipPath id="vclip"><rect id="vcliprect" x="${px}" y="${py}" width="${pw}" height="${ch}"/></clipPath></defs>`;
        s+=`<g clip-path="url(#vclip)">`;
        for(let c=0;c<C;c++)for(let si=0;si<3;si++){const x=dlX(c,si);s+=`<line x1="${x}" y1="${py}" x2="${x}" y2="${py+ph}" stroke="#0E7490" stroke-width="1.6" class="vflow"/>`;}
        s+=`</g>`;
        for(let r=0;r<R;r++){const gy=gateY(r);s+=`<line x1="${px}" y1="${gy}" x2="${px+pw}" y2="${gy}" stroke="#A3A3A3" stroke-width="1.5" opacity="0.75"/>`;}
        for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(let si=0;si<3;si++){
          const x=dlX(c,si), gy=gateY(r), cy=py+r*ch, sx=x-sw/2, stTop=cy+12, stH=ch-12-34;
          s+=`<rect x="${sx}" y="${stTop}" width="${sw}" height="${stH}" rx="3" fill="${sub[si]}" opacity="0.5"/>`;
          s+=`<line x1="${x}" y1="${stTop+stH}" x2="${x}" y2="${gy-5}" stroke="#6B6B6B" stroke-width="0.8"/>`;
          s+=`<rect x="${x-5}" y="${gy-5}" width="10" height="10" rx="1.5" fill="#FFFFFF" stroke="#A3A3A3" stroke-width="1"/>`;
          s+=`<line x1="${x}" y1="${gy+5}" x2="${x}" y2="${gy+8}" stroke="#A3A3A3" stroke-width="0.8"/><line x1="${x-5}" y1="${gy+8}" x2="${x+5}" y2="${gy+8}" stroke="#A3A3A3" stroke-width="1.4"/><line x1="${x-5}" y1="${gy+11}" x2="${x+5}" y2="${gy+11}" stroke="#A3A3A3" stroke-width="1.4"/>`;
        }
        s+=`<text x="${dlX(0,0)+9}" y="${gateY(0)+1}" style="font:700 8px sans-serif;fill:#111111">TFT</text>`;
        s+=`<text x="${dlX(0,0)+9}" y="${gateY(0)+12}" style="font:700 8px sans-serif;fill:#111111">Cst</text>`;
      }
      s+=`<g id="hpx"></g>`;
      s+=`<text x="${px}" y="40" style="font:700 17px sans-serif;fill:#111111">面板 Pixel Array(放大,12 顆畫素)</text>`;
      s+=`<text x="${px}" y="62" style="font:700 11px sans-serif;fill:#111111">電壓沿資料線往下流到正在寫入的那列;閘極打開該列 TFT,把電壓灌進子畫素</text>`;
      s+=`<text x="${px}" y="80" class="brk">│=資料線　─=閘極線(亮=ON)　▢=TFT(綠=通)　Cst:青=充電 / 綠=鎖住保持　頂色條=極性　黃框=該列</text>`;
      s+=`</g>`;
      s+=`<g class="hot" data-blk="gate"><rect class="hotbg" x="${px-28}" y="${py}" width="22" height="${ph}" rx="4"/><rect x="${px-28}" y="${py}" width="22" height="${ph}" rx="4" fill="#E5E5E5" stroke="#B45309" stroke-width="1.2"/></g>`;
      s+=`<text x="${px-40}" y="${py+ph/2}" text-anchor="middle" transform="rotate(-90 ${px-40} ${py+ph/2})" style="font:700 11px sans-serif;fill:#B45309">Gate Driver(GOA)· 逐列開關 TFT</text>`;
      s+=`<g class="hot" data-blk="source"><rect class="hotbg" x="${px}" y="${py+ph+6}" width="${pw}" height="38" rx="6"/>`;
      const NCOF=6, cofW=pw/NCOF-10;
      for(let k=0;k<NCOF;k++){const cx=px+k*(pw/NCOF)+5;s+=`<rect x="${cx}" y="${py+ph+10}" width="${cofW}" height="30" rx="5" fill="#FFFFFF" stroke="#0E7490" stroke-width="1.2"/>`;}
      s+=`</g><text x="866" y="510" class="brk" fill="#0E7490">Source Driver (COF) ×6</text><text x="866" y="522" class="brk" fill="#6B6B6B">數位資料 → 類比電壓</text>`;
      s+=`<g class="hot" data-blk="scale"><rect class="hotbg" x="12" y="24" width="285" height="30" rx="7"/><rect x="12" y="24" width="285" height="30" rx="7" fill="#FFFFFF" stroke="#E5E5E5"/><text x="24" y="43" style="font:700 10px sans-serif;fill:#111111">2.07M 畫素 × 3 = 6.22M 子畫素 · 60fps · 為何要網格?</text></g>`;
      /* ===== signal board (LEFT): video processing ===== */
      {
        const bX=10,bY=70,bW=156,bH=400;
        s+=`<rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="14" fill="#FFFFFF" stroke="#A3A3A3" stroke-width="1.5"/>`;
        s+=`<text x="${bX+10}" y="${bY+16}" style="font:700 9px sans-serif;fill:#6B6B6B">訊號板 SIGNAL · 影像處理</text>`;
        const chip=(x,y,w,hh,fill,stk,tc,t1,t2,blk,big)=>{
          let g=blk?`<g class="hot" data-blk="${blk}"><rect class="hotbg" x="${x}" y="${y}" width="${w}" height="${hh}" rx="6"/>`:`<g>`;
          g+=`<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="${fill}" stroke="${stk}" stroke-width="1.3"/><circle cx="${x+6}" cy="${y+6}" r="1.5" fill="${stk}"/>`;
          g+=`<text x="${x+w/2}" y="${y+(t2?17:hh/2+4)}" text-anchor="middle" style="font:700 ${big?12:10}px sans-serif;fill:${tc}">${t1}</text>`;
          if(t2) g+=`<text x="${x+w/2}" y="${y+hh-8}" text-anchor="middle" class="brk" fill="${tc}">${t2}</text>`;
          return g+`</g>`;
        };
        s+=`<g class="hot" data-blk="iface"><rect class="hotbg" x="22" y="92" width="112" height="20" rx="3"/><rect x="25" y="95" width="106" height="14" rx="2" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.1"/>`;
        for(let i=0;i<12;i++) s+=`<line x1="${31+i*8.5}" y1="97" x2="${31+i*8.5}" y2="107" stroke="#6B6B6B" stroke-width="0.8" opacity="0.7"/>`;
        s+=`</g><text x="78" y="124" text-anchor="middle" class="brk" fill="#6B6B6B">eDP / V-by-One 輸入</text>`;
        s+= chip(28,134,116,42,"#FFFFFF","#0369A1","#6B6B6B","SoC","主晶片 · 出畫面","soc",false);
        s+= chip(28,194,116,52,"#FFFFFF","#6B6B6B","#6B6B6B","T-CON","時序 · Gamma · 重排","tcon",true);
        s+= chip(28,264,116,44,"#E5E5E5","#B45309","#111111","Level Shifter","時序 → VGH/VGL","ls",false);
        s+= chip(28,326,116,42,"#FFFFFF","#047857","#111111","EEPROM/Flash","設定 · gamma · VCOM","eeprom",false);
        s+=`<rect x="28" y="384" width="48" height="22" rx="3" fill="#FFFFFF" stroke="#A3A3A3"/><rect x="35" y="389" width="34" height="12" rx="2" fill="none" stroke="#6B6B6B" stroke-width="0.9"/><text x="84" y="399" class="brk" fill="#6B6B6B">OSC</text>`;
        s+=`<path d="M76,395 L156,395 L156,226 L144,226" fill="none" stroke="#0369A1" stroke-width="1" stroke-dasharray="3 3" opacity="0.75"/><path d="M147,223 L143,226 L147,229 Z" fill="#0369A1"/><text x="162" y="330" text-anchor="middle" transform="rotate(-90 162 330)" style="font:600 6px sans-serif;fill:#6B6B6B">時脈 CLK → T-CON</text>`;
        s+=`<path d="M28,347 L20,347 L20,220 L28,220" fill="none" stroke="#047857" stroke-width="0.9" stroke-dasharray="3 3" opacity="0.7"/>`;
        s+=`<text x="13" y="284" text-anchor="middle" transform="rotate(-90 13 284)" style="font:600 6px sans-serif;fill:#6B6B6B">設定 I2C</text>`;
        const wire=(d,c)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#111111" stroke-width="1.3" opacity="0.7" class="wpulse"/>`;
        const pin=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="2.8" fill="${c}" stroke="#FFFFFF" stroke-width="0.7"/>`;
        s+=`<g pointer-events="none">`;
        s+= wire("M86,111 L86,134","#6B6B6B")+`<path d="M83,131 L86,136 L89,131 Z" fill="#6B6B6B"/>`;
        s+= wire("M86,176 L86,194","#6B6B6B")+`<path d="M83,191 L86,196 L89,191 Z" fill="#6B6B6B"/>`;
        s+= wire("M86,246 L86,264","#6B6B6B")+`<path d="M83,261 L86,266 L89,261 Z" fill="#6B6B6B"/>`;
        s+= pin(86,111,"#6B6B6B");
        s+=`</g>`;
      }
      /* ===== power board (lower) : TWO ROWS — wired chips on top, passive parts below ===== */
      {
        const px=300,py=110,pw=560,ph=380,Cc=4,R=3,cw=pw/Cc,ch=ph/R,p=12,gap=6,sw=(cw-2*p-2*gap)/3;
        const dlX=(c,si)=>px+c*cw+p+si*(sw+gap)+sw/2, gateY=r=>py+r*ch+ch-16;
        const wire=(d,c)=>`<path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="1.3" opacity="0.55" class="wpulse"/>`;
        const pin=(x,y,c)=>`<circle cx="${x}" cy="${y}" r="3" fill="${c}" stroke="#FFFFFF" stroke-width="0.8"/>`;
        const pbX=270,pbY=640,pbW=594,pbH=118,busY=642;
        s+=`<rect x="${pbX}" y="${pbY}" width="${pbW}" height="${pbH}" rx="12" fill="#FFFFFF" stroke="#A3A3A3" stroke-width="1.6"/>`;
        s+=`<text x="${pbX+10}" y="${pbY+pbH-9}" style="font:700 8px sans-serif;fill:#111111">電源板 POWER · 面板供電</text>`;
        /* row tags */
        s+=`<text x="${pbX+pbW-8}" y="668" text-anchor="end" class="brk" fill="#C2410C">↑ 有接線(電壓 / 訊號輸出)</text>`;
        s+=`<text x="${pbX+pbW-8}" y="716" text-anchor="end" class="brk" fill="#A3A3A3">輔助(無對外接線)</text>`;
        /* ---- TOP ROW: chips that drive wires upward ---- */
        s+=`<g class="hot" data-blk="pmic"><rect class="hotbg" x="300" y="654" width="170" height="40" rx="7"/><rect x="300" y="654" width="170" height="40" rx="7" fill="#F4F4F4" stroke="#C2410C" stroke-width="1.3"/><text x="385" y="672" text-anchor="middle" style="font:700 11px sans-serif;fill:#111111">PMIC / DC-DC</text><text x="385" y="686" text-anchor="middle" class="brk" fill="#111111">AVDD · VGH · VGL · VCOM</text></g>`;
        s+=`<g class="hot" data-blk="gammaic"><rect class="hotbg" x="520" y="654" width="150" height="40" rx="7"/><rect x="520" y="654" width="150" height="40" rx="7" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.3"/><text x="595" y="672" text-anchor="middle" style="font:700 10px sans-serif;fill:#6B6B6B">Gamma IC</text><text x="595" y="686" text-anchor="middle" class="brk" fill="#6B6B6B">gamma 參考電壓</text></g>`;
        /* ---- BOTTOM ROW: passive / auxiliary (no outgoing wires) ---- */
        {
          const poX=300,poY=702,poW=176,poH=40;
          s+=`<rect x="${poX}" y="${poY}" width="${poW}" height="${poH}" rx="6" fill="#FFFFFF" stroke="#A3A3A3"/>`;
          s+=`<text x="${poX+6}" y="${poY+12}" style="font:600 7px sans-serif;fill:#111111">上電順序</text>`;
          const seq=["VDD","AVDD","VGL","VGH","VCOM","訊號"], n=seq.length, x0=poX+8, w=(poW-14)/n, yb=poY+poH-11, yt=poY+18;
          let d=`M${x0},${yb}`;
          for(let i=0;i<n;i++){ const yy=yb-(i/(n-1))*(yb-yt), xa=x0+i*w; d+=` L${xa},${yy} L${xa+w},${yy}`; }
          s+=`<path d="${d}" fill="none" stroke="#B45309" stroke-width="1.3"/>`;
          for(let i=0;i<n;i++){ const xa=x0+i*w; s+=`<text x="${xa+w/2}" y="${poY+poH-2}" text-anchor="middle" style="font:600 6px sans-serif;fill:#111111">${seq[i]}</text>`; }
        }
        s+=`<circle cx="540" cy="716" r="12" fill="#FFFFFF" stroke="#A3A3A3"/><line x1="540" y1="716" x2="548" y2="708" stroke="#111111" stroke-width="1.1"/><text x="540" y="740" text-anchor="middle" class="brk" fill="#6B6B6B">VCOM 微調</text>`;
        s+=`<g stroke="#A3A3A3" stroke-width="1">`;
        for(let i=0;i<5;i++){const cx=610+i*9;s+=`<line x1="${cx}" y1="710" x2="${cx}" y2="730"/><line x1="${cx+4}" y1="710" x2="${cx+4}" y2="730"/>`;}
        s+=`</g><text x="628" y="740" text-anchor="middle" class="brk" fill="#A3A3A3">去耦電容</text>`;
        s+=`<rect x="690" y="708" width="44" height="22" rx="5" fill="#FFFFFF" stroke="#E5E5E5"/>`;
        for(let i=0;i<3;i++) s+=`<circle cx="${700+i*12}" cy="719" r="2.2" fill="#A3A3A3"/>`;
        s+=`<text x="712" y="740" text-anchor="middle" class="brk" fill="#A3A3A3">測試點</text>`;
        /* ---- wiring: SIGNAL and POWER kept on separate buses ---- */
        const cofx=[346,440,533,626,719,812];
        s+=`<g pointer-events="none">`;
        s+=`<rect x="304" y="114" width="552" height="372" rx="3" fill="none" stroke="#6B6B6B" stroke-width="1" stroke-dasharray="2 6" opacity="0.4"/>`;
        /* ----- GATE side ----- */
        /* gate clocks: T-CON -> Level Shifter -> GOA */
        s+= wire("M144,284 L272,284","#6B6B6B")+`<path d="M269,281 L274,284 L269,287 Z" fill="#6B6B6B"/>`+pin(144,284,"#6B6B6B")+pin(272,284,"#6B6B6B");
        s+=`<text x="176" y="278" class="brk" fill="#6B6B6B">閘極時序 (LS→GOA)</text>`;
        /* VGH/VGL rails: PMIC -> gate region */
        s+= wire("M312,654 L283,654 L283,490","#fbbf24")+`<path d="M280,494 L283,489 L286,494 Z" fill="#fbbf24"/>`+pin(312,654,"#fbbf24")+pin(283,490,"#fbbf24");
        s+=`<text x="224" y="579" class="brk" fill="#B45309">VGH/VGL</text>`;
        /* ----- VCOM: PMIC -> whole panel ----- */
        s+= wire("M300,654 L300,648 L296,648 L296,492 L301,492 L301,490","#6B6B6B")+`<path d="M298,494 L301,489 L304,494 Z" fill="#6B6B6B"/>`+pin(300,654,"#6B6B6B")+pin(301,490,"#6B6B6B");
        s+=`<text x="230" y="561" class="brk" fill="#111111">VCOM</text>`;
        /* ----- DATA bus (signal): T-CON -> each COF ----- */
        s+= wire("M144,218 L172,218 L172,556 L300,556","#0E7490")+pin(144,218,"#0E7490")+pin(300,556,"#0E7490");
        s+= wire("M300,556 L824,556","#0E7490");
        cofx.forEach((xc)=>{ const x=xc-8; s+= wire(`M${x},556 L${x},530`,"#0E7490")+`<path d="M${x-3},534 L${x},529 L${x+3},534 Z" fill="#0E7490"/>`+pin(x,556,"#0E7490")+pin(x,530,"#0E7490"); });
        s+=`<text x="238" y="547" class="brk" fill="#111111">資料 →</text>`;
        /* ----- analog supply/ref bus: AVDD(PMIC) + Gamma(Gamma IC) -> each COF ----- */
        s+= wire("M340,600 L824,600","#6B6B6B");
        s+= wire("M356,654 L356,600","#6B6B6B")+pin(356,654,"#6B6B6B")+pin(356,600,"#6B6B6B");
        s+= wire("M595,654 L595,600","#6B6B6B")+pin(595,654,"#6B6B6B")+pin(595,600,"#6B6B6B");
        cofx.forEach((xc)=>{ const x=xc+8; s+= wire(`M${x},600 L${x},532`,"#6B6B6B")+`<path d="M${x-3},536 L${x},531 L${x+3},536 Z" fill="#6B6B6B"/>`+pin(x,600,"#6B6B6B")+pin(x,532,"#6B6B6B"); });
        s+=`<text x="238" y="595" class="brk" fill="#111111">電源 →</text>`;
        /* gate comb: GOA -> every row */
        for(let r=0;r<R;r++){const gy=gateY(r); s+=`<line x1="${px-6}" y1="${gy}" x2="${px+9}" y2="${gy}" stroke="#B45309" stroke-width="2" opacity="0.5"/><path d="M${px+7},${gy-3} L${px+12},${gy} L${px+7},${gy+3} Z" fill="#B45309" opacity="0.5"/>`;}
        /* source comb: COF -> every data line into the panel */
        for(let c=0;c<Cc;c++)for(let si=0;si<3;si++){const x=dlX(c,si); s+=`<g class="srcinj" style="animation-delay:${((c*3+si)%6)*0.12}s"><line x1="${x}" y1="500" x2="${x}" y2="489" stroke="#0E7490" stroke-width="2"/><path d="M${x-3},492 L${x},487 L${x+3},492 Z" fill="#0E7490"/></g>`;}
        s+=`</g>`;
        /* ---- FLOW LEGEND (bottom-left) ---- */
        s+=`<rect x="14" y="500" width="156" height="86" rx="6" fill="#FFFFFF" stroke="#E5E5E5" stroke-width="1"/><text x="20" y="513" style="font:700 8px sans-serif;fill:#111111">訊號 / 電源 流向</text>`;
        [["#0E7490","資料 (T-CON → COF)"],["#6B6B6B","閘極時序 (T-CON→LS→GOA)"],["#fbbf24","VGH/VGL (PMIC → 閘極)"],["#6B6B6B","AVDD (PMIC → COF)"],["#6B6B6B","Gamma (Gamma IC → COF)"],["#6B6B6B","VCOM (PMIC → 整面)"]].forEach(([col,t],i)=>{ const y=525+i*10; s+=`<line x1="20" y1="${y}" x2="32" y2="${y}" stroke="${col}" stroke-width="2.6"/><circle cx="32" cy="${y}" r="2.2" fill="${col}"/><text x="38" y="${y+2.5}" style="font:600 6.5px sans-serif;fill:#111111">${t}</text>`; });
        s+=`<g id="hflow" pointer-events="none"></g>`;
      }
      /* ===== light path (side cross-section of the SAME panel): backlight -> LC -> colour filter -> out -> image ===== */
      s+=`<text x="866" y="182" style="font:700 9px sans-serif;fill:#6B6B6B">出光路徑(側剖)→</text>`;
      {
        const cyt=212,cyb=344,cym=(cyt+cyb)/2;
        /* light travels left -> right; drawn first so the semi-transparent layers modulate it */
        for(let i=0;i<3;i++){const ry=cyt+20+i*44; s+=`<line class="lray" x1="888" y1="${ry}" x2="958" y2="${ry}" stroke="#111111" stroke-width="2.2" stroke-dasharray="5 5" opacity="0.9"/><path d="M953,${ry-3} L959,${ry} L953,${ry+3} Z" fill="#111111"/>`;}
        /* backlight = white light source (behind the panel) */
        s+=`<g class="hot" data-blk="light"><rect class="hotbg" x="864" y="${cyt-6}" width="26" height="${cyb-cyt+12}" rx="6"/><rect x="866" y="${cyt}" width="22" height="${cyb-cyt}" rx="4" fill="#111111" opacity="0.92"/><text x="877" y="${cym}" text-anchor="middle" transform="rotate(90 877 ${cym})" style="font:700 8px sans-serif;fill:#A3A3A3">背光 BLU(白光源)</text></g>`;
        /* liquid crystal = the light valve */
        s+=`<rect x="896" y="${cyt}" width="22" height="${cyb-cyt}" rx="4" fill="#6B6B6B" opacity="0.42"/><text x="907" y="${cym}" text-anchor="middle" transform="rotate(90 907 ${cym})" style="font:700 8px sans-serif;fill:#E5E5E5">液晶 LC(光閥)</text>`;
        /* RGB colour filter */
        ["#ff5a5a","#3ddc84","#5b8def"].forEach((c,i)=>{ s+=`<rect x="${926+i*7}" y="${cyt}" width="7" height="${cyb-cyt}" fill="${c}" opacity="0.6"/>`; });
        s+=`<text x="937" y="${cym}" text-anchor="middle" transform="rotate(90 937 ${cym})" style="font:700 8px sans-serif;fill:#ffffff">RGB 濾片</text>`;
        s+=`<text x="950" y="${cyt-2}" text-anchor="middle" class="brk" fill="#111111">出光 →</text>`;
      }
      /* the image you actually see (synced mini-screen) = light AFTER passing through the panel */
      s+=`<g class="hot" data-blk="image"><rect class="hotbg" x="958" y="238" width="100" height="116" rx="10"/>`;
      s+=`<rect x="960" y="244" width="94" height="72" rx="8" fill="#FFFFFF" stroke="#6B6B6B" stroke-width="1.6"/>`;
      s+=`<g id="himg"></g>`;
      s+=`<rect x="960" y="244" width="94" height="72" rx="8" fill="none" stroke="#6B6B6B" stroke-width="1.6"/>`;
      s+=`<text x="1007" y="332" text-anchor="middle" style="font:700 11px sans-serif;fill:#111111">你看到的畫面</text>`;
      s+=`<text x="1007" y="346" text-anchor="middle" class="brk" fill="#111111">背光穿過面板後成像 · 與掃描同步</text>`;
      s+=`</g>`;
      const bx=824,by=14,bw=222,bh=92;
      s+=`<line x1="${bx}" y1="${by+bh}" x2="${px+pw-40}" y2="${py}" stroke="#A3A3A3" stroke-width="1" stroke-dasharray="3 3"/>`;
      s+=`<g class="hot" data-blk="pixel"><rect class="hotbg" x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10"/><rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="10" fill="#FFFFFF" stroke="#E5E5E5"/>`;
      ["#ff5a5a","#3ddc84","#5b8def"].forEach((c,i)=>{s+=`<rect x="${bx+14+i*30}" y="${by+16}" width="24" height="44" rx="3" fill="${c}" opacity="0.85"/>`;});
      s+=`<text x="${bx+110}" y="${by+32}" style="font:700 11px sans-serif;fill:#111111">放大一顆畫素</text><text x="${bx+14}" y="${by+80}" class="brk">R·G·B 三條子畫素 → 點看光閥 / 混色</text></g>`;
      return `<svg viewBox="0 0 1060 770">${s}</svg>`;
    };
    let heroPhase=0, heroScan=0;
    function paintHero(){
      const box=document.getElementById("hpx"); if(!box) return;
      const px=300,py=110,pw=560,ph=380, C=4,R=3, cw=pw/C, ch=ph/R, p=12, gap=6, sw=(cw-2*p-2*gap)/3;
      const dlX=(c,si)=> px+c*cw+p+si*(sw+gap)+sw/2;
      const gateY=(r)=> py+r*ch+ch-16;
      const ar=heroScan, gy=gateY(ar);
      const vc=document.getElementById("vcliprect"); if(vc) vc.setAttribute("height", (ar+1)*ch);
      let s=`<rect x="${px}" y="${py+ar*ch}" width="${pw}" height="${ch}" fill="#111111" opacity="0.10"/><rect x="${px}" y="${py+ar*ch}" width="${pw}" height="${ch}" fill="none" stroke="#111111" stroke-width="2.4"/>`;
      s+=`<line x1="${px}" y1="${gy}" x2="${px+pw}" y2="${gy}" stroke="#111111" stroke-width="3.2" opacity="0.97"/><text x="${px+4}" y="${gy-6}" style="font:700 11px sans-serif;fill:#111111">閘極 ON · VGH</text>`;
      for(let r=0;r<R;r++)for(let c=0;c<C;c++)for(let si=0;si<3;si++){const x=dlX(c,si), gyr=gateY(r);s+=`<rect x="${x-3}" y="${gyr+8.5}" width="6" height="2.5" fill="${r===ar?'#0E7490':'#22c55e'}"/>`;}
      for(let c=0;c<C;c++)for(let si=0;si<3;si++){
        const x=dlX(c,si), cy=py+ar*ch, stTop=cy+12, stH=ch-12-34;
        s+=`<rect x="${x-sw/2}" y="${stTop}" width="${sw}" height="${stH}" rx="3" fill="#ffffff" opacity="0.20"/>`;
        s+=`<rect x="${x-5}" y="${gy-5}" width="10" height="10" rx="1.5" fill="#22c55e" stroke="#111111" stroke-width="1.2"/>`;
      }
      for(let r=0;r<R;r++)for(let c=0;c<C;c++){
        const pol=((r+c+heroPhase)&1), cx=px+c*cw, cy=py+r*ch, col=pol?"#3b6bd6":"#d6453b";
        s+=`<rect x="${cx+2}" y="${cy+2}" width="${cw-4}" height="7" rx="2" fill="${col}"/><text x="${cx+11}" y="${cy+8.5}" style="font:700 8px sans-serif;fill:#fff">${pol?"−":"+"}</text>`;
      }
      box.innerHTML=s;
      const ib=document.getElementById("himg");
      if(ib){
        const IW=20,IH=14, ix0=962,iy0=246, icw=90/IW, ich=68/IH, rev=Math.round(((ar+1)/R)*IH);
        let g="";
        for(let yy=0;yy<IH;yy++)for(let xx=0;xx<IW;xx++){ const cx=ix0+xx*icw, cy=iy0+yy*ich;
          if(yy<rev){const c=scImg(xx,yy,IW,IH); g+=`<rect x="${cx}" y="${cy}" width="${icw+0.6}" height="${ich+0.6}" fill="rgb(${c})"/>`;}
          else g+=`<rect x="${cx}" y="${cy}" width="${icw+0.6}" height="${ich+0.6}" fill="#FFFFFF"/>`;
        }
        if(rev<IH){const fy=iy0+rev*ich; g+=`<rect x="${ix0}" y="${fy-1}" width="90" height="2.4" fill="#111111" opacity="0.95"/>`;}
        ib.innerHTML=g;
      }
      const fb=document.getElementById("hflow");
      if(fb){ const gyf=gateY(ar); fb.innerHTML=`<line x1="${px-6}" y1="${gyf}" x2="${px+12}" y2="${gyf}" stroke="#111111" stroke-width="3"/><path d="M${px+9},${gyf-4} L${px+15},${gyf} L${px+9},${gyf+4} Z" fill="#111111"/><circle cx="${px-6}" cy="${gyf}" r="3" fill="#111111"/>`; }
    }
    (function(){
      const lib=document.getElementById("lib"), hub=document.getElementById("hub"), herobox=document.getElementById("herobox");
      if(!herobox||!lib||!hub) return;
      const tag=(innerId,blkId)=>{const el=document.getElementById(innerId); if(!el) return; const sec=el.closest(".sec")||el.closest(".detailwrap"); if(sec){sec.id=blkId; sec.classList.add("blk");}};
      tag("lvbox","blk-pixel"); tag("whygrid","blk-scale"); tag("detail","blk-stage");
      tag("gmbox","blk-gamma"); tag("invbox","blk-inversion"); tag("shbox","blk-hold");
      tag("btbox","blk-bits"); tag("rtbox","blk-response"); tag("spbox","blk-subpixel"); tag("scbox","blk-scan");
      herobox.innerHTML=heroDiagram(); paintHero(); let _hs=0; setInterval(()=>{ const a=document.querySelector(".app"); if(a&&a.classList.contains("spd-stop"))return; if(a&&a.classList.contains("spd-slow")&&(_hs++&1))return; heroScan=(heroScan+1)%3; if(heroScan===0) heroPhase^=1; paintHero(); },520);
      const HOT={ soc:{st:0,b:["blk-chain","blk-stage"],t:"SoC 主晶片 — 輸出原始畫面資料"}, tcon:{st:1,b:["blk-chain","blk-stage","blk-gamma"],t:"T-CON — 時序 / Gamma / 重排"}, ls:{st:2,b:["blk-chain","blk-stage"],t:"Level Shifter — 低壓邏輯 ↔ 高壓(VGH/VGL)"}, source:{st:2,b:["blk-chain","blk-stage","blk-inversion","blk-bits"],t:"Source Driver(COF)— 資料 → 灰階電壓"}, gate:{st:2,b:["blk-chain","blk-stage"],t:"Gate Driver(GOA)— 逐列開關 TFT"}, panel:{st:3,b:["blk-chain","blk-stage","blk-hold","blk-subpixel","blk-response"],t:"面板 Pixel Array — 掃描 / 保持 / 子畫素 / 反應"}, light:{st:4,b:["blk-chain","blk-stage","blk-blu","blk-trans"],t:"背光 BLU — 白光源與光學膜"}, image:{st:5,b:["blk-chain","blk-stage","blk-scan"],t:"畫面 — 逐列掃描成像"}, pixel:{b:["blk-pixel","blk-polar"],t:"放大一顆畫素 — 光閥與 RGB 混色"}, scale:{b:["blk-scale"],t:"一片螢幕 = 幾百萬顆 · 為何要網格"}, pmic:{b:["blk-pmic","blk-kickback"],t:"PMIC / 電源 — 產生 AVDD · VGH · VGL · VCOM"}, gammaic:{b:["blk-gamma"],t:"Gamma 參考 — 送 gamma 電壓給 Source DAC"}, eeprom:{b:["blk-eeprom"],t:"EEPROM / Flash — 儲存 gamma · timing · VCOM · 上電順序"}, iface:{b:["blk-iface"],t:"輸入介面 — eDP / V-by-One / LVDS"}, polar:{b:["blk-polar"],t:"偏光板 × 液晶 — 光閥的真正原理"}, modes:{b:["blk-modes"],t:"TN / VA / IPS — 三種液晶排列"}, trans:{b:["blk-trans"],t:"穿透率與開口率 — 光損耗到哪去了"}, color:{b:["blk-color"],t:"色彩與色域 — RGB 能調出哪些顏色"}, oled:{b:["blk-oled"],t:"LCD vs OLED — 兩種點亮方式"}, tft:{b:["blk-tft","blk-oled"],t:"TFT 背板 — a-Si / LTPS / Oxide"}, cof:{b:["blk-cof"],t:"COF / COG — 軟板、bonding、pin map、走線"}, timing:{b:["blk-timing","blk-eeprom"],t:"Timing 參數 — porch / sync / pixel clock"}, defects:{b:["blk-defects"],t:"壞點與線缺陷 — 從症狀反推哪裡壞"}, kickback:{b:["blk-kickback"],t:"Kickback 與 VCOM — flicker 的來源"}, gloss:{b:["blk-gloss"],t:"名詞速查"}, facts:{b:["blk-facts"],t:"小知識"} };
      function show(blks,title){
        Array.from(hub.children).forEach(ch=>{ if(ch.classList&&ch.classList.contains("blk")) lib.appendChild(ch); });
        hub.innerHTML="";
        if(title){ const t=document.createElement("div"); t.className="hubtitle"; t.textContent=title; hub.appendChild(t); }
        blks.forEach(id=>{ const n=document.getElementById(id); if(n) hub.appendChild(n); });
      }
      function openSection(key,scroll){
        const hh=HOT[key]; if(!hh) return;
        const g=herobox.querySelector('[data-blk="'+key+'"]');
        herobox.querySelectorAll(".hot").forEach(x=>x.classList.toggle("act",x===g));
        const tb=document.querySelector('#toc [data-go="'+key+'"]');
        document.querySelectorAll('#toc .tocbtn').forEach(x=>x.classList.toggle("act",x===tb));
        if(hh.st!=null) select(hh.st);
        show(hh.b,hh.t);
        if(scroll) hub.scrollIntoView({behavior:"smooth",block:"nearest"});
      }
      herobox.addEventListener("click",e=>{ const g=e.target.closest("[data-blk]"); if(g&&HOT[g.getAttribute("data-blk")]) openSection(g.getAttribute("data-blk"),true); });
      const tocEl=document.getElementById("toc");
      if(tocEl) tocEl.addEventListener("click",e=>{ const b=e.target.closest("[data-go]"); if(b) openSection(b.getAttribute("data-go"),true); });
      const TOPIC_HASH={e01:"tft",e02:"source",e03:"iface",e04:"timing",e05:"cof"};
      const hk=TOPIC_HASH[location.hash.slice(1).toLowerCase()];
      openSection(hk||"pixel",!!hk);
    })();
    requestAnimationFrame(()=>select(0));
  })();
  return cleanup
}
