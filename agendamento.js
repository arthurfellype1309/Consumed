/* Agendamentos: escolha de profissional, dia e horário. Dados e regras ficam no backend (consumed.py). */
const el = (id) => document.getElementById(id);
const estado = { slug: '', data: '', hora: '', ocupados: {}, texto: '', usuario: { logado: false } };
 
const profissional = () => PROFISSIONAIS.find((p) => p.slug === estado.slug);
const iso = (d) =>
    [d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')].join('-');
const porExtenso = (dia) =>
    new Date(dia + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
 
/* Filtros vindos da index: ?profissional=medico|psicologo&atendimento=online|presencial */
const parametros = new URLSearchParams(location.search);
const filtroTipo = { medico: 'm', psicologo: 'p' }[parametros.get('profissional')] || '';
const filtroAtend = ['online', 'presencial'].includes(parametros.get('atendimento'))
    ? parametros.get('atendimento')
    : '';
const visiveis = () =>
    PROFISSIONAIS.filter(
        (p) =>
            (!filtroTipo || p.tipo === filtroTipo) &&
            (!filtroAtend || p.atendimento.includes(filtroAtend)) &&
            normalizar(`${p.nome} ${p.especialidade}`).includes(normalizar(estado.texto)),
    );
 
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
 
const indisponivel = (dia, hora) =>
    new Date(`${dia}T${hora}`) <= new Date() || (estado.ocupados[dia] || []).includes(hora);
 
function mostrar(texto, tipo) {
    el('msg').textContent = texto;
    el('msg').className = 'aviso ' + tipo;
}
 
function desenharAviso() {
    if (!filtroTipo && !filtroAtend) return;
    const partes = [{ m: 'médicos', p: 'psicólogos' }[filtroTipo], filtroAtend].filter(Boolean);
    el('filtro-aviso').innerHTML = `Mostrando só: ${partes.join(', ')}. <a href="agendamento.html">Ver todos</a>`;
    el('filtro-aviso').hidden = false;
}
 
function desenharSugestoes() {
    const opcoes = new Set(PROFISSIONAIS.flatMap((p) => [p.nome, p.especialidade]));
    el('sugestoes-prof').innerHTML = [...opcoes].map((o) => `<option value="${esc(o)}"></option>`).join('');
}
 
function desenharProfissionais() {
    const lista = visiveis();
    el('profissionais-lista').innerHTML = lista.length
        ? lista
              .map(
                  (
                      p,
                  ) => `<button type="button" class="escolha ${p.tipo}" data-slug="${p.slug}" aria-pressed="${p.slug === estado.slug}">
                      <b>${esc(p.nome)}</b><small>${esc(p.especialidade)}</small><small>R$ ${p.preco}</small>
                  </button>`,
              )
              .join('')
        : '<p class="dica">Nenhum profissional encontrado. Tente outro nome ou especialidade.</p>';
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
 
function desenharHoras() {
    const p = profissional();
    const caixa = el('horas');
    if (!p || !estado.data) {
        caixa.innerHTML = '';
        el('dica-hora').textContent = p ? 'Escolha um dia.' : '';
        return;
    }
    caixa.innerHTML = p.horarios
        .map(
            (h) =>
                `<button type="button" class="hora" data-hora="${h}" aria-pressed="${h === estado.hora}" ${
                    indisponivel(estado.data, h) ? 'disabled' : ''
                }>${h}</button>`,
        )
        .join('');
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
 
function desenharConta() {
    const u = estado.usuario;
    const paciente = u.logado && u.papel === 'paciente';
    el('form').hidden = !paciente;
    el('aviso-login').hidden = paciente;
    el('aviso-login').innerHTML = u.logado
        ? 'Contas de profissional não agendam consultas. Use o <a href="painel.html">painel</a>.'
        : 'Para confirmar, <a href="login.html?next=agendamento.html">entre ou crie uma conta</a>.';
}
 
async function desenharMinhas() {
    const secao = el('secao-minhas');
    secao.hidden = !(estado.usuario.logado && estado.usuario.papel === 'paciente');
    if (secao.hidden) return;
    const consultas = await api('/api/consultas').catch(() => []);
    el('sem-consultas').hidden = consultas.length > 0;
    el('minhas').innerHTML = consultas
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
}
 
async function carregarOcupados() {
    estado.ocupados = estado.slug ? await api(`/api/ocupados/${estado.slug}`).catch(() => ({})) : {};
}
 
async function escolherProfissional(slug) {
    Object.assign(estado, { slug, data: '', hora: '' });
    await carregarOcupados();
    desenharProfissionais();
    desenharDias();
    desenharHoras();
    desenharAtendimento();
    desenharResumo();
}
 
el('busca-prof').addEventListener('input', (e) => {
    estado.texto = e.target.value;
    desenharProfissionais();
});
 
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
    if (!profissional() || !estado.data || !estado.hora) {
        mostrar('Escolha o profissional, o dia e o horário.', 'erro');
        return;
    }
    try {
        const r = await api('/api/consultas', 'POST', {
            slug: estado.slug,
            data: estado.data,
            hora: estado.hora,
            atendimento: el('atend').value,
        });
        mostrar(`Consulta confirmada para ${porExtenso(estado.data)}, às ${estado.hora}. Código ${r.id}.`, 'ok');
        estado.hora = '';
    } catch (erro) {
        mostrar(erro.message, 'erro');
    }
    await carregarOcupados();
    desenharHoras();
    desenharResumo();
    desenharMinhas();
});
 
el('minhas').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cancelar]');
    if (!b) return;
    await api(`/api/consultas/${b.dataset.cancelar}`, 'DELETE').catch((erro) => mostrar(erro.message, 'erro'));
    await carregarOcupados();
    desenharHoras();
    desenharMinhas();
});
 
async function iniciar() {
    [estado.usuario] = await Promise.all([sessao, carregarProfissionais()]);
    desenharAviso();
    desenharSugestoes();
    desenharProfissionais();
    desenharDias();
    desenharHoras();
    desenharAtendimento();
    desenharResumo();
    desenharConta();
    desenharMinhas();
    const inicial = parametros.get('profissional');
    if (PROFISSIONAIS.some((p) => p.slug === inicial)) escolherProfissional(inicial);
}
 
iniciar();
 