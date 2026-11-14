const TIPOS = ["Tarjeta bancaria bloqueada","Consumo no reconocido","Posible fraude bancario","Dinero descontado sin autorización","Transferencia no reconocida","Robo o pérdida de tarjeta","Cuenta bancaria comprometida","Solicitud de devolución de dinero","Retraso en un reembolso","Cobro duplicado","Error en el monto de una compra","Reclamo por comisión cobrada","Problemas con una transacción pendiente","Consulta sobre horarios de atención","Información sobre productos","Consulta sobre promociones","Solicitud de información de servicios","Dudas sobre el estado de una solicitud","Consulta sobre requisitos de atención","Otros"];
const PRODUCTOS = [["👕","Polo básico","S/39"],["👟","Zapatillas urbanas","S/149"],["🎧","Audífonos BT","S/89"],["🧴","Set de limpieza","S/25"],["📺","TV 43'' 4K","S/1299"],["🧳","Maleta de viaje","S/179"]];
const ESTADOS = [
 ["Reporte enviado","Tu reporte fue recibido y está en cola de revisión.","wait"],
 ["En revisión","Un agente está evaluando los detalles de tu caso.","wait"],
 ["Información adicional solicitada","Se requieren datos o adjuntos extra para continuar.","wait"],
 ["Resuelto","Tu caso fue cerrado con una solución aplicada.","ok"]
];

function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

let session = load('fs_session', null);
let reportes = load('fs_reportes', []);
let carrito = load('fs_carrito', []);

function go(view){
  document.querySelectorAll('main section').forEach(s=>s.classList.add('hidden'));
  document.getElementById('view-'+view).classList.remove('hidden');
  document.getElementById('menu').classList.remove('open');
  if(view==='cuenta') renderCuenta();
  if(view==='compras') renderCompras();
  if(view==='nuevoReporte') renderTipos();
  if(view==='seguimiento') renderSeguimiento();
  if(view==='notificaciones') renderNotif();
}

function doLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  if(!email || !pass){ alert('Ingresa un correo y contraseña (pueden ser cualquiera).'); return; }
  session = load('fs_perfil', null) || {nombres:'Cliente',apellidos:'Demo',dni:'-',celular:'-',email:email};
  save('fs_session', true);
  document.getElementById('appHeader').classList.remove('hidden');
  go('compras');
}

function doRegister(){
  const perfil = {
    nombres: document.getElementById('regNombres').value,
    apellidos: document.getElementById('regApellidos').value,
    dni: document.getElementById('regDni').value,
    celular: document.getElementById('regCel').value,
    email: document.getElementById('regEmail').value,
    pago: {
      tipo: document.getElementById('payTipo').value,
      banco: document.getElementById('payBanco').value,
      num: document.getElementById('payNum').value,
      venc: document.getElementById('payVenc').value,
      cvv: document.getElementById('payCvv').value
    }
  };
  save('fs_perfil', perfil);
  session = perfil;
  save('fs_session', true);
  document.getElementById('appHeader').classList.remove('hidden');
  go('compras');
}

function logout(){
  save('fs_session', false);
  document.getElementById('appHeader').classList.add('hidden');
  go('login');
}

function renderCuenta(){
  const p = load('fs_perfil', session||{});
  document.getElementById('ctNombres').value = p.nombres||'';
  document.getElementById('ctApellidos').value = p.apellidos||'';
  document.getElementById('ctDni').value = p.dni||'';
  document.getElementById('ctCel').value = p.celular||'';
  document.getElementById('ctEmail').value = p.email||'';
  const pg = p.pago || {};
  document.getElementById('ctPayTipo').value = pg.tipo || 'Tarjeta de débito';
  document.getElementById('ctPayBanco').value = pg.banco || '';
  document.getElementById('ctPayNum').value = pg.num || '';
  document.getElementById('ctPayVenc').value = pg.venc || '';
  document.getElementById('ctPayCvv').value = pg.cvv || '';
  document.getElementById('ctMsg').classList.add('hidden');
}

