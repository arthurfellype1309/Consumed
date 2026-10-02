from flask import Flask, render_template_string, request, jsonify
import sqlite3
import os
from datetime import datetime

app = Flask(__name__, static_folder='.', static_url_path='')
DB_FILE = 'agendamento.db'

# 🗄️ Cria banco
def init_db():
    if not os.path.exists(DB_FILE):
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE agendamentos (
                id TEXT PRIMARY KEY,
                slug TEXT NOT NULL,
                data TEXT NOT NULL,
                hora TEXT NOT NULL,
                atendimento TEXT NOT NULL,
                paciente TEXT NOT NULL,
                email TEXT NOT NULL,
                criado_em TEXT
            )
        ''')
        conn.commit()
        conn.close()

init_db()

# 📄 Serve os HTMLs
@app.route('/')
def index():
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/agendamento.html')
def agendamento():
    with open('agendamento.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/especialidades.html')
def especialidades():
    with open('especialidades.html', 'r', encoding='utf-8') as f:
        return f.read()

# ========== APIs DE DADOS ==========

# 📱 API: Profissionais (NOVA!)
@app.route('/api/profissionais')
def api_profissionais():
    profissionais = [
        {
            'slug': 'helena-duarte',
            'local': {'bairro': 'Centro', 'cidade': 'Caruaru', 'lat': -8.284, 'lon': -35.97},
            'nome': 'Dra. Helena Duarte',
            'tipo': 'm',
            'especialidade': 'Clínica geral',
            'grupo': 'geral',
            'atendimento': ['presencial', 'online'],
            'preco': 120,
            'acesso': [],
            'dias': [1, 2, 3, 4, 5],
            'horarios': ['08:30', '09:30', '10:30', '14:00', '15:00', '16:30'],
        },
        {
            'slug': 'otavio-pires',
            'nome': 'Dr. Otávio Pires',
            'tipo': 'm',
            'especialidade': 'Clínica geral',
            'grupo': 'geral',
            'atendimento': ['online'],
            'preco': 90,
            'acesso': ['noite'],
            'dias': [1, 2, 3, 4, 5],
            'horarios': ['18:00', '19:00', '20:00'],
        },
        {
            'slug': 'marina-lacerda',
            'local': {'bairro': 'Zona norte', 'cidade': 'Caruaru', 'lat': -8.265, 'lon': -35.972},
            'nome': 'Dra. Marina Lacerda',
            'tipo': 'm',
            'especialidade': 'Pediatria',
            'grupo': 'crianca',
            'atendimento': ['presencial'],
            'preco': 150,
            'acesso': ['acessivel'],
            'dias': [2, 4, 5],
            'horarios': ['09:00', '10:00', '11:00', '14:00'],
        },
        {
            'slug': 'caio-meireles',
            'nome': 'Caio Meireles',
            'tipo': 'p',
            'especialidade': 'Psicologia clínica',
            'grupo': 'psi',
            'atendimento': ['online'],
            'preco': 50,
            'acesso': ['valor-social'],
            'dias': [1, 2, 3, 4, 5, 6],
            'horarios': ['09:00', '10:00', '11:00', '15:00'],
        },
        {
            'slug': 'bianca-torres',
            'local': {'bairro': 'Zona sul', 'cidade': 'Caruaru', 'lat': -8.304, 'lon': -35.978},
            'nome': 'Bianca Torres',
            'tipo': 'p',
            'especialidade': 'Psicologia infantil',
            'grupo': 'crianca',
            'atendimento': ['presencial'],
            'preco': 70,
            'acesso': ['libras'],
            'dias': [1, 3, 4],
            'horarios': ['14:00', '15:00', '16:00', '17:00'],
        },
    ]
    return jsonify(profissionais)

# 📱 API: Consultas
@app.route('/api/consultas')
def api_consultas():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT id, slug, data, hora, atendimento, paciente FROM agendamentos ORDER BY data, hora')
    consultas = cursor.fetchall()
    conn.close()
    
    return jsonify([{
        'id': c[0],
        'slug': c[1],
        'data': c[2],
        'hora': c[3],
        'atendimento': c[4],
        'paciente': c[5]
    } for c in consultas])

# 📱 API: Horários ocupados
@app.route('/api/horarios-ocupados/<slug>/<data>')
def api_horarios_ocupados(slug, data):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT hora FROM agendamentos WHERE slug = ? AND data = ?', (slug, data))
    horarios_ocupados = [row[0] for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(horarios_ocupados)

# 📱 API: Salvar consulta
@app.route('/api/salvar-consulta', methods=['POST'])
def salvar_consulta():
    dados = request.json
    
    campos = ['id', 'slug', 'data', 'hora', 'atendimento', 'paciente', 'email']
    if not all(dados.get(c) for c in campos):
        return jsonify({'erro': 'Dados incompletos'}), 400
    
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    
    try:
        cursor.execute('''
            INSERT INTO agendamentos (id, slug, data, hora, atendimento, paciente, email, criado_em)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            dados['id'],
            dados['slug'],
            dados['data'],
            dados['hora'],
            dados['atendimento'],
            dados['paciente'],
            dados['email'],
            datetime.now().isoformat()
        ))
        conn.commit()
        return jsonify({'sucesso': True})
    except sqlite3.IntegrityError:
        return jsonify({'erro': 'Esse horário já foi agendado'}), 409
    except Exception as e:
        return jsonify({'erro': str(e)}), 500
    finally:
        conn.close()

# 📱 API: Cancelar consulta
@app.route('/api/cancelar-consulta/<consulta_id>', methods=['DELETE'])
def cancelar_consulta(consulta_id):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM agendamentos WHERE id = ?', (consulta_id,))
    conn.commit()
    conn.close()
    
    return jsonify({'sucesso': True})

if __name__ == '__main__':
    app.run(debug=True)