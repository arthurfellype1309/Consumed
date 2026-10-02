/* Agendamentos: escolha de profissional, dia e horário com backend Python.
   As consultas ficam no banco de dados SQLite via API Flask. */

const CHAVE = 'consumed.consultas';
const el = (id) => document.getElementById(id);
const estado = { slug: '', data: '', hora: '' };

const profissional = () => PROFISSIONAIS.find((p) => p.slug === estado.slug);
const iso = (d) =>
    [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const porExtenso = (dia) =>
    new Date(dia + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

/* Próximos 7 dias em que o profissional atende */
function proximosDias(p) {
    const hoje = new Date();
    const dias = [];
    for (let i = 0; dias.length < 7 && i < 30; i++) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i);
        if (p.dias.includes(d.getDay())) dias.push(iso(d));
    }
    return dias;
}

/* Verifica se horário está indisponível */
async function indisponivel(p, dia, hora) {
    // Se passou
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

/* Filtros vindos da index */
const parametros = new URLSearchParams(location.search);
const filtroTipo = { medico: 'm', psicologo: 'p' }[parametros.get('profissional')] || '';
const filtroAtend = ['online', 'presencial'].includes(parametros.get('atendimento'))
    ? parametros.get('atendimento')
    : '';
const visiveis = () =>
    PROFISSIONAIS.filter(
        (p) => (!filtroTipo || p.tipo === filtroTipo) && (!filtroAtend || p.atendimento.includes(filtroAtend)),
    );

function desenharAviso() {
    if (!filtroTipo && !filtroAtend) return;
    const partes = [{ m: 'médicos', p: 'psicólogos' }[filtroTipo], filtroAtend].filter(Boolean);
    el('filtro-aviso').innerHTML = `Mostrando só: ${partes.join(', ')}. <a href="agendamento.html">Ver todos</a>`;
    el('filtro-aviso').hidden = false;
}

function desenharProfissionais() {
    el('profissionais-lista').innerHTML = visiveis()
        .map(
            (p) => `<button type="button" class="escolha ${p.tipo}" data-slug="${p.slug}" aria-pressed="${p.slug === estado.slug}">
            <b>${p.nome}</b><small>${p.especialidade}</small><small>R$ ${p.preco}</small>
        </button>`,
        )
        .join('');
}

function desenharDias() {
    const p = profissional();
    el('dias').innerHTML = p
        ? proximosDias(p)
              .map((d) => {
                  const semana = new Date(d + 'T00:00')
                      .toLocaleDateString('pt-BR', { weekday: 'short' })
                      .replace('.', '');
                  return `<button type="button" class="dia" data-dia="${d}" aria-pressed="${d === estado.data}">
                      <small>${semana}</small><b>${d.slice(8)}/${d.slice(5, 7)}</b>
                  </button>`;
              })
              .join('')
        : '';
    el('dica-dia').textContent = p ? '' : 'Escolha um profissional primeiro.';
}

async function desenharHoras() {
    const p = profissional();
    const caixa = el('horas');
    if (!p || !estado.data) {
        caixa.innerHTML = '';
        el('dica-hora').textContent = p ? 'Escolha um dia.' : '';
        return;
    }
    
    let html = '';
    for (const h of p.horarios) {
        const indispo = await indisponivel(p, estado.data, h);
        html += `<button type="button" class="hora" data-hora="${h}" aria-pressed="${h === estado.hora}" ${
            indispo ? 'disabled' : ''
        }>${h}</button>`;
    }
    
    caixa.innerHTML = html;
    el('dica-hora').textContent = caixa.querySelector('.hora:not(:disabled)')
        ? 'Horários riscados já estão ocupados.'
        : 'Sem horários livres neste dia. Tente outro dia.';
}

function desenharAtendimento() {
    const p = profissional();
    el('atend').innerHTML = p
        ? p.atendimento.map((a) => `<option value="${a}">${ROTULOS_ATENDIMENTO[a]}</option>`).join('')
        : '<option value="">Escolha um profissional</option>';
}

function desenharResumo() {
    const p = profissional();
    el('r-prof').textContent = p ? `${p.nome}, ${p.especialidade}` : 'Escolha um profissional';
    el('r-dia').textContent = estado.data ? porExtenso(estado.data) : 'Escolha um dia';
    el('r-hora').textContent = estado.hora || 'Escolha um horário';
}

async function desenharMinhas() {
    try {
        const response = await fetch('/api/consultas');
        const consultas = await response.json();
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

function mostrar(texto, tipo) {
    const msg = el('msg');
    msg.textContent = texto;
    msg.className = 'aviso ' + tipo;
}

function escolherProfissional(slug) {
    Object.assign(estado, { slug, data: '', hora: '' });
    desenharProfissionais();
    desenharDias();
    desenharHoras();
    desenharAtendimento();
    desenharResumo();
}

// Event listeners
el('profissionais-lista').addEventListener('click', (e) => {
    const b = e.target.closest('[data-slug]');
    if (b) escolherProfissional(b.dataset.slug);
});

el('dias').addEventListener('click', (e) => {
    const b = e.target.closest('[data-dia]');
    if (!b) return;
    Object.assign(estado, { data: b.dataset.dia, hora: '' });
    desenharDias();
    desenharHoras();
    desenharResumo();
});

el('horas').addEventListener('click', (e) => {
    const b = e.target.closest('[data-hora]');
    if (!b || b.disabled) return;
    estado.hora = b.dataset.hora;
    desenharHoras();
    desenharResumo();
});

el('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const p = profissional();
    if (!p || !estado.data || !estado.hora) {
        mostrar('Escolha o profissional, o dia e o horário.', 'erro');
        return;
    }
    if (!e.target.reportValidity()) return;
    
    if (await indisponivel(p, estado.data, estado.hora)) {
        mostrar('Esse horário acabou de ser ocupado. Escolha outro.', 'erro');
        await desenharHoras();
        return;
    }
    
    const consulta = {
        id: 'CM-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
        slug: p.slug,
        data: estado.data,
        hora: estado.hora,
        atendimento: el('atend').value,
        paciente: el('nome').value.trim(),
        email: el('email').value.trim(),
    };
    
    try {
        const response = await fetch('/api/salvar-consulta', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(consulta)
        });
        
        if (!response.ok) {
            const erro = await response.json();
            mostrar(erro.erro || 'Erro ao salvar', 'erro');
            await desenharHoras();
            return;
        }
        
        mostrar(`Consulta confirmada para ${porExtenso(consulta.data)}, às ${consulta.hora}. Código ${consulta.id}.`, 'ok');
        estado.hora = '';
        await desenharHoras();
        desenharResumo();
        await desenharMinhas();
    } catch (erro) {
        mostrar('Erro de conexão ao salvar', 'erro');
    }
});

el('minhas').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cancelar]');
    if (!b) return;
    
    try {
        const response = await fetch(`/api/cancelar-consulta/${b.dataset.cancelar}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await desenharHoras();
            await desenharMinhas();
        }
    } catch (erro) {
        console.error('Erro ao cancelar:', erro);
    }
});

// ========== INICIALIZAÇÃO ==========
// Carregar profissionais do backend e inicializar
fetch('/api/profissionais')
    .then(r => r.json())
    .then(dados => {
        window.PROFISSIONAIS = dados;
        
        // Agora inicializa a página
        const inicial = new URLSearchParams(location.search).get('profissional');
        desenharAviso();
        desenharProfissionais();
        desenharDias();
        desenharHoras();
        desenharAtendimento();
        desenharResumo();
        desenharMinhas();
        if (PROFISSIONAIS.some((p) => p.slug === inicial)) escolherProfissional(inicial);
    })
    .catch(err => {
        console.error('Erro ao carregar profissionais:', err);
    });