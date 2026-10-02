"""ConsuMed: servidor Flask + SQLite.
 
Rodar:  python consumed.py   (abre em http://127.0.0.1:5000)
Variáveis opcionais: CONSUMED_SECRET (chave das sessões), CONSUMED_SENHA_DEMO (senha dos profissionais de exemplo),
CONSUMED_DEBUG=1 (modo de desenvolvimento).
"""
import json
import os
import re
import secrets
import sqlite3
import time
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta
from functools import lru_cache, wraps
 
from flask import Flask, jsonify, request, send_from_directory, session
from werkzeug.security import check_password_hash, generate_password_hash
 
BASE = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(BASE, 'agendamento.db')
CHAVE_FILE = os.path.join(BASE, '.chave_secreta')
PAGINAS = {'index', 'agendamento', 'especialidades', 'login', 'painel'}
# Só estes tipos de arquivo são entregues ao navegador (nunca .py, .db etc.)
EXTENSOES = {'.css', '.js', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif', '.ico'}
SENHA_DEMO = os.environ.get('CONSUMED_SENHA_DEMO', 'demo-consumed-2026')
JANELA_DIAS = 30  # quantos dias à frente é possível agendar
 
EMAIL = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')
HORA = re.compile(r'^([01]\d|2[0-3]):[0-5]\d$')
 
app = Flask(__name__, static_folder=None)
 
 
def chave_secreta():
    if not os.path.exists(CHAVE_FILE):
        with open(CHAVE_FILE, 'w') as f:
            f.write(secrets.token_hex(32))
    with open(CHAVE_FILE) as f:
        return f.read().strip()
 
 
app.secret_key = os.environ.get('CONSUMED_SECRET') or chave_secreta()
app.config.update(SESSION_COOKIE_HTTPONLY=True, SESSION_COOKIE_SAMESITE='Lax')
 
# Profissionais de exemplo (fictícios). Depois de criados, ficam no banco e a agenda é editada pelo painel.
PROFISSIONAIS_INICIAIS = [
    {'slug': 'helena-duarte', 'local': {'bairro': 'Centro', 'cidade': 'Caruaru', 'lat': -8.284, 'lon': -35.97},
     'nome': 'Dra. Helena Duarte', 'tipo': 'm', 'especialidade': 'Clínica geral', 'grupo': 'geral',
     'chaves': ['general'], 'atendimento': ['presencial', 'online'], 'preco': 120, 'acesso': [],
     'dias': [1, 2, 3, 4, 5], 'horarios': ['08:30', '09:30', '10:30', '14:00', '15:00', '16:30']},
    {'slug': 'otavio-pires', 'nome': 'Dr. Otávio Pires', 'tipo': 'm', 'especialidade': 'Clínica geral',
     'grupo': 'geral', 'chaves': ['general'], 'atendimento': ['online'], 'preco': 90, 'acesso': ['noite'],
     'dias': [1, 2, 3, 4, 5], 'horarios': ['18:00', '19:00', '20:00']},
    {'slug': 'marina-lacerda', 'local': {'bairro': 'Zona norte', 'cidade': 'Caruaru', 'lat': -8.265, 'lon': -35.972},
     'nome': 'Dra. Marina Lacerda', 'tipo': 'm', 'especialidade': 'Pediatria', 'grupo': 'crianca',
     'chaves': ['paediatrics'], 'atendimento': ['presencial'], 'preco': 150, 'acesso': ['acessivel'],
     'dias': [2, 4, 5], 'horarios': ['09:00', '10:00', '11:00', '14:00']},
    {'slug': 'caio-meireles', 'nome': 'Caio Meireles', 'tipo': 'p', 'especialidade': 'Psicologia clínica',
     'grupo': 'psi', 'chaves': ['psico-tcc', 'psico-act'], 'atendimento': ['online'], 'preco': 50,
     'acesso': ['valor-social'], 'dias': [1, 2, 3, 4, 5, 6], 'horarios': ['09:00', '10:00', '11:00', '15:00']},
    {'slug': 'bianca-torres', 'local': {'bairro': 'Zona sul', 'cidade': 'Caruaru', 'lat': -8.304, 'lon': -35.978},
     'nome': 'Bianca Torres', 'tipo': 'p', 'especialidade': 'Psicologia infantil', 'grupo': 'crianca',
     'chaves': ['psico-infantil', 'psico-comportamental'], 'atendimento': ['presencial'], 'preco': 70,
     'acesso': ['libras'], 'dias': [1, 3, 4], 'horarios': ['14:00', '15:00', '16:00', '17:00']},
]
 
 
def db():
    con = sqlite3.connect(DB_FILE)
    con.row_factory = sqlite3.Row
    return con
 
 
def init_db():
    con = db()
    con.executescript('''
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            senha_hash TEXT NOT NULL,
            papel TEXT NOT NULL CHECK (papel IN ('paciente', 'profissional')),
            slug TEXT
        );
        CREATE TABLE IF NOT EXISTS profissionais (slug TEXT PRIMARY KEY, dados TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS consultas (
            id TEXT PRIMARY KEY,
            slug TEXT NOT NULL,
            data TEXT NOT NULL,
            hora TEXT NOT NULL,
            atendimento TEXT NOT NULL,
            usuario_id INTEGER,
            paciente TEXT NOT NULL,
            email TEXT NOT NULL,
            criado_em TEXT NOT NULL,
            UNIQUE (slug, data, hora)  -- o banco impede dois agendamentos no mesmo horário
        );
    ''')
    # Migração única: a tabela antiga "agendamentos" não tinha a restrição de horário único.
    if con.execute("SELECT 1 FROM sqlite_master WHERE name = 'agendamentos'").fetchone():
        con.execute('''INSERT OR IGNORE INTO consultas (id, slug, data, hora, atendimento, paciente, email, criado_em)
                       SELECT id, slug, data, hora, atendimento, paciente, email, COALESCE(criado_em, '')
                       FROM agendamentos''')
        con.execute('ALTER TABLE agendamentos RENAME TO agendamentos_antiga')
    if not con.execute('SELECT 1 FROM profissionais').fetchone():
        senha = generate_password_hash(SENHA_DEMO)
        for p in PROFISSIONAIS_INICIAIS:
            con.execute('INSERT INTO profissionais (slug, dados) VALUES (?, ?)', (p['slug'], json.dumps(p)))
            con.execute('INSERT OR IGNORE INTO usuarios (nome, email, senha_hash, papel, slug) VALUES (?, ?, ?, ?, ?)',
                        (p['nome'], f"{p['slug']}@consumed.example", senha, 'profissional', p['slug']))
        print(f'Profissionais de exemplo criados. Login: <slug>@consumed.example | senha: {SENHA_DEMO}')
    con.commit()
    con.close()
 
 
init_db()
 
 
# ---------- Arquivos do site (somente os permitidos) ----------
@app.route('/')
def inicio():
    return send_from_directory(BASE, 'index.html')
 
 
@app.route('/<nome>.html')
def pagina(nome):
    if nome not in PAGINAS:
        return jsonify(erro='Página não encontrada.'), 404
    return send_from_directory(BASE, f'{nome}.html')
 
 
@app.route('/<path:caminho>')
def arquivo(caminho):
    if os.path.splitext(caminho)[1].lower() not in EXTENSOES or any(p.startswith('.') for p in caminho.split('/')):
        return jsonify(erro='Não encontrado.'), 404
    return send_from_directory(BASE, caminho)
 
 
# ---------- Utilidades ----------
@app.before_request
def exigir_json():
    if request.path.startswith('/api/') and request.method in ('POST', 'PUT') and not request.is_json:
        return jsonify(erro='Envie os dados em JSON.'), 415
 
 
def usuario_atual():
    if not session.get('uid'):
        return None
    con = db()
    u = con.execute('SELECT * FROM usuarios WHERE id = ?', (session['uid'],)).fetchone()
    con.close()
    return u
 
 
def exigir(papel=None):
    def decorador(f):
        @wraps(f)
        def interno(*args, **kwargs):
            u = usuario_atual()
            if not u:
                return jsonify(erro='Faça login para continuar.'), 401
            if papel and u['papel'] != papel:
                return jsonify(erro='Acesso não permitido para este tipo de conta.'), 403
            return f(u, *args, **kwargs)
        return interno
    return decorador
 
 
def profissional(con, slug):
    r = con.execute('SELECT dados FROM profissionais WHERE slug = ?', (slug,)).fetchone()
    return json.loads(r['dados']) if r else None
 
 
def dia_js(d):  # 0 = domingo, como no JavaScript
    return (d.weekday() + 1) % 7
 
 
# ---------- Conta ----------
tentativas = {}  # limite simples de tentativas de login: (ip, email) -> [contagem, bloqueado_ate]
 
 
@app.post('/api/cadastro')
def cadastro():
    d = request.get_json(silent=True) or {}
    nome, email, senha = str(d.get('nome', '')).strip(), str(d.get('email', '')).strip().lower(), str(d.get('senha', ''))
    if not 2 <= len(nome) <= 80 or not EMAIL.match(email) or len(senha) < 8:
        return jsonify(erro='Informe nome, e-mail válido e senha com pelo menos 8 caracteres.'), 400
    con = db()
    try:
        cur = con.execute('INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES (?, ?, ?, ?)',
                          (nome, email, generate_password_hash(senha), 'paciente'))
        con.commit()
    except sqlite3.IntegrityError:
        return jsonify(erro='Já existe uma conta com esse e-mail.'), 409
    finally:
        con.close()
    session.clear()
    session['uid'] = cur.lastrowid
    return jsonify(nome=nome, papel='paciente')
 
 
@app.post('/api/login')
def login():
    d = request.get_json(silent=True) or {}
    email, senha = str(d.get('email', '')).strip().lower(), str(d.get('senha', ''))
    chave = (request.remote_addr, email)
    contagem, ate = tentativas.get(chave, [0, 0])
    if ate > time.time():
        return jsonify(erro='Muitas tentativas. Aguarde alguns minutos.'), 429
    con = db()
    u = con.execute('SELECT * FROM usuarios WHERE email = ?', (email,)).fetchone()
    con.close()
    if not u or not check_password_hash(u['senha_hash'], senha):
        contagem += 1
        tentativas[chave] = [contagem, time.time() + 300 if contagem >= 5 else 0]
        return jsonify(erro='E-mail ou senha incorretos.'), 401
    tentativas.pop(chave, None)
    session.clear()
    session['uid'] = u['id']
    return jsonify(nome=u['nome'], papel=u['papel'])
 
 
@app.post('/api/logout')
def logout():
    session.clear()
    return jsonify(ok=True)
 
 
@app.get('/api/eu')
def eu():
    u = usuario_atual()
    if not u:
        return jsonify(logado=False)
    return jsonify(logado=True, nome=u['nome'], papel=u['papel'], slug=u['slug'])
 
 
# ---------- Profissionais e horários ----------
@app.get('/api/profissionais')
def api_profissionais():
    con = db()
    lista = [json.loads(r['dados']) for r in con.execute('SELECT dados FROM profissionais ORDER BY rowid')]
    con.close()
    return jsonify(lista)
 
 
@app.get('/api/ocupados/<slug>')
def api_ocupados(slug):
    """Horários ocupados de um profissional (sem dados de pessoas), a partir de hoje."""
    con = db()
    linhas = con.execute('SELECT data, hora FROM consultas WHERE slug = ? AND data >= ?',
                         (slug, date.today().isoformat())).fetchall()
    con.close()
    saida = {}
    for r in linhas:
        saida.setdefault(r['data'], []).append(r['hora'])
    return jsonify(saida)
 
 
# ---------- Consultas do paciente ----------
@app.get('/api/consultas')
@exigir('paciente')
def minhas_consultas(u):
    con = db()
    linhas = con.execute('SELECT id, slug, data, hora, atendimento FROM consultas WHERE usuario_id = ? ORDER BY data, hora',
                         (u['id'],)).fetchall()
    con.close()
    return jsonify([dict(r) for r in linhas])
 
 
@app.post('/api/consultas')
@exigir('paciente')
def agendar(u):
    d = request.get_json(silent=True) or {}
    con = db()
    p = profissional(con, str(d.get('slug', '')))
    try:
        dia = date.fromisoformat(str(d.get('data', '')))
        hora = str(d.get('hora', ''))
        quando = datetime.fromisoformat(f'{dia.isoformat()}T{hora}')
    except ValueError:
        con.close()
        return jsonify(erro='Data ou horário inválido.'), 400
    atend = d.get('atendimento')
    if not p or atend not in p['atendimento'] or hora not in p['horarios'] or dia_js(dia) not in p['dias']:
        con.close()
        return jsonify(erro='Esse profissional não atende nessa data, horário ou modalidade.'), 400
    if not (datetime.now() < quando <= datetime.now() + timedelta(days=JANELA_DIAS)):
        con.close()
        return jsonify(erro='Escolha um horário futuro, dentro dos próximos 30 dias.'), 400
    codigo = 'CM-' + secrets.token_hex(3).upper()
    try:
        con.execute('''INSERT INTO consultas (id, slug, data, hora, atendimento, usuario_id, paciente, email, criado_em)
                       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                    (codigo, p['slug'], dia.isoformat(), hora, atend, u['id'], u['nome'], u['email'],
                     datetime.now().isoformat()))
        con.commit()
    except sqlite3.IntegrityError:
        return jsonify(erro='Esse horário acabou de ser ocupado. Escolha outro.'), 409
    finally:
        con.close()
    return jsonify(id=codigo)
 
 
@app.delete('/api/consultas/<codigo>')
@exigir()
def cancelar(u, codigo):
    con = db()
    c = con.execute('SELECT usuario_id, slug FROM consultas WHERE id = ?', (codigo,)).fetchone()
    dono = c and ((u['papel'] == 'paciente' and c['usuario_id'] == u['id'])
                  or (u['papel'] == 'profissional' and c['slug'] == u['slug']))
    if not dono:
        con.close()
        return jsonify(erro='Consulta não encontrada.'), 404
    con.execute('DELETE FROM consultas WHERE id = ?', (codigo,))
    con.commit()
    con.close()
    return jsonify(ok=True)
 
 
# ---------- Painel do profissional ----------
@app.get('/api/painel')
@exigir('profissional')
def painel(u):
    con = db()
    p = profissional(con, u['slug'])
    linhas = con.execute('''SELECT id, data, hora, atendimento, paciente, email FROM consultas
                            WHERE slug = ? AND data >= ? ORDER BY data, hora''',
                         (u['slug'], date.today().isoformat())).fetchall()
    con.close()
    return jsonify(profissional=p, consultas=[dict(r) for r in linhas])
 
 
@app.put('/api/painel/agenda')
@exigir('profissional')
def salvar_agenda(u):
    d = request.get_json(silent=True) or {}
    dias, horarios = d.get('dias'), d.get('horarios')
    if (not isinstance(dias, list) or not isinstance(horarios, list) or not dias or not horarios
            or not all(isinstance(x, int) and 0 <= x <= 6 for x in dias)
            or not all(isinstance(h, str) and HORA.match(h) for h in horarios) or len(horarios) > 24):
        return jsonify(erro='Escolha ao menos um dia e um horário válido (HH:MM).'), 400
    con = db()
    p = profissional(con, u['slug'])
    p['dias'], p['horarios'] = sorted(set(dias)), sorted(set(horarios))
    con.execute('UPDATE profissionais SET dados = ? WHERE slug = ?', (json.dumps(p), u['slug']))
    futuras = con.execute('SELECT data, hora FROM consultas WHERE slug = ? AND data >= ?',
                          (u['slug'], date.today().isoformat())).fetchall()
    fora = sum(1 for c in futuras if c['hora'] not in p['horarios'] or dia_js(date.fromisoformat(c['data'])) not in p['dias'])
    con.commit()
    con.close()
    return jsonify(profissional=p, fora_da_agenda=fora)
 
 
# ---------- Sugestões de lugares (busca com preenchimento automático) ----------
@lru_cache(maxsize=256)
def buscar_lugares(q):
    url = 'https://photon.komoot.io/api/?' + urllib.parse.urlencode({'q': q, 'limit': 6, 'bbox': '-74,-34,-34,6'})
    req = urllib.request.Request(url, headers={'User-Agent': 'ConsuMed-projeto-academico/1.0'})
    with urllib.request.urlopen(req, timeout=4) as r:
        dados = json.load(r)
    saida = []
    for f in dados.get('features', []):
        p = f['properties']
        lon, lat = f['geometry']['coordinates']
        partes = (p.get('name'), p.get('district') or p.get('locality'), p.get('city'), p.get('state'))
        saida.append({'rotulo': ', '.join(dict.fromkeys(x for x in partes if x)), 'lat': lat, 'lon': lon})
    return tuple(json.dumps(s) for s in saida)
 
 
@app.get('/api/lugares')
def lugares():
    q = request.args.get('q', '').strip().lower()
    if len(q) < 3:
        return jsonify([])
    try:
        return jsonify([json.loads(s) for s in buscar_lugares(q)])
    except Exception:
        return jsonify([])
 
 
if __name__ == '__main__':
    app.run(debug=os.environ.get('CONSUMED_DEBUG') == '1')
 