const $=s=>document.querySelector(s), get=k=>sessionStorage.getItem(k), set=(k,v)=>sessionStorage.setItem(k,v);
// Acessibilidade: fonte e contraste (lembrados entre as páginas)
let fs=+(localStorage.getItem('fs')||125);
const aplica=()=>{document.documentElement.style.setProperty('--fs',fs+'%');document.body.classList.toggle('contraste',localStorage.getItem('c')==='1')};
aplica();
$('#mais').onclick=()=>{fs=Math.min(175,fs+15);localStorage.setItem('fs',fs);aplica()};
$('#menos').onclick=()=>{fs=Math.max(100,fs-15);localStorage.setItem('fs',fs);aplica()};
$('#contraste').onclick=()=>{localStorage.setItem('c',localStorage.getItem('c')==='1'?'0':'1');aplica()};
const pg=document.body.dataset.page;
const erro=(el,msg)=>{el.textContent=msg;};

if(pg==='inicio'){ // Busca do remédio
  const meds=[...new Set(POSTOS.flatMap(p=>Object.keys(p.estoque)))];
  $('#med').innerHTML='<option value="">Escolha o remédio</option>'+meds.map(m=>`<option>${m}</option>`).join('');
  $('#form').onsubmit=e=>{e.preventDefault();
    if(!$('#med').value){erro($('#erro'),'Escolha um remédio para continuar.');$('#med').focus();return}
    set('med',$('#med').value);location.href='resultado.html'};
}
if(pg==='resultado'){ // Disponibilidade por posto, com filtro
  const med=get('med'); if(!med){location.href='index.html'}
  $('#titulo').textContent='Onde encontrar: '+med;
  const lista=()=>{const so=$('#so').checked;
    const ps=POSTOS.filter(p=>!so||p.estoque[med]!=='em falta').sort((a,b)=>a.dist-b.dist);
    $('#lista').innerHTML=ps.map(p=>{const s=p.estoque[med];return `<li class="card"><h3>${p.nome}</h3>
      <p>${p.dist.toString().replace('.',',')} km · Aberto das ${p.horario}</p>
      <p>Estoque: <span class="tag ${s.replace(' ','-')}">${s==='pouco'?'Pouco estoque':s==='em falta'?'Em falta':'Disponível'}</span></p>
      ${s==='em falta'?'<p>Não vale a pena ir agora.</p>':`<button data-id="${p.id}">Escolher ${p.nome}</button>`}</li>`}).join('')||'<li>Nenhum posto com o remédio agora.</li>';
    $('#cont').textContent=ps.length+' posto(s) encontrado(s)'};
  $('#so').onchange=lista;lista();
  $('#lista').onclick=e=>{const id=e.target.dataset.id;if(id){set('posto',POSTOS.find(p=>p.id==id).nome);location.href='agendar.html'}};
}
if(pg==='agendar'){ // Checklist de documentos + agendamento
  if(!get('posto'))location.href='index.html';
  $('#posto').textContent=get('posto');
  $('#docs').innerHTML=DOCUMENTOS.map((d,i)=>`<label><input type="checkbox" id="d${i}">${d}</label>`).join('');
  const prog=()=>{const n=DOCUMENTOS.filter((_,i)=>$('#d'+i).checked).length;$('#prog').value=n;$('#prog').max=DOCUMENTOS.length;
    $('#progtxt').textContent=n===DOCUMENTOS.length?'Pronto! Você tem tudo para ir ao posto.':`Você separou ${n} de ${DOCUMENTOS.length} documentos.`};
  $('#docs').onchange=prog;prog();
  const dias=[];for(let d=new Date(),n=0;n<5;d.setDate(d.getDate()+1)){if(d.getDay()%6){dias.push(new Date(d));n++}}
  $('#dia').innerHTML='<option value="">Escolha o dia</option>'+dias.map(d=>`<option>${d.toLocaleDateString('pt-BR',{weekday:'long',day:'numeric',month:'long'})}</option>`).join('');
  $('#form').onsubmit=e=>{e.preventDefault();let ok=true;
    for(const [id,m] of [['nome','Escreva seu nome completo.'],['dia','Escolha o dia.'],['hora','Escolha o horário.']]){
      const el=$('#'+id),er=$('#e-'+id);if(!el.value.trim()||(id==='nome'&&el.value.trim().split(' ').length<2)){erro(er,m);if(ok)el.focus();ok=false}else erro(er,'')}
    if(!ok)return;
    set('nome',$('#nome').value.trim());set('dia',$('#dia').value);set('hora',$('#hora').value);
    set('prot','SP-'+Math.floor(100000+Math.random()*900000));location.href='confirmacao.html'};
}
if(pg==='confirmacao'){ // Resumo e protocolo
  if(!get('prot'))location.href='index.html';
  $('#resumo').innerHTML=`<li>Nome: <b>${get('nome')}</b></li><li>Remédio: <b>${get('med')}</b></li><li>Posto: <b>${get('posto')}</b></li><li>Dia: <b>${get('dia')}, às ${get('hora')}</b></li>`;
  $('#prot').textContent=get('prot');
  $('#imp').onclick=()=>print();
}
