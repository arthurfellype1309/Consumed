/* ADICIONE ESTAS FUNÇÕES NO INÍCIO */

// Salvar no backend em vez de localStorage
function lerConsultas() {
    return fetch('/api/consultas')
        .then(r => r.json())
        .catch(() => []);  // Se falhar, retorna array vazio
}

function salvarConsultas(lista) {
    // Agora não usa mais localStorage!
    // Cada consulta é salva individualmente via API
}

// MUDE ESTA FUNÇÃO EXISTENTE:
// Mude de localStorage para chamadas de API
async function indisponivel(p, dia, hora) {
    // Verifica se passou
    if (new Date(`${dia}T${hora}`) <= new Date()) return true;
    
    // Verifica se está agendado (consultando backend)
    try {
        const response = await fetch(`/api/horarios-ocupados/${p.slug}/${dia}`);
        const ocupados = await response.json();
        return ocupados.includes(hora);
    } catch {
        return false;
    }
}

// MUDE ESTA FUNÇÃO EXISTENTE:
// Adaptado para usar API em vez de localStorage
el('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const p = profissional();
    if (!p || !estado.data || !estado.hora) {
        mostrar('Escolha o profissional, o dia e o horário.', 'erro');
        return;
    }
    if (!e.target.reportValidity()) return;
    
    // Verifica se ainda está disponível
    if (await indisponivel(p, estado.data, estado.hora)) {
        mostrar('Esse horário acabou de ser ocupado. Escolha outro.', 'erro');
        desenharHoras();
        return;
    }
    
    const consulta = {
        id: 'CM-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
        slug: p.slug,
        data: estado.data,
        hora: estado.hora,
        atendimento: el('atend').value,
        paciente: el('nome').value.trim(),
        email: el('email').value.trim(),  // Adicionado email
    };
    
    // Salva no backend
    try {
        const response = await fetch('/api/salvar-consulta', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(consulta)
        });
        
        if (!response.ok) {
            const erro = await response.json();
            mostrar(erro.erro || 'Erro ao salvar', 'erro');
            desenharHoras();
            return;
        }
        
        mostrar(`Consulta confirmada para ${porExtenso(consulta.data)}, às ${consulta.hora}. Código ${consulta.id}.`, 'ok');
        estado.hora = '';
        desenharHoras();
        desenharResumo();
        await desenharMinhas();
    } catch (erro) {
        mostrar('Erro de conexão ao salvar', 'erro');
    }
});

// MUDE ESTA FUNÇÃO EXISTENTE:
// Para cancelar via API
el('minhas').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cancelar]');
    if (!b) return;
    
    try {
        const response = await fetch(`/api/cancelar-consulta/${b.dataset.cancelar}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            desenharHoras();
            await desenharMinhas();
        }
    } catch (erro) {
        console.error('Erro ao cancelar:', erro);
    }
});

// MUDE ESTA FUNÇÃO EXISTENTE:
// Para carregar "Minhas consultas" do backend
async function desenharMinhas() {
    try {
        const consultas = await lerConsultas();
        const ordenadas = consultas.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));
        el('sem-consultas').hidden = ordenadas.length > 0;
        el('minhas').innerHTML = ordenadas
            .map((c) => {
                const p = PROFISSIONAIS.find((x) => x.slug === c.slug);
                return `<li class="consulta">
                    <div>
                        <strong>${esc(p ? p.nome : c.slug)}</strong>
                        <span>${porExtenso(c.data)}, ${esc(c.hora)} (${esc(ROTULOS_ATENDIMENTO[c.atendimento] || '')}). Código ${esc(c.id)}</span>
                    </div>
                    <button class="btn ghost" type="button" data-cancelar="${esc(c.id)}">Cancelar</button>
                </li>`;
            })
            .join('');
    } catch (erro) {
        console.error('Erro ao carregar consultas:', erro);
    }
}

// MUDE A INICIALIZAÇÃO NO FINAL:
const inicial = new URLSearchParams(location.search).get('profissional');
desenharAviso();
desenharProfissionais();
desenharDias();
desenharHoras();
desenharAtendimento();
desenharResumo();
desenharMinhas();  // Agora é async, vai carregar do backend
if (PROFISSIONAIS.some((p) => p.slug === inicial)) escolherProfissional(inicial);