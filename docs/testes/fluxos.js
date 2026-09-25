// Uso: a partir da pasta docs/testes do repositório do app →  npm install playwright  &&  npx playwright install chromium  &&  node fluxos.js
// (opcional) CHROMIUM_PATH=/caminho/do/chromium para usar um Chromium já instalado.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const os = require('os');
const HTML = process.env.HTML || path.resolve(__dirname, '../../www/index.html');
const OUT = path.join(os.tmpdir(), 'cronofoco_teste.html');
fs.writeFileSync(OUT,'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(HTML,'utf8')+'</body></html>');
const LAUNCH = process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {};
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails=0; const check=(n,c,x)=>{console.log((c?'OK   ':'FALHA')+' '+n+(x?'  '+x:'')); if(!c) fails++;};
const VASS='8fde074ca42ca9b1e8ebc9f64057ad791d37c41b5729d5461a42c22b63293d3d', BROOM='cd4d02bd5776d2a4d3e879557fdc69771d1a2b21044d6906b34bf18b5c8fbd23';
async function newPage(b, hash, hist){
  const ctx = await b.newContext({viewport:{width:400,height:860}}); const p = await ctx.newPage(); p.errs=[]; p.on('pageerror',e=>p.errs.push(e.message));
  await p.addInitScript(([hash,hist])=>{ if(sessionStorage.getItem('x')) return; sessionStorage.setItem('x','1');
    localStorage.setItem('cronofoco_license_v1', JSON.stringify({n:'Leandro', h:hash}));
    if(hist) localStorage.setItem('cronofoco_history_v1', JSON.stringify(hist)); }, [hash,hist]);
  await p.goto('file://'+OUT); await wait(300); return p;
}
const clickText = (p, sel, txt) => p.evaluate(([sel,txt])=>{ const e=Array.from(document.querySelectorAll(sel)).find(x=>x.textContent.trim().includes(txt)); if(!e) return false; e.click(); return true; }, [sel,txt]);
const openCard = (p, title) => p.evaluate((t)=>{ const c=Array.from(document.querySelectorAll('.card')).find(c=>c.querySelector('h3') && c.querySelector('h3').textContent===t); if(!c) return false; c.querySelector('button').click(); return true; }, title);
const hist = () => p=>p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')||'{}'));
(async()=>{
  const b = await chromium.launch(LAUNCH);
  // ---------- usuário comum com 3 sessões ----------
  let p = await newPage(b, BROOM, {calc:[1,2,3].map(i=>({ts:Date.now()-i*1000,correct:1,total:1,accuracy:100,elapsedMs:1000}))});
  let home = await p.evaluate(()=>({help:(document.querySelector('.unlock-help')||{}).textContent||'', locked: document.querySelectorAll('.card.locked').length, lockedTxt:(document.querySelector('.card.locked p')||{}).textContent}));
  check('Início explica o próximo desbloqueio', /Próximo desbloqueio: Desafio das Cores, Leitura e Compreensão e Fluência Verbal — faltam 2 sessões/.test(home.help), home.help.slice(0,120));
  check('explica como desbloquear', /Como desbloquear/.test(home.help) && /passatempos não contam/.test(home.help));
  check('card bloqueado diz quantas faltam', /Libera com 5 sessões concluídas. Faltam 2 sessões/.test(home.lockedTxt), home.lockedTxt);
  await p.screenshot({path:path.join(os.tmpdir(),'v41_home.png'), fullPage:false});
  await p.close();
  // ---------- VASSOURA ----------
  p = await newPage(b, VASS, null);
  home = await p.evaluate(()=>({help:(document.querySelector('.unlock-help')||{}).textContent||'', locked: document.querySelectorAll('.card.locked').length, track:document.querySelector('.track-label').textContent, banner: !!document.querySelector('.unlock-banner')}));
  check('VASSOURA libera tudo', home.locked===0 && /14 de 14/.test(home.track) && /Modo revisão/.test(home.help), home.track);
  check('VASSOURA sem aviso de "novo exercício"', !home.banner);
  const earned = await p.evaluate(()=>localStorage.getItem('cronofoco_unlock_earned_v1'));
  check('VASSOURA não grava desbloqueios conquistados', earned===null, String(earned));
  // botões Voltar ao início em todas as telas de configuração
  const titles = await p.evaluate(()=>Array.from(document.querySelectorAll('.grid-cards .card h3')).map(h=>h.textContent));
  let backOk=0;
  for(const t of titles){
    await openCard(p,t); await wait(150);
    const has = await clickText(p,'button','← Voltar ao início'); await wait(150);
    const atHome = await p.evaluate(()=>!!document.querySelector('.track-bar'));
    if(has && atHome) backOk++; else console.log('   sem voltar: '+t);
  }
  check('todas as telas de configuração têm "← Voltar ao início" ('+backOk+'/'+titles.length+')', backOk===titles.length);
  // Desistir e voltar no cálculo
  await openCard(p,'Cálculo Mental'); await wait(100); await clickText(p,'button','Começar'); await wait(200);
  const calcBtns = await p.evaluate(()=>Array.from(document.querySelectorAll('.actions-row button')).map(b=>b.textContent));
  check('Cálculo: "Desistir e voltar"', calcBtns.includes('Desistir e voltar'), calcBtns.join('|'));
  const qs=[]; for(let i=0;i<12;i++){ const q=await p.evaluate(()=>document.querySelector('.calc-expr').textContent); qs.push(q); await p.keyboard.type('1'); await p.keyboard.press('Enter'); await wait(400); }
  console.log('   contas vistas: '+qs.join('  '));
  await clickText(p,'button','Desistir e voltar'); await wait(150);
  check('Desistir volta para a configuração', await p.evaluate(()=>!!Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Começar')));
  await clickText(p,'button','← Voltar ao início'); await wait(150);
  // ---------- Memorização ----------
  await openCard(p,'Memorização de Palavras'); await wait(100);
  const memoOpts = await p.evaluate(()=>Array.from(document.querySelectorAll('.duration-picker')[1].querySelectorAll('button')).map(b=>b.textContent));
  check('Memorização tem 3, 5 e 10 min', ['3 min','5 min','10 min'].every(x=>memoOpts.includes(x)), memoOpts.join(','));
  await clickText(p,'.duration-picker button','10 palavras'); await p.check('#memoHelpToggle'); await clickText(p,'button','Começar'); await wait(300);
  const story = await p.evaluate(()=>{ const lis=Array.from(document.querySelectorAll('.story-list li')); const words=Array.from(document.querySelectorAll('.word-tile')).map(w=>w.textContent.toUpperCase()); const txt=lis.map(l=>l.innerHTML).join(' '); return {n:lis.length, each: words.map(w=>(txt.split('<b>'+w+'</b>').length-1))}; });
  check('história em 5 cenas curtas, cada palavra 1 vez', story.n===5 && story.each.every(c=>c===1), story.n+' cenas / '+story.each.join(','));
  await p.screenshot({path:path.join(os.tmpdir(),'v41_memo.png')});
  await wait(2200);
  await clickText(p,'button','Já memorizei'); await wait(200);
  check('Já memorizei vai para as respostas', await p.evaluate(()=>!!document.querySelector('.recall-field')));
  await p.fill('#recall-0','xyz'); await clickText(p,'button','Concluir'); await wait(200);
  let h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).memo.slice(-1)[0]);
  check('histórico guarda o tempo real (sobrescreve o escolhido)', h.duration>=2 && h.duration<=4 && h.plannedDuration===30 && h.endedEarly===true, JSON.stringify({d:h.duration,p:h.plannedDuration}));
  const memoMetric = await p.evaluate(()=>Array.from(document.querySelectorAll('.result-metrics .m')).map(m=>m.textContent).join(' | '));
  check('resultado mostra "(de 30s)"', /de 30s/.test(memoMetric), memoMetric);
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  // ---------- Sequência de números ----------
  await openCard(p,'Sequência de Números'); await wait(100);
  await clickText(p,'.duration-picker button','5 dígitos'); await clickText(p,'.duration-picker button','0,5 s'); 
  await clickText(p,'button','Começar'); await wait(50);
  for(let lvl=3; lvl<=5; lvl++){
    const seq=[]; let last=''; const t0=Date.now();
    while(Date.now()-t0 < 8000){ const st = await p.evaluate(()=>({d:(document.querySelector('.span-digit')||{}).textContent, inp:!!document.querySelector('.numpad')})); if(st.inp) break; if(st.d && st.d!==last){ seq.push(st.d); } last=st.d||''; await wait(40); }
    const inputReady = await p.evaluate(()=>!!document.querySelector('.numpad'));
    if(!inputReady || seq.length!==lvl){ console.log('   leitura da sequência falhou', seq); break; }
    for(const d of seq){ await p.evaluate((d)=>Array.from(document.querySelectorAll('.numpad button')).find(b=>b.textContent===d).click(), d); }
    await p.evaluate(()=>Array.from(document.querySelectorAll('.numpad button')).find(b=>b.textContent==='Confirmar').click()); await wait(250);
  }
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).digitspan.slice(-1)[0]);
  check('Sequência: meta de 5 dígitos alcançada com teclado do app', h && h.reachedGoal && h.span===5 && h.showMs===500, JSON.stringify(h));
  const badge = await p.evaluate(()=>(document.querySelector('.medal-badge')||{}).textContent);
  check('selo de meta alcançada', /Meta de 5 dígitos/.test(badge||''), badge);
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  // ---------- Jogo da memória: Parar ----------
  await openCard(p,'Jogo da Memória'); await wait(100); await clickText(p,'button','Começar'); await wait(150);
  await p.evaluate(()=>{ document.querySelectorAll('.pairs-card')[0].click(); }); await wait(50);
  await clickText(p,'button','Parar'); await wait(150);
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).pairs.slice(-1)[0]);
  check('Jogo da Memória: Parar salva parcial', h && h.early===true && h.found===0 && h.pairs===12, JSON.stringify(h));
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  // ---------- Flashcards ----------
  await openCard(p,'Flashcards'); await wait(100);
  const fc = await p.evaluate(()=>({groups:Array.from(document.querySelectorAll('.flash-group-title')).map(g=>g.textContent), decks:document.querySelectorAll('.flash-group button').length}));
  check('Flashcards em 5 classes com '+fc.decks+' baralhos', fc.groups.length===5 && fc.decks>=17, fc.groups.join(' | '));
  await clickText(p,'.flash-group button','Espanhol — Falsos amigos'); await wait(50);
  await clickText(p,'.mode-btn','Português → Espanhol'); await clickText(p,'.duration-picker button','10 cartões');
  await clickText(p,'button','Começar'); await wait(150);
  const front = await p.evaluate(()=>document.querySelector('.flash-card').textContent);
  check('sentido invertido mostra o português na frente', !/^Frente(exquisito|embarazada|polvo|oficina|taza|vaso|cena)$/.test(front), front);
  const prog = await p.evaluate(()=>document.querySelector('.flash-progress').textContent);
  check('sessão com 10 cartões', /de 10/.test(prog), prog);
  await p.click('.flash-card'); await wait(100);
  const flip1 = await p.evaluate(()=>document.querySelector('.flash-card').textContent);
  await clickText(p,'button','Rever a pergunta'); await wait(80);
  const flip2 = await p.evaluate(()=>document.querySelector('.flash-card').textContent);
  check('na resposta dá para rever a pergunta', flip1.startsWith('Verso') && flip2.startsWith('Frente') && flip2.includes(front.replace('Frente','')), flip2);
  const ansBtns = await p.evaluate(()=>Array.from(document.querySelectorAll('button')).map(b=>b.textContent));
  check('na resposta também tem trocar baralho e parar', ansBtns.some(t=>t.includes('Trocar baralho')) && ansBtns.some(t=>t.includes('Parar')));
  await clickText(p,'button','Lembrei bem'); await wait(100);
  await clickText(p,'button','Parar e ver resultado'); await wait(150);
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).flashcards.slice(-1)[0]);
  check('Flashcards: Parar salva 1 de 10', h.total===1 && h.planned===10 && h.early, JSON.stringify(h));
  const seen = await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('cronofoco_flash_seen_v1')).espanhol_falsos||{}).length);
  check('cartão visto fica registrado para o sorteio', seen===1);
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  // ---------- Stroop ----------
  await openCard(p,'Desafio das Cores'); await wait(100);
  check('Stroop renomeado', await p.evaluate(()=>document.querySelector('.panel-head h2').textContent==='Desafio das Cores'));
  await clickText(p,'button','Iniciar Exercício'); await wait(300); await clickText(p,'button','Finalizar'); await wait(150);
  const stMetrics = await p.evaluate(()=>document.querySelector('.result-metrics').textContent);
  check('resultado informa conferência sem microfone', /Só cronômetro/.test(stMetrics));
  // ---------- Leitura ----------
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  await openCard(p,'Leitura e Compreensão'); await wait(100);
  const rc = await p.evaluate(()=>Array.from(document.querySelectorAll('.duration-picker button')).map(b=>b.textContent));
  check('Leitura com categorias (30 textos)', rc.length===6 && /Todas \(30\)/.test(rc[0]), rc.join(' | '));
  await clickText(p,'.duration-picker button','Dinheiro'); await clickText(p,'button','Começar'); await wait(150);
  const title = await p.evaluate(()=>document.querySelector('.reading-title').textContent);
  check('texto sorteado da categoria escolhida', ['Juros sobre juros','O que é inflação','Reserva para imprevistos','O orçamento da casa'].includes(title), title);
  await clickText(p,'button','Já li'); await wait(100);
  const firstOpts = await p.evaluate(()=>Array.from(document.querySelectorAll('.mc-question')[0].querySelectorAll('.mc-option')).map(b=>b.textContent));
  console.log('   alternativas (embaralhadas): '+firstOpts.join(' / '));
  await p.evaluate(()=>document.querySelectorAll('.mc-question').forEach(q=>q.querySelector('.mc-option').click())); await clickText(p,'button','Concluir'); await wait(100);
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).reading.slice(-1)[0]);
  check('leitura registra categoria', h.category==='dinheiro' && h.passage===title);
  // ---------- Fluência ----------
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  await openCard(p,'Fluência Verbal'); await wait(100);
  const fl = await p.evaluate(()=>Array.from(document.querySelectorAll('.duration-picker button')).map(b=>b.textContent));
  check('Fluência tem 10s e 20s', fl.includes('10s') && fl.includes('20s'), fl.join(','));
  // ---------- Concursos ----------
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="concursos"]').click()); await wait(150);
  const cc = await p.evaluate(()=>Array.from(document.querySelectorAll('.card')).map(c=>c.querySelector('h3').textContent+' '+c.querySelector('.concurso-cat-count').textContent));
  const tot = parseInt(cc[0].match(/(\d+) questões/)[1]);
  check('Concursos: Misto + 7 categorias, '+tot+' questões', cc.length===8 && /^Misto/.test(cc[0]) && tot>=80, cc.join(' || '));
  await clickText(p,'.card button','Praticar'); await wait(100);
  await clickText(p,'.duration-picker button','5 questões'); await clickText(p,'button','Começar'); await wait(100);
  let right=0; for(let i=0;i<5;i++){
    const prog2 = await p.evaluate(()=>document.querySelector('.concurso-progress').textContent);
    if(i===0) check('misto mostra a categoria de cada questão', /Questão 1 de 5 · /.test(prog2), prog2);
    await p.evaluate(()=>document.querySelector('.mc-option').click()); await wait(60);
    if(await p.evaluate(()=>document.querySelector('.concurso-explanation.correct')!==null)) right++;
    await p.evaluate(()=>Array.from(document.querySelectorAll('button')).find(b=>/Próxima questão|Ver resultado/.test(b.textContent)).click()); await wait(60);
  }
  const okCount = await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('cronofoco_concursos_ok_v1')||'{}')).length);
  check('acertos gravados ('+right+')', okCount===right);
  await clickText(p,'button','Fazer de novo'); await wait(100);
  const setupTxt = await p.evaluate(()=>document.querySelector('.panel .calc-hint').textContent);
  check('tela de configuração mostra acertadas', new RegExp('já acertou '+right).test(setupTxt), setupTxt);
  // ---------- Passatempos ----------
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="passatempos"]').click()); await wait(150);
  const pas = await p.evaluate(()=>Array.from(document.querySelectorAll('.card h3')).map(h=>h.textContent));
  check('Passatempos com Palavras Cruzadas', pas.includes('Palavras Cruzadas'), pas.join(','));
  await openCard(p,'Caça-palavras'); await wait(100);
  await clickText(p,'.mode-btn','Fácil'); 
  let boxes = await p.evaluate(()=>Array.from(document.querySelectorAll('.ws-dir-opts input')).map(i=>i.checked));
  check('Fácil sugere sem diagonal', boxes[0]===false && boxes[1]===false);
  await p.evaluate(()=>document.querySelectorAll('.ws-dir-opts input')[0].click());
  await clickText(p,'button','Começar'); await wait(200);
  await clickText(p,'button','Mostrar respostas'); await wait(150);
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).wordsearch.slice(-1)[0]);
  check('Caça-palavras fácil com diagonal ligada', h.difficulty==='facil' && h.diagonal===true && h.backwards===false, JSON.stringify(h));
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="passatempos"]').click()); await wait(150);
  await openCard(p,'Palavra Embaralhada'); await wait(100);
  const sc = await p.evaluate(()=>Array.from(document.querySelectorAll('.duration-picker button')).map(b=>b.textContent));
  check('Embaralhada com 5 a 30 palavras', sc.join(',')==='5 palavras,10 palavras,15 palavras,20 palavras,30 palavras', sc.join(','));
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="passatempos"]').click()); await wait(150);
  await openCard(p,'Palavras Cruzadas'); await wait(100); await clickText(p,'button','Começar'); await wait(300);
  const cw = await p.evaluate(()=>({cells:document.querySelectorAll('.cw-input').length, clues:document.querySelectorAll('.cw-clue').length, cur:document.querySelector('.cw-current').textContent, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth+1}));
  check('cruzadinha média com 11 dicas', cw.clues===11 && cw.cells>20, cw.clues+' dicas / '+cw.cells+' casas');
  check('cruzadinha cabe no celular', !cw.overflow);
  await p.screenshot({path:path.join(os.tmpdir(),'v41_cw.png'), fullPage:true});
  // digitar: selecionar a 1ª dica e digitar uma letra move para a próxima casa
  await p.evaluate(()=>document.querySelector('.cw-clue').click()); await wait(80);
  const before = await p.evaluate(()=>{ const a=document.activeElement; return a.dataset.r+','+a.dataset.c; });
  await p.keyboard.type('Z'); await wait(80);
  const after = await p.evaluate(()=>{ const a=document.activeElement; return a.dataset.r+','+a.dataset.c; });
  check('digitar avança para a próxima casa', before!==after, before+' -> '+after);
  await clickText(p,'button','Conferir'); await wait(60);
  // revelar todas as palavras -> termina resolvida
  const nClues = cw.clues;
  for(let i=0;i<nClues;i++){ await p.evaluate((i)=>document.querySelectorAll('.cw-clue')[i] && document.querySelectorAll('.cw-clue')[i].click(), i); await clickText(p,'button','Revelar palavra'); await wait(30); if(await p.evaluate(()=>!!document.querySelector('.result-block'))) break; }
  h = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).crossword.slice(-1)[0]);
  check('cruzadinha completa registrada', h && h.solved===true && h.correctWords===h.words, JSON.stringify(h));
  await p.screenshot({path:path.join(os.tmpdir(),'v41_cw_done.png'), fullPage:true});
  // ---------- Histórico ----------
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="history"]').click()); await wait(200);
  const hs = await p.evaluate(()=>Array.from(document.querySelectorAll('.hist-section h3')).map(h=>h.textContent));
  check('histórico com Palavras Cruzadas e Stroop renomeado', hs.includes('Palavras Cruzadas') && hs.includes('Desafio das Cores (Stroop)'));
  const stRow = await p.evaluate(()=>{ const s=Array.from(document.querySelectorAll('.hist-section')).find(x=>x.querySelector('h3').textContent.startsWith('Desafio')); return s.querySelector('tbody tr').textContent; });
  check('histórico do Stroop mostra "Sem microfone"', /Sem microfone/.test(stRow), stRow);
  check('sem erros de JavaScript', p.errs.length===0, p.errs.join(' | '));
  await b.close();
  console.log(fails ? '\n'+fails+' FALHA(S)' : '\nTUDO OK');
})();
