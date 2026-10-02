/* Login e cadastro. Profissionais entram com a conta fornecida pela clínica; pacientes podem criar a própria. */
const el = (id) => document.getElementById(id);
const formularios = { entrar: el('form-entrar'), cadastro: el('form-cadastro') };
const destinoSeguro = (valor) => (/^[a-z]+\.html$/.test(valor || '') ? valor : 'agendamento.html');
const proximo = destinoSeguro(new URLSearchParams(location.search).get('next'));
 
function mostrar(texto, tipo) {
    el('msg').textContent = texto;
    el('msg').className = 'aviso ' + tipo;
}
 
document.querySelectorAll('[data-form]').forEach((aba) =>
    aba.addEventListener('click', () => {
        document.querySelectorAll('[data-form]').forEach((a) => a.setAttribute('aria-pressed', a === aba));
        Object.entries(formularios).forEach(([nome, f]) => (f.hidden = nome !== aba.dataset.form));
        mostrar('', '');
    }),
);
 
function depoisDoLogin(usuario) {
    location.href = usuario.papel === 'profissional' ? 'painel.html' : proximo;
}
 
formularios.entrar.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        depoisDoLogin(await api('/api/login', 'POST', { email: el('e-email').value, senha: el('e-senha').value }));
    } catch (erro) {
        mostrar(erro.message, 'erro');
    }
});
 
formularios.cadastro.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        depoisDoLogin(
            await api('/api/cadastro', 'POST', {
                nome: el('c-nome').value,
                email: el('c-email').value,
                senha: el('c-senha').value,
            }),
        );
    } catch (erro) {
        mostrar(erro.message, 'erro');
    }
});
 
sessao.then((s) => {
    if (s.logado) depoisDoLogin(s);
});
 