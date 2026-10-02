/* Painel do profissional: consultas marcadas e edição de dias e horários de atendimento. */
const el = (id) => document.getElementById(id);
const SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const estado = { horarios: [] };
 
function mostrar(texto, tipo) {
    el('msg').textContent = texto;
    el('msg').className = 'aviso ' + tipo;
}
 
const porExtenso = (dia) =>
    new Date(dia + 'T00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
 
function desenharDias(dias) {
    el('dias-semana').innerHTML = SEMANA.map(
        (nome, i) =>
            `<label class="check"><input type="checkbox" value="${i}" ${dias.includes(i) ? 'checked' : ''} />${nome}</label>`,
    ).join('');
}
 
function desenharHorarios() {
    el('horarios').innerHTML = estado.horarios
        .map((h) => `<button type="button" class="hora" data-h="${h}" title="Remover ${h}">${h} ×</button>`)
        .join('');
}
 
function desenharConsultas(consultas) {
    el('sem-consultas').hidden = consultas.length > 0;
    el('consultas').innerHTML = consultas
        .map(
            (c) => `<li class="consulta">
                <div>
                    <strong>${esc(c.paciente)}</strong>
                    <span>${porExtenso(c.data)}, ${esc(c.hora)} (${esc(ROTULOS_ATENDIMENTO[c.atendimento] || '')}). ${esc(c.email)}. Código ${esc(c.id)}</span>
                </div>
                <button class="btn ghost" type="button" data-cancelar="${esc(c.id)}">Cancelar</button>
            </li>`,
        )
        .join('');
}
 
async function carregar() {
    try {
        const dados = await api('/api/painel');
        el('ola').textContent = `${dados.profissional.nome}, ${dados.profissional.especialidade}`;
        estado.horarios = dados.profissional.horarios;
        desenharDias(dados.profissional.dias);
        desenharHorarios();
        desenharConsultas(dados.consultas);
    } catch (erro) {
        location.href = 'login.html?next=painel.html';
    }
}
 
el('adicionar').addEventListener('click', () => {
    const h = el('novo-horario').value;
    if (h && !estado.horarios.includes(h)) estado.horarios = [...estado.horarios, h].sort();
    el('novo-horario').value = '';
    desenharHorarios();
});
 
el('horarios').addEventListener('click', (e) => {
    const b = e.target.closest('[data-h]');
    if (!b) return;
    estado.horarios = estado.horarios.filter((h) => h !== b.dataset.h);
    desenharHorarios();
});
 
el('form-agenda').addEventListener('submit', async (e) => {
    e.preventDefault();
    const dias = [...document.querySelectorAll('#dias-semana input:checked')].map((i) => +i.value);
    try {
        const r = await api('/api/painel/agenda', 'PUT', { dias, horarios: estado.horarios });
        mostrar(
            r.fora_da_agenda
                ? `Agenda salva. Atenção: ${r.fora_da_agenda} consulta(s) já marcada(s) ficaram fora da nova agenda.`
                : 'Agenda salva.',
            r.fora_da_agenda ? 'erro' : 'ok',
        );
    } catch (erro) {
        mostrar(erro.message, 'erro');
    }
});
 
el('consultas').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-cancelar]');
    if (!b || !confirm('Cancelar esta consulta?')) return;
    try {
        await api(`/api/consultas/${b.dataset.cancelar}`, 'DELETE');
        carregar();
    } catch (erro) {
        mostrar(erro.message, 'erro');
    }
});
 
carregar();
 