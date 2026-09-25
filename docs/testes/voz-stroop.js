// Teste da voz do Desafio das Cores (Stroop) com o plugin nativo simulado (sem celular).
// Uso: npm install playwright && npx playwright install chromium && node voz-stroop.js   (opcional: CHROMIUM_PATH)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const os = require('os');
// MOCK=./mock-webspeech.js testa o motor do navegador (Web Speech API); o padrão é o plugin nativo do app.
// UA="...Android..." simula um navegador de celular (uma frase por sessão).
const MOCK = require(process.env.MOCK || './mock-cronovoice.js');
const HTML = process.env.HTML || path.resolve(__dirname, '../../www/index.html');
const OUT = path.join(os.tmpdir(), 'cronofoco_voz_stroop.html');
fs.writeFileSync(OUT,'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(HTML,'utf8')+'</body></html>');
const LAUNCH = process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {};
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails=0; const check=(n,c,x)=>{console.log((c?'OK   ':'FALHA')+' '+n+(x?'  '+x:'')); if(!c) fails++;};
const HEX = {'#3B6FE0':'azul','#D6453D':'vermelho','#D0A400':'amarelo','#2E9A5E':'verde','#8B5AD1':'roxo','#E07E28':'laranja'};
(async()=>{
  const b = await chromium.launch(LAUNCH);
  const p = await b.newPage(Object.assign({viewport:{width:420,height:900}}, process.env.UA ? {userAgent: process.env.UA} : {})); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(MOCK);
  // licença VASSOURA (modo revisão) para o Desafio das Cores estar liberado
  await p.addInitScript(()=>localStorage.setItem('cronofoco_license_v1', JSON.stringify({n:'Teste', h:'8fde074ca42ca9b1e8ebc9f64057ad791d37c41b5729d5461a42c22b63293d3d'})));
  await p.goto('file://'+OUT); await wait(300);
  await p.evaluate(()=>{ for(const c of document.querySelectorAll('.card')) if(c.querySelector('h3') && c.querySelector('h3').textContent==='Desafio das Cores'){ c.querySelector('button.btn').click(); break; } });
  await wait(150);
  await p.evaluate(()=>{ Array.from(document.querySelectorAll('.duration-picker button')).find(x=>x.textContent.includes('20 palavras')).click();
    Array.from(document.querySelectorAll('button')).find(x=>x.textContent.includes('Conferir por voz')).click();
    Array.from(document.querySelectorAll('button')).find(x=>x.textContent.includes('Iniciar Exercício')).click(); });
  await wait(400);
  const expected = await p.evaluate(()=>Array.from(document.querySelectorAll('.stroop-word')).map(w=>(w.getAttribute('style').match(/#[0-9A-Fa-f]{6}/)||[''])[0].toUpperCase()));
  const names = expected.map(h=>HEX[h]);
  check('grade de 20 palavras com cores conhecidas', names.length===20 && names.every(Boolean), names.slice(0,6).join(','));
  check('painel "Pode falar" visível', await p.evaluate(()=>!!document.querySelector('.voice-status')));
  const states = () => p.evaluate(()=>Array.from(document.querySelectorAll('.stroop-word')).map(w=>w.classList.contains('voice-correct')?'o':w.classList.contains('voice-wrong')?'x':w.classList.contains('voice-miss')?'-':'.').join(''));
  // Sessão 1: fala as 6 primeiras cores, mas o "reconhecedor" perde a 3ª
  // escolhe uma palavra (entre a 2ª e a 5ª) diferente das vizinhas, para o teste não depender do sorteio
  let k = 2; for(let i=1;i<=4;i++){ if(names[i]!==names[i-1] && names[i]!==names[i+1]){ k=i; break; } }
  const said1 = names.slice(0,6).filter((_,i)=>i!==k).join(' ');
  await p.evaluate(t=>window.__cv.final(t), said1); await wait(200);
  let st = await states();
  check('palavra perdida vira "não captada" e as seguintes continuam certas', st.slice(0,6)==='o'.repeat(k)+'-'+'o'.repeat(5-k), st);
  // Sessão 2: cor errada na 7ª, certas na 8ª e 9ª
  const wrong = ['azul','vermelho','amarelo','verde','roxo','laranja'].find(c=>c!==names[6]);
  await p.evaluate(t=>window.__cv.final(t), [wrong, names[7], names[8]].join(', ') + '.'); await wait(200);
  st = await states();
  check('cor errada vira ✗ sem deslocar as seguintes (pontuação ignorada)', st.slice(6,9)==='xoo', st);
  // Parcial: a última cor espera ~0,45 s
  await p.evaluate(t=>window.__cv.partial(t), names[9]); await wait(150);
  const before = (await states())[9];
  await wait(500);
  const after = (await states())[9];
  check('última cor da fala espera ~0,45 s antes de contar', before==='.' && after==='o', before+'→'+after);
  // Termina a grade
  await p.evaluate(t=>window.__cv.final(t), names.slice(9).join(' ')); await wait(400);
  const res = await p.evaluate(()=>({metrics:(document.querySelector('.result-metrics')||{}).textContent||'', grid: document.querySelectorAll('.vb-cell').length, btn: !!Array.from(document.querySelectorAll('button')).find(x=>x.textContent.includes('Copiar relatório de voz'))}));
  check('resultado com certas/erradas/não captadas e grade palavra por palavra', /Cor certa \/ errada/.test(res.metrics) && /Não captadas/.test(res.metrics) && res.grid===20 && res.btn, res.metrics.slice(0,120));
  const rec = await p.evaluate(()=>JSON.parse(localStorage.getItem('cronofoco_history_v1')).stroop.slice(-1)[0]);
  check('histórico grava voiceScore {ok, bad, miss, total}', rec.mode==='voice' && rec.voiceScore.ok===18 && rec.voiceScore.bad===1 && rec.voiceScore.miss===1 && rec.voiceScore.total===20, JSON.stringify(rec.voiceScore));
  check('microfone desligado no fim', await p.evaluate(()=>window.__cv.stops>=1));
  check('sem erros JS', errs.length===0, errs.join('|'));
  console.log(fails?fails+' FALHA(S)':'TUDO OK'); await b.close();
})();
