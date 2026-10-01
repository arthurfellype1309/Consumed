/* Especialidades: informações e rede de saúde perto do usuário.
   Os lugares vêm do OpenStreetMap (Overpass API) e os profissionais, de dados.js. */
   const RAIO = 8000;
   const CATEGORIAS = {
       urgencia: {
           maps: 'UPA pronto socorro',
           ajuda: 'UPAs e pronto-socorros atendem urgências e emergências, em geral 24 horas. Em risco de vida, ligue 192 (SAMU) em vez de se deslocar por conta própria.',
       },
       ubs: {
           maps: 'UBS posto de saúde',
           ajuda: 'A UBS é a porta de entrada do SUS: consultas de rotina, vacinas, pré-natal, curativos, acompanhamento de doenças crônicas e encaminhamento a especialistas.',
       },
       caps: {
           maps: 'CAPS centro de atenção psicossocial',
           ajuda: 'Os CAPS oferecem atendimento público em saúde mental, inclusive para uso de álcool e outras drogas. Em crise emocional, o CVV atende pelo 188, 24 horas.',
       },
       hospital: {
           maps: 'hospital',
           ajuda: 'Hospitais cuidam de casos de maior complexidade e internações. Para consultas e exames de rotina, a UBS ou uma clínica costumam ser o primeiro passo.',
       },
       clinica: {
           maps: 'clínica médica',
           ajuda: 'Clínicas e consultórios, públicos ou particulares, atendem consultas e exames agendados.',
       },
   };
   const estado = { lat: null, lon: null, categoria: 'urgencia', lugares: [], situacao: 'inicio' };
   const el = (id) => document.getElementById(id);
    
   function distanciaKm(lat1, lon1, lat2, lon2) {
       const rad = (g) => (g * Math.PI) / 180;
       const a =
           Math.sin(rad(lat2 - lat1) / 2) ** 2 +
           Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
       return 12742 * Math.asin(Math.sqrt(a));
   }
    
   const formatarKm = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`);
    
   /* Separa os lugares do OpenStreetMap por tipo, usando as etiquetas e o nome */
   function classificar(t) {
       const nome = `${t.name || ''} ${t.operator || ''}`;
       if (/\bCAPS\b|aten[cç][aã]o psicossocial/i.test(nome)) return 'caps';
       if (/\bUPA\b|pronto[- ]socorro|pronto[- ]atendimento|\bPS\b|emerg[eê]ncia/i.test(nome) || t.emergency === 'yes') {
           return 'urgencia';
       }
       if (/\bUBS\b|\bUSF\b|posto de sa[uú]de|unidade b[aá]sica|sa[uú]de da fam[ií]lia|centro de sa[uú]de/i.test(nome)) {
           return 'ubs';
       }
       if (t.amenity === 'hospital' || t.healthcare === 'hospital') return 'hospital';
       return 'clinica';
   }
    
   function ehPublico(t) {
       const nome = `${t.name || ''} ${t.operator || ''}`;
       return (
           t['operator:type'] === 'public' ||
           /\bSUS\b|\bUPA\b|\bUBS\b|\bUSF\b|\bCAPS\b|municipal|prefeitura|secretaria|estadual|federal/i.test(nome)
       );
   }
    
   async function buscarLugares(lat, lon) {
       const area = `(around:${RAIO},${lat},${lon})`;
       const consulta = `[out:json][timeout:25];(nwr["amenity"~"^(hospital|clinic|doctors)$"]${area};nwr["healthcare"~"^(hospital|centre|clinic)$"]${area};);out center tags 150;`;
       const resposta = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(consulta));
       if (!resposta.ok) throw new Error('Overpass ' + resposta.status);
       const dados = await resposta.json();
       const vistos = new Set();
       return dados.elements
           .map((e) => {
               const t = e.tags || {};
               const la = e.lat ?? e.center?.lat;
               const lo = e.lon ?? e.center?.lon;
               return {
                   nome: t.name,
                   lat: la,
                   lon: lo,
                   categoria: classificar(t),
                   publico: ehPublico(t),
                   endereco: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', '),
                   telefone: t.phone || t['contact:phone'] || '',
                   km: distanciaKm(lat, lon, la, lo),
               };
           })
           .filter((l) => l.nome && l.lat != null && !vistos.has(l.nome + l.categoria) && vistos.add(l.nome + l.categoria))
           .sort((a, b) => a.km - b.km);
   }
    
   function mostrarStatus(texto, tipo) {
       el('status-local').textContent = texto;
       el('status-local').className = 'aviso ' + tipo;
   }
    
   function linkMapas() {
       const busca = encodeURIComponent(CATEGORIAS[estado.categoria].maps);
       const base = `https://www.google.com/maps/search/${busca}`;
       return estado.lat == null ? base : `${base}/@${estado.lat},${estado.lon},14z`;
   }
    
   function desenharLugares() {
       document
           .querySelectorAll('[data-cat]')
           .forEach((b) => b.setAttribute('aria-pressed', b.dataset.cat === estado.categoria));
       el('ajuda').textContent = CATEGORIAS[estado.categoria].ajuda;
       const mapas = `<a href="${linkMapas()}" target="_blank" rel="noopener">Buscar no Google Maps</a>`;
       const nota = el('rodape-lugares');
       const lista = el('lugares');
       lista.innerHTML = '';
       if (estado.situacao === 'inicio') {
           nota.innerHTML = `Informe sua localização para ver os serviços mais próximos. ${mapas}.`;
           return;
       }
       if (estado.situacao === 'buscando') {
           nota.textContent = 'Buscando serviços de saúde próximos…';
           return;
       }
       if (estado.situacao === 'erro') {
           nota.innerHTML = `Não foi possível consultar o mapa agora. ${mapas}.`;
           return;
       }
       const itens = estado.lugares.filter((l) => l.categoria === estado.categoria).slice(0, 8);
       lista.innerHTML = itens
           .map((l) => {
               const tel = l.telefone.replace(/[^\d+]/g, '');
               return `<li class="consulta">
                   <div>
                       <strong>${esc(l.nome)}</strong>
                       <span>${l.publico ? '<b class="selo">Rede pública (SUS)</b>' : ''}${esc(l.endereco || 'Endereço não informado')}</span>
                   </div>
                   <div class="lugar-acoes">
                       <b>${formatarKm(l.km)}</b>
                       ${tel ? `<a href="tel:${tel}">Ligar</a>` : ''}
                       <a class="btn ghost" href="https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lon}" target="_blank" rel="noopener">Como chegar</a>
                   </div>
               </li>`;
           })
           .join('');
       nota.innerHTML = itens.length
           ? `Até 8 resultados em ${RAIO / 1000} km. Dados do OpenStreetMap, que podem estar incompletos ou desatualizados: confirme horário e telefone antes de ir. ${mapas}.`
           : `Nenhum serviço deste tipo encontrado em ${RAIO / 1000} km no OpenStreetMap. Os dados podem estar incompletos. ${mapas}.`;
   }
    
   function infoLocal(p, km) {
       if (!p.local) return 'Atende online, de qualquer lugar.';
       const lugar = `${p.local.bairro}, ${p.local.cidade}`;
       const online = p.atendimento.includes('online') ? ' Também atende online.' : '';
       return km == null ? `Consultório em ${lugar}.${online}` : `Consultório a ${formatarKm(km)} (${lugar}).${online}`;
   }
    
   function desenharProfissionais() {
       const itens = PROFISSIONAIS.map((p) => ({
           p,
           km: estado.lat != null && p.local ? distanciaKm(estado.lat, estado.lon, p.local.lat, p.local.lon) : null,
       }));
       itens.sort((a, b) => (a.km ?? Infinity) - (b.km ?? Infinity));
       el('lista').innerHTML = itens
           .map(({ p, km }) =>
               cartaoProfissional(p, 'Agendar', `agendamento.html?profissional=${p.slug}`, '', infoLocal(p, km)),
           )
           .join('');
       const perto = Math.min(...itens.map((i) => i.km ?? Infinity));
       el('aviso-prof').textContent =
           estado.lat == null
               ? 'Informe sua localização acima para ver os consultórios mais próximos primeiro.'
               : perto > 50
                 ? 'Os consultórios de exemplo ficam a mais de 50 km de você. O atendimento online continua disponível.'
                 : 'Ordenados do consultório mais próximo ao mais distante. Atendimento só online aparece por último.';
   }
    
   async function definirLocal(lat, lon, rotulo) {
       Object.assign(estado, { lat, lon, situacao: 'buscando' });
       mostrarStatus(`Localização definida: ${rotulo}.`, 'ok');
       desenharLugares();
       desenharProfissionais();
       try {
           estado.lugares = await buscarLugares(lat, lon);
           estado.situacao = 'pronto';
       } catch (e) {
           estado.situacao = 'erro';
       }
       desenharLugares();
   }
    
   el('usar-local').addEventListener('click', () => {
       if (!navigator.geolocation) {
           mostrarStatus('Seu navegador não oferece localização. Digite sua cidade ou bairro.', 'erro');
           return;
       }
       mostrarStatus('Aguardando a permissão de localização…', '');
       navigator.geolocation.getCurrentPosition(
           (pos) => definirLocal(pos.coords.latitude, pos.coords.longitude, 'sua localização atual'),
           () => mostrarStatus('Não foi possível obter sua localização. Digite sua cidade ou bairro.', 'erro'),
           { timeout: 10000, maximumAge: 300000 },
       );
   });
    
   el('form-local').addEventListener('submit', async (e) => {
       e.preventDefault();
       const texto = el('endereco').value.trim();
       if (!texto) return;
       mostrarStatus('Procurando…', '');
       try {
           const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=';
           const [achado] = await (await fetch(url + encodeURIComponent(texto))).json();
           if (!achado) {
               mostrarStatus('Não encontramos esse local. Tente incluir a cidade.', 'erro');
               return;
           }
           definirLocal(+achado.lat, +achado.lon, achado.display_name.split(',').slice(0, 2).join(','));
       } catch (err) {
           mostrarStatus('Não foi possível buscar agora. Tente de novo em instantes.', 'erro');
       }
   });
    
   document.querySelectorAll('[data-cat]').forEach((b) =>
       b.addEventListener('click', () => {
           estado.categoria = b.dataset.cat;
           desenharLugares();
       }),
   );
    
   desenharLugares();
   desenharProfissionais();
    