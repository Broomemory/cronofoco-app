// Teste da voz do Cálculo Mental com o plugin nativo simulado (sem celular).
// Uso: npm install playwright && npx playwright install chromium && node voz-calculo.js   (opcional: CHROMIUM_PATH)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const os = require('os');
const MOCK = require('./mock-cronovoice.js');
const HTML = process.env.HTML || path.resolve(__dirname, '../../www/index.html');
const OUT = path.join(os.tmpdir(), 'cronofoco_voz_calc.html');
fs.writeFileSync(OUT,'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(HTML,'utf8')+'</body></html>');
const LAUNCH = process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {};
const wait = ms => new Promise(r => setTimeout(r, ms));
let fails=0; const check=(n,c,x)=>{console.log((c?'OK   ':'FALHA')+' '+n+(x?'  '+x:'')); if(!c) fails++;};
const ext = {0:'zero',1:'um',2:'dois',3:'três',4:'quatro',5:'cinco',6:'seis',7:'sete',8:'oito',9:'nove',10:'dez',11:'onze',12:'doze',13:'treze',14:'catorze',15:'quinze',16:'dezesseis',17:'dezessete',18:'dezoito',19:'dezenove',20:'vinte',21:'vinte e um',24:'vinte e quatro',25:'vinte e cinco',27:'vinte e sete',28:'vinte e oito',30:'trinta',32:'trinta e dois',35:'trinta e cinco',36:'trinta e seis',40:'quarenta',42:'quarenta e dois',45:'quarenta e cinco',48:'quarenta e oito',49:'quarenta e nove',50:'cinquenta',54:'cinquenta e quatro',56:'cinquenta e seis',60:'sessenta',63:'sessenta e três',64:'sessenta e quatro',70:'setenta',72:'setenta e dois',80:'oitenta',81:'oitenta e um',90:'noventa',100:'cem'};
(async()=>{
  const b = await chromium.launch(LAUNCH);
  const p = await b.newPage({viewport:{width:420,height:900}}); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(MOCK); await p.goto('file://'+OUT); await wait(300);
  await p.evaluate(()=>{for(const c of document.querySelectorAll('.card')) if(c.textContent.includes('Cálculo Mental')){c.querySelector('button.btn').click();break;}});
  await wait(150);
  await p.evaluate(()=>{ Array.from(document.querySelectorAll('.duration-picker button')).find(b=>b.textContent.includes('30 contas')).click();
    Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Responder falando')).click();
    const rows=document.querySelectorAll('.actions-row'); rows[rows.length-1].querySelector('button.btn').click(); });
  await wait(300);
  const qs = await p.evaluate(()=>{ /* lê a conta atual + próximas */ const e=document.querySelector('.calc-expr'); const a=+e.childNodes[0].textContent, op=e.querySelector('.op').textContent, b=+e.childNodes[2].textContent; const up=Array.from(document.querySelectorAll('.upcoming-chip')).map(x=>x.textContent); return {a,op,b,up}; });
  const calc = s => { const m = s.match(/(\d+)\s*(\S)\s*(\d+)/); const a=+m[1], o=m[2], b2=+m[3]; return o==='+'?a+b2:o==='-'?a-b2:a*b2; };
  const cur = () => p.evaluate(()=>{ const e=document.querySelector('.calc-expr'); return e ? e.textContent : null; });
  const n = () => p.evaluate(()=>document.querySelector('.calc-qcount') ? document.querySelector('.calc-qcount').textContent : '');
  const okc = () => p.evaluate(()=>Array.from(document.querySelectorAll('table.ledger td')).filter(td=>td.textContent==='✓').length);
  const badc = () => p.evaluate(()=>Array.from(document.querySelectorAll('table.ledger td')).filter(td=>td.textContent==='✗').length);
  let transcript = '';
  const say = async (t, fin) => { transcript = (transcript ? transcript + ' ' : '') + t; await p.evaluate(([t,f])=> f ? window.__cv.final(t) : window.__cv.partial(t), [transcript, fin]); if(fin) transcript=''; };
  const ans = async () => calc(await cur());
  // 1) resposta por extenso, parcial, confirma após ~0,8 s
  let a1 = await ans(); let n0 = await n();
  await say(ext[a1] || String(a1)); await wait(300);
  check('parcial não confirma antes de ~0,8 s', (await n()) === n0);
  await wait(700);
  check('confirma após ~0,8 s e avança', (await n()) !== n0 && (await okc()) === 1, n0+' → '+(await n()));
  // 2) respostas rápidas em sequência na mesma sessão (sem esperar): a 1ª confirma quando a 2ª chega
  let a2 = await ans(); n0 = await n();
  await say(String(a2)); await wait(150);
  let a3 = await ans(); // ainda é a mesma conta (a2)
  const upNext = (await p.evaluate(()=>Array.from(document.querySelectorAll('.upcoming-chip')).map(x=>x.textContent)))[0];
  const a3real = calc(upNext);
  await say(String(a3real)); await wait(100);
  check('resposta seguinte chega na mesma frase: a anterior confirma na hora', (await okc()) === 2, 'ok='+(await okc()));
  await wait(900);
  check('e a nova também confirma após a pausa', (await okc()) === 3, 'ok='+(await okc()));
  const restarts = await p.evaluate(()=>window.__cv.restarts);
  check('não reinicia o microfone entre contas', restarts === 0, 'restarts='+restarts);
  // 3) fala sem número não conta
  n0 = await n(); await say('hã é'); await wait(1000);
  check('"hã é" ignorado', (await n()) === n0 && (await badc()) === 0);
  // 4) leu a conta em voz alta + resultado → só o resultado conta
  let q4 = await cur(); let a4 = calc(q4); const m4 = q4.match(/(\d+)\s*(\S)\s*(\d+)/);
  const opw = {'+':'mais','-':'menos','×':'vezes'}[m4[2]];
  await say(m4[1] + ' ' + opw + ' ' + m4[3] + ' é ' + (ext[a4]||a4), true); await wait(300);
  check('lendo a conta em voz alta, só o resultado conta', (await okc()) === 4 && (await badc()) === 0, 'ok='+(await okc())+' bad='+(await badc()));
  // 5) final com alternativa (1ª sem número)
  let a5 = await ans();
  await p.evaluate(([t,a])=>window.__cv.emit('voiceResult',{session:window.__cv.session, matches:[t,a]}), ['a gente', String(a5)]); await wait(300);
  check('usa alternativa com número no fim da frase', (await okc()) === 5, 'ok='+(await okc()));
  // 6) erro de verdade
  let a6 = await ans(); await p.evaluate(()=>window.__cv.final('')); await say(String(a6+1), true); await wait(300);
  check('número errado vira ✗', (await badc()) === 1);
  // 7) reconhecedor "gruda" a resposta nova na anterior: 20 → "21", 10 → "100"
  const setQ = async (a, op, b) => p.evaluate(()=>0);
  const forceAnswerSeq = async (seqTexts) => { for (const t of seqTexts) { await p.evaluate(t=>window.__cv.partial(t), t); await wait(1000); } };
  // descobre as respostas das próximas duas contas e força o cenário com valores reais
  let b1 = await ans(); await p.evaluate(()=>window.__cv.final('')); // sessão nova
  const okBefore = await okc(), badBefore = await badc();
  await p.evaluate(t=>window.__cv.partial(t), String(b1)); await wait(1000);    // registra b1
  let b2 = await ans();
  // texto grudado: b1 seguido de b2 (ex.: "20" + "1" → "201" ou "21" se b1 for dezena)
  const glued = (b1 >= 20 && b1 < 100 && b1 % 10 === 0 && b2 >= 1 && b2 <= 9) ? String(b1 + b2) : String(b1) + String(b2);
  await p.evaluate(t=>window.__cv.partial(t), glued); await wait(1000);
  check('resposta "grudada" na anterior pelo reconhecedor é separada ('+b1+' + '+b2+' → "'+glued+'")', (await okc()) === okBefore + 2 && (await badc()) === badBefore, 'ok '+okBefore+'→'+(await okc()));
  // 8) botão pular
  const nb = await n(); await p.click('text=Pular esta conta'); await wait(200);
  check('botão "Pular esta conta" avança', (await n()) !== nb);
  // 9) relatório no fim
  await p.click('text=Parar'); await wait(300);
  const rep = await p.evaluate(()=>({btn: !!Array.from(document.querySelectorAll('button')).find(b=>b.textContent.includes('Copiar relatório de voz')), pre:(document.querySelector('.voice-breakdown pre')||{}).textContent||''}));
  check('relatório de voz no fim do cálculo', rep.btn && /Conta por conta/.test(rep.pre) && /ouviu/.test(rep.pre) && /pulada/.test(rep.pre));
  check('sem erros JS', errs.length===0, errs.join('|'));
  console.log(fails?fails+' FALHA(S)':'TUDO OK'); await b.close();
})();
