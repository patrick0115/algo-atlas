// @ts-nocheck —— 原講義 public/semi/J-swe.html 的互動程式照搬,不改邏輯。
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
    const textW = s => [...s].reduce((a, c) => a + (c.charCodeAt(0) > 255 ? 12.5 : 7.3), 0);

    /* ===== Git graph ===== */
    const P = { A: [70, 60], B: [160, 60], C: [250, 60], D: [250, 130], E: [340, 130], F: [430, 130] };
    const BASE_E = [['A', 'B'], ['B', 'C'], ['B', 'D'], ['D', 'E'], ['E', 'F']];
    const OLD3 = { D: 'old', E: 'old', F: 'old' };

    const MODES = {
      merge: [
        { t: '起點：兩條分支已經分岔', refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['$ git switch main', "Switched to branch 'main'", '', '$ git log --oneline --graph --all', '* F (feature)', '* E', '* D', '| * C (HEAD -> main)', '|/', '* B', '* A'],
          d: 'feature 從 B 分出去做了 D、E、F；同時 main 也多了 C。兩邊各有對方沒有的 commit（diverged），所以不能只移動指標（fast-forward），一定要產生 merge commit。' },
        { t: '① 先找共同祖先（merge base）', nodes: { B: 'hl' }, notes: [[160, 28, 'merge base']], refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['$ git merge feature', '# 1. merge-base(main, feature)', '#    = B', '# 2. 比對 B->C 與 B->F 的差異', '# 3. 兩邊改不同地方：自動合', '#    改到同一段：衝突'],
          d: 'merge 是 three-way merge：拿 merge base（B）、我方（C）、對方（F）三份來比。B→C 改了什麼、B→F 改了什麼，兩邊沒有重疊就自動合併。' },
        { t: '② 如果兩邊改到同一段：衝突', nodes: { B: 'hl', C: 'hl', F: 'hl' }, refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['$ git merge feature', 'Auto-merging Panel.cs', 'CONFLICT (content): Merge', '  conflict in Panel.cs', 'Automatic merge failed; fix', '  conflicts and then commit', '  the result.', '', '# 改好: git add Panel.cs', '#       git commit', '# 放棄: git merge --abort'],
          d: '衝突只會發生一次（整個 merge 一起解），檔案裡出現 <<<<<<< 我方 ======= 對方 >>>>>>> 標記。改好後 add 再 commit；想放棄就 git merge --abort，回到 merge 之前的狀態。' },
        { t: '③ 產生 merge commit M', add: [['M', 520, 60, 'new']], edges: [['C', 'M'], ['F', 'M']], refs: [['main', 'M', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ["Merge made by the 'ort' strategy.", '', '$ git log --oneline --graph', '*   M (HEAD -> main) Merge', '|\\', '| * F (feature)', '| * E', '| * D', '* | C', '|/', '* B'],
          d: 'M 有兩個 parent：第一個是 C（合併時所在的 main）、第二個是 F。D、E、F 的 hash 完全沒變，所以就算 feature 已經 push 給別人也很安全。代價是歷史多一條交叉線。日後要整個撤銷這次合併：git revert -m 1 M。' },
      ],
      rebase: [
        { t: '起點：你在 feature 分支上', refs: [['main', 'C', 'up', 0], ['feature', 'F', 'down', 1]],
          cmd: ['$ git switch feature', "Switched to branch 'feature'"],
          d: '同樣的分岔。這次不在 main 上合併，而是把 feature 「搬家」：讓 D、E、F 看起來像是從 C 之後才開始做的。' },
        { t: '① 找 merge base，把 D、E、F 先拿下來', nodes: Object.assign({ B: 'hl' }, OLD3), notes: [[160, 28, 'merge base']], refs: [['main', 'C', 'up', 0], ['feature', 'F', 'down', 1]],
          cmd: ['$ git rebase main', '# merge-base = B', '# 把 D、E、F 各存成一份 patch', '# HEAD 暫時移到 C'],
          d: 'rebase 把 B 之後你自己的 commit（D、E、F）各自算成一份「改了什麼」，然後把 HEAD 移到新基底 C，準備一顆一顆重新套上去。' },
        { t: '② 重播 D → D′（衝突在這裡逐顆發生）', nodes: OLD3, add: [["D'", 340, 60, 'new']], edges: [['C', "D'"]], refs: [['main', 'C', 'up', 0], ['feature', 'F', 'down', 0]],
          cmd: ["# 把 D 的改變套到 C 後面 -> D'", '', '# 若這顆衝突:', 'CONFLICT (content): Merge', '  conflict in Panel.cs', '# 改好: git add Panel.cs', '#       git rebase --continue', '# 放棄: git rebase --abort'],
          d: 'D′ 的內容改變跟 D 一樣，但 parent 從 B 變成 C，所以 hash 全新。衝突是「每顆各自發生」，可能要解好幾次。注意：rebase 時 ours 是 main 那側（已重播的部分），theirs 才是你自己的 commit，跟 merge 相反。' },
        { t: '③ E′、F′ 也重播完，feature 指標搬家', nodes: OLD3, add: [["D'", 340, 60, 'new'], ["E'", 430, 60, 'new'], ["F'", 520, 60, 'new']], edges: [['C', "D'"], ["D'", "E'"], ["E'", "F'"]],
          refs: [['main', 'C', 'up', 0], ['feature', "F'", 'down', 1]], notes: [[340, 196, '舊的 D、E、F 沒有分支指著，只剩 reflog 找得到']],
          cmd: ['Successfully rebased and updated', '  refs/heads/feature.', '', '$ git log --oneline', "F' (HEAD -> feature)", "E'", "D'", 'C (main)', 'B', 'A'],
          d: '舊的 D、E、F 並沒有被刪掉，只是不再有分支指著它們（不可到達）。rebase 搞砸了，可以用 git reflog 找回舊的 F，把分支指回去。' },
        { t: '④ 回到 main：只要快轉（fast-forward）', nodes: OLD3, add: [["D'", 340, 60, 'new'], ["E'", 430, 60, 'new'], ["F'", 520, 60, 'new']], edges: [['C', "D'"], ["D'", "E'"], ["E'", "F'"]],
          refs: [['main', "F'", 'up', 1], ['feature', "F'", 'down', 0]], notes: [[340, 196, '舊的 D、E、F 沒有分支指著，只剩 reflog 找得到']],
          cmd: ['$ git switch main', '$ git merge feature', "Updating C..F'", 'Fast-forward', '', '# 一直線，沒有 merge commit'],
          d: '歷史變成一條直線，很好讀。黃金規則：如果 D、E、F 早就 push 給同事，他們手上還是舊的那三顆，下次 pull 會同時出現舊的與新的，變成重複 commit 與一堆衝突。所以只 rebase 只有你自己在用的分支。' },
      ],
      cherry: [
        { t: '起點：只想要 feature 上的 E', nodes: { E: 'hl' }, refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]], notes: [[340, 196, 'E 是 bug fix；D、F 是還沒做完的功能']],
          cmd: ['$ git switch main', '$ git log --oneline feature', 'F wip: 新報表（未完成）', 'E fix: 修正逾時判斷', 'D wip: 新報表（未完成）'],
          d: '典型場景是 hotfix 回填：feature（或 develop）上修好的 bug，main 現在就要，但 D、F 還不能上線。merge 會把 D、E、F 全帶進來，所以只能挑一顆。' },
        { t: '① 算出 E「改了什麼」', nodes: { E: 'hl' }, refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]], notes: [[295, 114, 'diff']],
          cmd: ['$ git cherry-pick -x E', '# 取 diff(D -> E)', '# 套到目前的 C 上面'],
          d: 'cherry-pick 搬的不是 E 的整份快照，而是「E 相對於它的 parent D 改了什麼」。如果 E 改的那幾行在 main 上長得不一樣（例如那段是 D 才加進來的），就會衝突。' },
        { t: '② 在 main 上產生新的 E′', nodes: { E: 'hl' }, add: [["E'", 340, 60, 'new']], edges: [['C', "E'"]], refs: [['main', "E'", 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ["[main E'] fix: 修正逾時判斷", ' 1 file changed', '', '$ git log -1 --format=%B', 'fix: 修正逾時判斷', '', '(cherry picked from commit E)'],
          d: 'E′ 的改變等同 E，但 parent 不同、hash 不同；feature 完全沒動。-x 會在訊息最後加上來源（只有沒衝突時才自動加），日後追蹤「這個修正從哪來」很有用。之後 feature 整條合回 main 時，同一個改變會出現兩次；通常 git 能自動合掉，但那段之後又被改過就可能衝突。' },
        { t: '③ 對照：stash／merge／cherry-pick／revert 怎麼選', nodes: { E: 'hl' }, add: [["E'", 340, 60, 'new']], edges: [['C', "E'"]], refs: [['main', "E'", 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['# 改了還沒 commit，先收起來', '$ git stash', '', '# 已 commit，整串都要', '$ git merge feature', '', '# 已 commit，只要其中一顆', '$ git cherry-pick -x E', '', '# 撤銷已經 push 的 commit', '$ git revert E'],
          d: '判斷法兩步：①要搬的東西 commit 了沒？沒有 → stash。②要搬幾顆？整串 → merge／rebase；一顆 → cherry-pick。要撤銷已共享的 commit 用 revert（新增反向 commit），不要用 reset 改寫歷史。' },
      ],
      squash: [
        { t: '起點：main 上 HEAD 在 C', refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['$ git switch main'],
          d: '很多團隊在 PR 合併時選「Squash and merge」：feature 上零碎的 D、E、F，在 main 上只留一顆。' },
        { t: '① 把 D＋E＋F 的總改變放進暫存區', nodes: { D: 'hl', E: 'hl', F: 'hl' }, refs: [['main', 'C', 'up', 1], ['feature', 'F', 'down', 0]],
          cmd: ['$ git merge --squash feature', 'Squash commit -- not updating', '  HEAD', 'Automatic merge went well;', '  stopped before committing', '  as requested'],
          d: '--squash 照常做三方合併，把結果放進工作目錄與暫存區，但不 commit、不移動 HEAD，也不記錄「這是一次合併」。' },
        { t: '② commit 成單一個 S', add: [['S', 340, 60, 'new']], edges: [['C', 'S']], refs: [['main', 'S', 'up', 1], ['feature', 'F', 'down', 0]], notes: [[400, 196, 'S 跟 F 之間沒有連線：git 不知道 feature 已經併入']],
          cmd: ['$ git commit -m "feat: 新報表"', '', '# S 只有一個 parent (C)', '$ git branch -d feature', "error: The branch 'feature'", '  is not fully merged.', '$ git branch -D feature'],
          d: '好處：main 上一個功能就是一顆 commit，要撤銷整個功能 revert 一顆就好。壞處：細部歷史不見了，bisect 的粒度變粗；而且 git 認為 feature 沒合過（-d 會拒絕刪除），若繼續在 feature 上開發再 squash 一次，會反覆衝突。慣例是 squash 後就刪掉該分支。' },
      ],
    };

    const g = { m: 'merge', i: 0 };

    function drawGit() {
      const svg = $('gsvg');
      svg.innerHTML = '';
      const st = MODES[g.m][g.i];
      const nodes = {};
      Object.keys(P).forEach(id => { nodes[id] = { id, x: P[id][0], y: P[id][1], c: (st.nodes || {})[id] || '' }; });
      (st.add || []).forEach(([id, x, y, c]) => { nodes[id] = { id, x, y, c }; });
      const edges = BASE_E.concat(st.edges || []);
      // 連線
      edges.forEach(([a, b]) => {
        const A = nodes[a], B = nodes[b];
        const old = A.c === 'old' || B.c === 'old';
        svg.appendChild(el('line', { x1: A.x, y1: A.y, x2: B.x, y2: B.y, class: old ? 'ln dash' : (B.c === 'new' ? 'ln-accent' : 'ln-fg') }));
      });
      // 節點
      Object.values(nodes).forEach(n => {
        const cls = n.c === 'new' ? 'bx-accent' : n.c === 'hl' ? 'fill-fg' : n.c === 'old' ? 'bx dash' : 'bx';
        svg.appendChild(el('circle', { cx: n.x, cy: n.y, r: 15, class: cls }));
        svg.appendChild(el('text', { x: n.x, y: n.y + 5, 'text-anchor': 'middle', class: n.c === 'hl' ? 'on-dark' : n.c === 'old' ? 't-muted' : '' }, n.id));
      });
      // 分支指標
      (st.refs || []).forEach(([name, at, pos, head]) => {
        const n = nodes[at];
        const label = head ? 'HEAD → ' + name : name;
        const w = textW(label) + 14, h = 20;
        const y = pos === 'up' ? n.y - 15 - 8 - h : n.y + 15 + 8;
        svg.appendChild(el('line', { x1: n.x, y1: pos === 'up' ? y + h : y, x2: n.x, y2: pos === 'up' ? n.y - 15 : n.y + 15, class: 'ln' }));
        svg.appendChild(el('rect', { x: n.x - w / 2, y, width: w, height: h, rx: 4, class: head ? 'bx-accent' : 'bx' }));
        svg.appendChild(el('text', { x: n.x, y: y + 14, 'text-anchor': 'middle', class: 'mono' }, label));
      });
      (st.notes || []).forEach(([x, y, s]) => svg.appendChild(el('text', { x, y, 'text-anchor': 'middle', class: 't-small' }, s)));
      // terminal
      svg.appendChild(el('rect', { x: 596, y: 10, width: 296, height: 240, rx: 6, class: 'bx' }));
      svg.appendChild(el('text', { x: 610, y: 30, class: 't-small' }, 'terminal'));
      svg.appendChild(el('line', { x1: 596, y1: 38, x2: 892, y2: 38, class: 'ln-soft' }));
      st.cmd.forEach((line, k) => {
        const cls = line.startsWith('#') ? 'mono t-muted' : 'mono';
        const t = el('text', { x: 608, y: 56 + k * 16.5, class: cls }, line);
        if (line.startsWith('$')) t.setAttribute('font-weight', '700');
        svg.appendChild(t);
      });
      $('gTitle').textContent = st.t;
      $('gDesc').textContent = st.d;
      $('gphase').textContent = `第 ${g.i + 1} / ${MODES[g.m].length} 步`;
      $('gprev').disabled = g.i === 0;
      $('gnext').disabled = g.i === MODES[g.m].length - 1;
    }

    document.querySelectorAll('#gmode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#gmode button').forEach(x => x.classList.toggle('on', x === b));
      g.m = b.dataset.m; g.i = 0; drawGit();
    }));
    $('gprev').addEventListener('click', () => { if (g.i > 0) { g.i--; drawGit(); } });
    $('gnext').addEventListener('click', () => { if (g.i < MODES[g.m].length - 1) { g.i++; drawGit(); } });
    drawGit();

    /* ===== CI/CD pipeline ===== */
    const ST = [
      { n: 'commit／PR', s: 'push 觸發',
        what: '開發者 push 或開 PR，CI 伺服器偵測到變更、從乾淨環境 clone 原始碼，先跑最快、最便宜的檢查：格式、靜態分析、commit 訊息規則。',
        fail: '連 build 都不會跑，直接回報給提交的人。對策：能在本機先擋的（格式、分析器警告），用 pre-commit hook 或 IDE 設定先擋，越前面擋越便宜。' },
      { n: 'build', s: '還原套件＋編譯',
        what: '還原 NuGet 套件、用固定版本的 SDK 編譯 Release；常見做法是把警告當錯誤（TreatWarningsAsErrors），並在 CI 上開 ContinuousIntegrationBuild。',
        fail: '這一站最常見的就是「我電腦可以」：新檔案沒進版控、舊式 csproj 沒加 Compile Include、只有本機裝了某個套件、路徑寫死。對策：一律從乾淨 clone build，鎖定套件與 SDK 版本。' },
      { n: 'test', s: 'unit → integration',
        what: '先跑快的 unit test，過了才跑慢的 integration／golden file 回歸；順便收集覆蓋率報告。',
        fail: '不產出可發佈的產物，退回給提交者。若是 flaky test，要隔離出來修，而不是按「重跑」直到變綠，否則大家很快就不再相信紅燈。' },
      { n: 'package', s: '蓋版號＋打包',
        what: '把版號（含 commit hash、build 時間）寫進產物，打包成 zip 或安裝檔、必要時簽章，存成 artifact。之後每一站都用這同一份，不再重新編譯（build once, deploy many）。',
        fail: '常見是版號沒遞增（跟上一版撞號）、簽章憑證過期、漏打包設定檔或相依 DLL。對策：版號由單一來源自動產生；打包後自動檢查清單（檔案、版號、簽章）。' },
      { n: 'deploy', s: '發佈＋通知',
        what: '把同一份 artifact 推到測試環境、確認後再推正式；在該 commit 打 tag、產生 release note、通知使用者。人按下發佈是 continuous delivery，自動上線是 continuous deployment。',
        fail: '新版有問題：退回上一份 artifact（所以舊版產物要保留），或用 feature flag 先把新功能關掉。事後補一個能重現的測試，讓同樣的問題下次在 test 站就被擋下。' },
    ];
    const p = { i: 1, f: 0 };

    function drawPipe() {
      const svg = $('psvg');
      svg.innerHTML = '';
      const defs = el('defs', {});
      const mk = el('marker', { id: 'ahP', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' });
      mk.appendChild(el('path', { d: 'M0,0 L10,5 L0,10 z', class: 'arrow-head' }));
      defs.appendChild(mk); svg.appendChild(defs);
      ST.forEach((s, k) => {
        const x = 10 + k * 180, y = 20, w = 150, h = 66;
        const failed = p.f && k === p.i, skipped = p.f && k > p.i;
        const cls = failed ? 'bx-accent' : skipped ? 'bx dash' : (k === p.i ? 'bx-accent' : 'bx');
        svg.appendChild(el('rect', { x, y, width: w, height: h, rx: 6, class: cls, 'stroke-width': failed ? 3 : (k === p.i ? 1.5 : 1) }));
        svg.appendChild(el('text', { x: x + 12, y: y + 26, class: skipped ? 't-strong t-muted' : 't-strong' }, (k + 1) + ' ' + s.n));
        svg.appendChild(el('text', { x: x + 12, y: y + 50, class: 't-small' }, s.s));
        const status = failed ? '失敗：停在這裡' : skipped ? '不會執行' : (p.f && k < p.i) || (!p.f && k <= p.i) ? '通過' : '等待中';
        svg.appendChild(el('text', { x: x + 12, y: 112, class: failed ? 't-accent' : 't-small' }, status));
        if (k < ST.length - 1) svg.appendChild(el('line', { x1: x + w + 2, y1: y + h / 2, x2: x + 178, y2: y + h / 2, class: skipped || failed ? 'ln dash' : 'arrow', 'marker-end': 'url(#ahP)' }));
      });
      svg.appendChild(el('text', { x: 10, y: 140, class: 't-small' }, p.f ? '任何一站失敗，後面全部不跑，也不會產生可發佈的產物' : '每一站都通過，同一份產物才會往下一站走'));
      const s = ST[p.i];
      $('pTitle').textContent = `${p.i + 1} ${s.n}`;
      $('pWhat').textContent = '做什麼：' + s.what;
      $('pFail').textContent = '失敗時：' + s.fail;
      document.querySelectorAll('#pSteps button').forEach((b, k) => b.classList.toggle('on', k === p.i));
    }

    const ul = $('pSteps');
    ST.forEach((s, k) => {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.innerHTML = `<span class="no">${k + 1}</span>${s.n}`;
      b.addEventListener('click', () => { p.i = k; drawPipe(); });
      li.appendChild(b); ul.appendChild(li);
    });
    document.querySelectorAll('#pMode button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#pMode button').forEach(x => x.classList.toggle('on', x === b));
      p.f = +b.dataset.f; drawPipe();
    }));
    drawPipe();
  })();
  return cleanup
}
