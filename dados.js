/* Dados fictícios dos profissionais, usados pelas páginas Especialidades e Agendamentos.
   Os bairros e as coordenadas em `local` são de exemplo (consultórios fictícios); no backend virão do cadastro.
   Com o backend em Python, esta lista passa a vir de uma API (por exemplo, GET /api/profissionais). */
   const PROFISSIONAIS = [
    {
        slug: 'helena-duarte',
        local: { bairro: 'Centro', cidade: 'Caruaru', lat: -8.284, lon: -35.97 },
        nome: 'Dra. Helena Duarte',
        tipo: 'm',
        especialidade: 'Clínica geral',
        grupo: 'geral',
        atendimento: ['presencial', 'online'],
        preco: 120,
        acesso: [],
        dias: [1, 2, 3, 4, 5],
        horarios: ['08:30', '09:30', '10:30', '14:00', '15:00', '16:30'],
    },
    {
        slug: 'otavio-pires',
        nome: 'Dr. Otávio Pires',
        tipo: 'm',
        especialidade: 'Clínica geral',
        grupo: 'geral',
        atendimento: ['online'],
        preco: 90,
        acesso: ['noite'],
        dias: [1, 2, 3, 4, 5],
        horarios: ['18:00', '19:00', '20:00'],
    },
    {
        slug: 'marina-lacerda',
        local: { bairro: 'Zona norte', cidade: 'Caruaru', lat: -8.265, lon: -35.972 },
        nome: 'Dra. Marina Lacerda',
        tipo: 'm',
        especialidade: 'Pediatria',
        grupo: 'crianca',
        atendimento: ['presencial'],
        preco: 150,
        acesso: ['acessivel'],
        dias: [2, 4, 5],
        horarios: ['09:00', '10:00', '11:00', '14:00'],
    },
    {
        slug: 'caio-meireles',
        nome: 'Caio Meireles',
        tipo: 'p',
        especialidade: 'Psicologia clínica',
        grupo: 'psi',
        atendimento: ['online'],
        preco: 50,
        acesso: ['valor-social'],
        dias: [1, 2, 3, 4, 5, 6],
        horarios: ['09:00', '10:00', '11:00', '15:00'],
    },
    {
        slug: 'bianca-torres',
        local: { bairro: 'Zona sul', cidade: 'Caruaru', lat: -8.304, lon: -35.978 },
        nome: 'Bianca Torres',
        tipo: 'p',
        especialidade: 'Psicologia infantil',
        grupo: 'crianca',
        atendimento: ['presencial'],
        preco: 70,
        acesso: ['libras'],
        dias: [1, 3, 4],
        horarios: ['14:00', '15:00', '16:00', '17:00'],
    },
];
 
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
        <h3>${p.nome}</h3>
        <p class="esp">${p.tipo === 'm' ? 'Médico(a)' : 'Psicólogo(a)'}, ${p.especialidade}</p>
        ${info ? `<p class="local">${info}</p>` : ''}
        <ul class="tags">${tags.map((t) => `<li>${t}</li>`).join('')}</ul>
        <a class="btn ghost" href="${href}">${rotulo}</a>
    </article>`;
}
 