function guardarCuenta(){
  const perfil = {
    nombres: document.getElementById('ctNombres').value,
    apellidos: document.getElementById('ctApellidos').value,
    dni: document.getElementById('ctDni').value,
    celular: document.getElementById('ctCel').value,
    email: document.getElementById('ctEmail').value,
    pago: {
      tipo: document.getElementById('ctPayTipo').value,
      banco: document.getElementById('ctPayBanco').value,
      num: document.getElementById('ctPayNum').value,
      venc: document.getElementById('ctPayVenc').value,
      cvv: document.getElementById('ctPayCvv').value
    }
  };
  save('fs_perfil', perfil);
  session = perfil;
  const msg = document.getElementById('ctMsg');
  msg.classList.remove('hidden');
}

function renderCompras(){
  document.getElementById('catalogo').innerHTML = PRODUCTOS.map((pr,i)=>`
    <div class="product"><div class="ph">${pr[0]}</div><div><b>${pr[1]}</b></div><div>${pr[2]}</div>
    <button class="btn secondary" style="margin-top:8px" onclick="agregarCarrito(${i})">Agregar</button></div>`).join('');
  renderCarrito();
}
function agregarCarrito(i){ carrito.push(PRODUCTOS[i]); save('fs_carrito', carrito); renderCarrito(); }
function renderCarrito(){
  document.getElementById('carrito').innerHTML = carrito.length ? carrito.map(c=>`<p>${c[0]} ${c[1]} — ${c[2]}</p>`).join('') : '<p class="notice">Aún no agregaste nada.</p>';
}

function renderTipos(){
  document.getElementById('tiposReclamo').innerHTML = TIPOS.map((t,i)=>`
    <label><input type="radio" name="tipoReclamo" value="${t}" ${i===0?'checked':''}> ${t}</label>`).join('');
}

function enviarReporte(){
  const tipo = document.querySelector('input[name=tipoReclamo]:checked').value;
  const desc = document.getElementById('repDesc').value.trim();
  const files = document.getElementById('repAdj').files.length;
  if(!desc){ alert('Describe brevemente tu caso antes de enviar.'); return; }
  const ticket = 'FBS-' + Math.floor(100000+Math.random()*900000);
  reportes.push({ticket, tipo, desc, adjuntos:files, estado:0, fecha:new Date().toLocaleDateString()});
  save('fs_reportes', reportes);
  document.getElementById('ticketNum').textContent = ticket;
  document.getElementById('ticketOverlay').classList.add('open');
  document.getElementById('repDesc').value='';
}
function closeOverlay(){ document.getElementById('ticketOverlay').classList.remove('open'); go('reportes'); }

function renderSeguimiento(){
  const el = document.getElementById('listaSeguimiento');
  if(!reportes.length){ el.innerHTML = '<p class="notice">No tienes reportes aún.</p>'; return; }
  el.innerHTML = reportes.slice().reverse().map(r=>{
    const e = ESTADOS[Math.min(r.estado, ESTADOS.length-1)];
    return `<div class="card" style="margin-bottom:10px">
      <p class="ticket">${r.ticket} <span class="badge ${e[2]}">${e[0]}</span></p>
      <p><b>Tipo:</b> ${r.tipo}</p>
      <p style="color:var(--muted);font-size:.9em">${e[1]}</p>
      <p style="font-size:.85em;color:var(--muted)">Enviado: ${r.fecha}</p>
      ${r.estado < ESTADOS.length-1 ? `<button class="btn secondary" onclick="avanzarEstado('${r.ticket}')">Simular avance</button>` : ''}
    </div>`;
  }).join('');
}
function avanzarEstado(ticket){
  const r = reportes.find(x=>x.ticket===ticket);
  if(r) r.estado++;
  save('fs_reportes', reportes);
  renderSeguimiento();
}

function renderNotif(){
  const el = document.getElementById('listaNotif');
  if(!reportes.length){ el.innerHTML = '<p class="notice">Sin notificaciones por ahora.</p>'; return; }
  el.innerHTML = reportes.slice().reverse().map(r=>{
    const e = ESTADOS[Math.min(r.estado, ESTADOS.length-1)];
    return `<div class="card" style="margin-bottom:10px"><p><b>${r.ticket}</b> — ${e[0]}</p><p style="font-size:.9em;color:var(--muted)">${e[1]}</p></div>`;
  }).join('');
}

// init
if(session && load('fs_session', false)){
  document.getElementById('appHeader').classList.remove('hidden');
  go('compras');
} else {
  go('login');
}
