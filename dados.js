/* Funções e dados compartilhados pelas páginas.
   Os profissionais vêm do backend (GET /api/profissionais); aqui só guardamos a lista carregada. */
   const PROFISSIONAIS = [];
 
   async function carregarProfissionais() {
       try {
           const resposta = await fetch('/api/profissionais');
           if (resposta.ok) PROFISSIONAIS.splice(0, PROFISSIONAIS.length, ...(await resposta.json()));
       } catch (erro) {
           console.error('Não foi possível carregar os profissionais:', erro);
       }
   }
    
   /* Chamadas à API com JSON. Em caso de erro, lança uma exceção com a mensagem do servidor. */
   async function api(url, metodo = 'GET', corpo) {
       const resposta = await fetch(url, {
           method: metodo,
           headers: { 'Content-Type': 'application/json' },
           body: corpo === undefined ? undefined : JSON.stringify(corpo),
       });
       const dados = await resposta.json().catch(() => ({}));
       if (!resposta.ok) throw new Error(dados.erro || 'Algo deu errado. Tente novamente.');
       return dados;
   }
    
   const ROTULOS_ATENDIMENTO = { online: 'Online', presencial: 'Presencial' };
   const ROTULOS_ACESSO = {
       'valor-social': 'Valor social',
       libras: 'Atende em Libras',
       acessivel: 'Local acessível',
       noite: 'Horário à noite',
   };
    
   /* Escapa texto antes de colocá-lo em innerHTML */
   function esc(texto) {
       const mapa = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
       return String(texto).replace(/[&<>"']/g, (c) => mapa[c]);
   }
    
   /* Remove acentos e põe em minúsculas, para comparar textos digitados */
   const normalizar = (texto) =>
       String(texto)
           .normalize('NFD')
           .replace(/[\u0300-\u036f]/g, '')
           .toLowerCase();
    
   /* Cartão de profissional (mesmo HTML usado na index) */
   function cartaoProfissional(p, rotulo, href, extra = '', info = '') {
       const iniciais = p.nome
           .replace(/^Dra?\.\s/, '')
           .split(' ')
           .map((w) => w[0])
           .slice(0, 2)
           .join('');
       const preco = p.acesso.includes('valor-social') ? `Valor social R$ ${p.preco}` : `R$ ${p.preco}`;
       const tags = [
           ...p.atendimento.map((a) => ROTULOS_ATENDIMENTO[a]),
           preco,
           ...p.acesso.filter((a) => a !== 'valor-social').map((a) => ROTULOS_ACESSO[a]),
       ];
       return `<article class="pro ${p.tipo}${extra}" id="${p.slug}">
           <div class="av" aria-hidden="true">${iniciais}</div>
           <h3>${esc(p.nome)}</h3>
           <p class="esp">${p.tipo === 'm' ? 'Médico(a)' : 'Psicólogo(a)'}, ${esc(p.especialidade)}</p>
           ${info ? `<p class="local">${info}</p>` : ''}
           <ul class="tags">${tags.map((t) => `<li>${t}</li>`).join('')}</ul>
           <a class="btn ghost" href="${href}">${rotulo}</a>
       </article>`;
   }
    