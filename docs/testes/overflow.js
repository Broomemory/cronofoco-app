// Uso: a partir da pasta docs/testes do repositório do app →  npm install playwright  &&  npx playwright install chromium  &&  node overflow.js
// (opcional) CHROMIUM_PATH=/caminho/do/chromium para usar um Chromium já instalado.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const os = require('os');
const HTML = process.env.HTML || path.resolve(__dirname, '../../www/index.html');
const OUT = path.join(os.tmpdir(), 'cronofoco_teste.html');
fs.writeFileSync(OUT,'<!doctype html><html><head><meta charset="utf-8"></head><body>'+fs.readFileSync(HTML,'utf8')+'</body></html>');
const LAUNCH = process.env.CHROMIUM_PATH ? {executablePath: process.env.CHROMIUM_PATH} : {};
const wait = ms => new Promise(r => setTimeout(r, ms));
(async()=>{
  const b = await chromium.launch(LAUNCH);
  const ctx = await b.newContext({viewport:{width:360,height:780}, colorScheme:'dark'}); const p = await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.addInitScript(()=>{ localStorage.setItem('cronofoco_license_v1', JSON.stringify({n:'Leandro', h:'8fde074ca42ca9b1e8ebc9f64057ad791d37c41b5729d5461a42c22b63293d3d'})); });
  await p.goto('file://'+OUT); await wait(300);
  const ov = async (label)=>{ const o = await p.evaluate(()=>{ const W=document.documentElement.clientWidth; const bad=Array.from(document.querySelectorAll('#app *')).filter(e=>{const r=e.getBoundingClientRect(); return r.width>0 && (r.right>W+1||r.left<-1);}).slice(0,3).map(e=>e.className+':'+(e.textContent||'').slice(0,30)); return {scroll:document.documentElement.scrollWidth>W+1, bad}; }); if(o.scroll||o.bad.length) console.log('OVERFLOW '+label, JSON.stringify(o)); return o; };
  await ov('home');
  const titles = await p.evaluate(()=>Array.from(document.querySelectorAll('.grid-cards .card h3')).map(h=>h.textContent));
  for(const t of titles){
    await p.evaluate((t)=>Array.from(document.querySelectorAll('.card')).find(c=>c.querySelector('h3').textContent===t).querySelector('button').click(), t); await wait(150);
    await ov('setup '+t);
    const started = await p.evaluate(()=>{ const s=Array.from(document.querySelectorAll('button')).find(b=>/^(Começar|Iniciar Exercício)$/.test(b.textContent)); if(s){ s.click(); return true;} return false; }); await wait(400);
    if(started) await ov('running '+t);
    if(t==='Memorização de Palavras'){ await p.screenshot({path:path.join(os.tmpdir(),'ov_memo.png')}); }
    await p.evaluate(()=>document.querySelector('#mainNav button[data-view="home"]').click()); await wait(150);
  }
  for(const v of ['concursos','passatempos','history']){ await p.evaluate((v)=>document.querySelector('#mainNav button[data-view="'+v+'"]').click(), v); await wait(200); await ov(v); }
  await p.evaluate(()=>document.querySelector('#mainNav button[data-view="passatempos"]').click()); await wait(150);
  for(const t of ['Palavras Cruzadas','Caça-palavras','Sudoku']){
    await p.evaluate((t)=>Array.from(document.querySelectorAll('.card')).find(c=>c.querySelector('h3').textContent===t).querySelector('button').click(), t); await wait(150);
    await ov('setup '+t);
    await p.evaluate(()=>{ const s=Array.from(document.querySelectorAll('button')).find(b=>b.textContent==='Começar'); if(s) s.click(); }); await wait(400);
    await ov('running '+t);
    if(t==='Palavras Cruzadas') await p.screenshot({path:path.join(os.tmpdir(),'ov_cw_dark.png'), fullPage:true});
    await p.evaluate(()=>document.querySelector('#mainNav button[data-view="passatempos"]').click()); await wait(150);
  }
  console.log('erros JS:', errs.length ? errs.join(' | ') : 'nenhum');
  await b.close();
})();
