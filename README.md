# ConsuMed

> Tirar a dificuldade do meio do caminho entre o paciente e a consulta médica.

O **ConsuMed** é uma plataforma de saúde que conecta pacientes e profissionais em um só lugar. O usuário descobre qual especialidade procurar, encontra profissionais, vê os horários disponíveis e agenda a consulta de forma simples e organizada. A plataforma também ajuda a localizar serviços de saúde próximos (UPA, UBS, CAPS, hospitais e clínicas), inclusive da rede pública (SUS).

Projeto acadêmico alinhado ao **ODS 3, Saúde e Bem-estar**.

> **Status:** protótipo funcional com front-end e back-end. O servidor em Python (Flask + SQLite) cuida de contas, login, profissionais, agenda e consultas. Os profissionais e consultórios são fictícios (veja as [limitações](#limitações-do-protótipo) e os [próximos passos](#8-diferencial-impacto-e-próximos-passos)).

## Sumário

1. [O problema: a escassez de agendamentos no Brasil](#1-o-problema-a-escassez-de-agendamentos-no-brasil)
2. [A solução](#2-a-solução)
3. [Objetivo de Desenvolvimento Sustentável (ODS)](#3-objetivo-de-desenvolvimento-sustentável-ods)
4. [Tecnologias utilizadas](#4-tecnologias-utilizadas)
5. [Como executar o projeto](#5-como-executar-o-projeto)
6. [Equipe e divisão de tarefas](#6-equipe-e-divisão-de-tarefas)
7. [Evolução do projeto](#7-evolução-do-projeto)
8. [Diferencial, impacto e próximos passos](#8-diferencial-impacto-e-próximos-passos)
9. [Pitch](#9-pitch)

---

## 1. O problema: a escassez de agendamentos no Brasil

Conseguir uma consulta no tempo certo é um desafio em todo o sistema de saúde brasileiro: no **SUS**, nos **planos de saúde** e também no **atendimento particular**. Além de faltarem vagas em algumas áreas, falta informação organizada sobre quem atende, onde e quando.

> Os dados abaixo foram consultados em outubro de 2026, em fontes listadas ao final desta seção. Antes de apresentá-los, confira se há versões mais recentes.

### 1.1 No SUS (rede pública)

- **Espera média nacional:** reportagem de setembro de 2026 aponta que o tempo médio para conseguir uma consulta na rede pública no Brasil foi de **57 dias**.
- **Variação por especialidade e por estado:** em Minas Gerais, a espera por algumas especialidades varia de **46 a 234 dias**. Naquele estado, endocrinologia tinha espera de cerca de 4 meses e uma fila de aproximadamente 11 mil pessoas, e urologia, cerca de 3 meses e 4 mil pessoas.
- **Percepção da população:** pesquisa do Instituto Locomotiva, divulgada em 2025, ouviu a Classe C. Para **60%**, a espera por consulta com especialista foi muito longa; para **56%**, a espera por exames; e para **46%**, a espera por clínico geral. Cerca de **24%** disseram que a saúde piorou por causa da demora, e **94%** concordam que a espera coloca vidas em risco.
- **Cirurgias:** levantamento do jornal O Globo (2025) mostrou prazos em patamar recorde após a pandemia, com espera média que chega a **634 dias** em algumas unidades da federação.
- **Falta de transparência:** a ausência de uma fila unificada, em alguns estados, dificulta planejar e acompanhar o problema.
- **Faltas em consultas agendadas (absenteísmo):** estudos sobre a atenção especializada apontam que as faltas dos pacientes agravam a espera, porque vagas ficam ociosas.
- **Resposta do governo:** o Ministério da Saúde mantém o programa **Agora Tem Especialistas**, criado para reduzir o tempo de espera por atendimento especializado.

### 1.2 Nos planos de saúde

- Em junho de 2026, os planos de assistência médica somavam cerca de **53,1 milhões de vínculos**, o que corresponde a aproximadamente **25% da população** (um mesmo beneficiário pode ter mais de um vínculo). Ou seja, a maior parte dos brasileiros não tem plano e depende do SUS.
- **Ter plano não elimina a espera.** A ANS fixa prazos máximos para o agendamento (RN 566/2022), contados em dias úteis:

| Tipo de atendimento | Prazo máximo |
|---|---|
| Consulta em pediatria, clínica médica, cirurgia geral, ginecologia e obstetrícia | 7 dias úteis |
| Demais especialidades médicas | 14 dias úteis |
| Psicólogo, fonoaudiólogo, nutricionista, terapeuta ocupacional e fisioterapeuta | 10 dias úteis |
| Urgência e emergência | Imediato |

- Descumprir o prazo e manter rede credenciada insuficiente estão entre os motivos de reclamação na ANS. A operadora tem até 5 dias úteis para responder às reclamações assistenciais, e a agência acompanha os resultados a cada trimestre, podendo suspender a venda de planos das operadoras com pior desempenho. A existência dessas regras e desses canais mostra que a demora também ocorre na rede privada.

> Confirme os prazos atuais no site da ANS antes de apresentá-los.

### 1.3 No atendimento particular

Quem paga a consulta diretamente costuma conseguir atendimento mais rápido, mas o custo é uma barreira para quem tem menos renda. Não encontramos uma estatística nacional comparável de tempo de espera para esse segmento.

- [Se a equipe encontrar dados sobre espera ou preço no atendimento particular, inclua aqui]

### 1.4 A distribuição desigual de médicos

Segundo a *Demografia Médica no Brasil 2025* (FMUSP e CFM):

- O Brasil tem **2,98 médicos por mil habitantes**, abaixo da média da OCDE (3,70).
- Por região: **Sudeste 3,77**, **Nordeste 2,21** e **Norte 1,70** por mil habitantes. O Distrito Federal tem **6,28** e o Maranhão, **1,27**.
- **48 cidades** com mais de 500 mil habitantes concentram **31% da população** e **58% dos médicos**.
- As capitais têm, em média, **3,66 vezes mais médicos por mil habitantes** do que o interior de seus estados.
- Em municípios com até 5 mil habitantes, a razão cai para **0,51** por mil.
- Em 2024, **19 macrorregiões de saúde** tinham menos de um médico por mil habitantes, muitas no Norte e no Nordeste.
- Especialistas por 100 mil habitantes: **453** no Distrito Federal e **244** em São Paulo, contra **68** no Maranhão e **70** no Pará.

### 1.5 O que isso significa para o ConsuMed

O problema tem várias causas: falta de vagas e de especialistas em certas regiões, concentração de médicos nas grandes cidades, filas pouco transparentes, faltas em consultas e dificuldade de achar informação. O ConsuMed **não cria vagas nem elimina as filas do SUS**, mas ataca a parte da dificuldade que a tecnologia consegue reduzir:

- **Orientação:** quem não sabe qual especialidade procurar recebe uma sugestão.
- **Organização:** profissionais, dias e horários aparecem em um só lugar, em três passos.
- **Rede pública:** UBS, UPA, CAPS e hospitais próximos aparecem do mais perto ao mais longe, com telefone e rota.
- **Distância:** o atendimento online alcança quem mora longe de centros com mais médicos.
- **Custo e acesso:** filtros de valor social, Libras, local acessível e horário à noite.

### Fontes desta seção

- Brasil de Fato, 18/09/2026, sobre filas no SUS em Minas Gerais: <https://www.brasildefato.com.br/2026/09/18/falta-de-articulacao-do-governo-estadual-expoe-filas-por-consultas-e-exames-no-sus-em-mg/>
- CNN Brasil, pesquisa do Instituto Locomotiva: <https://www.cnnbrasil.com.br/nacional/sudeste/sp/fila-do-sus-coloca-vida-da-populacao-em-risco-diz-pesquisa/>
- Oncoguia, reportagem do jornal O Globo sobre cirurgias: <https://www.oncoguia.org.br/conteudo/entre-a-fila-do-sus-e-a-vida-prazo-para-cirurgia-mantem-patamar-recorde-pospandemia-e-espera-pode-durar-ate-634-dias-em-media/17693/7/>
- Saúde em Debate (SciELO), tempo de espera e absenteísmo: <https://www.scielo.br/j/sdeb/a/GPfqjbXJDNnPWMZ5TnDPyKN/?format=html&lang=pt>
- CartaCapital, edição 1402, 04/03/2026, sobre o programa Agora Tem Especialistas
- ANS, números de beneficiários: <https://www.gov.br/ans/pt-br/assuntos/noticias/numeros-do-setor/ans-divulga-numeros-de-beneficiarios-em-marco> e Valor Saúde (junho/2026): <https://valoresaude.substack.com/p/saude-suplementar-ultrapassa-53-milhoes>
- Prazos máximos da ANS (RN 566/2022): <https://vilhenasilva.com.br/ans-esclarece-prazos-de-atendimento-dos-planos-de-saude-nao-mudaram/> e <https://eltonfernandes.com.br/reclamar-do-plano-de-saude-ans> (fontes secundárias; confirmar no site da ANS)
- Demografia Médica no Brasil 2025: Agência Brasil <https://agenciabrasil.ebc.com.br/saude/noticia/2025-04/brasil-deve-chegar-6357-mil-medicos-em-2025-mulheres-sao-maioria>, Estratégia MED <https://med.estrategia.com/portal/noticias/brasil-tera-635-mil-medicos-ate-o-fim-do-ano-confira-os-principais-dados-da-demografia-medica-2025/> e Cetrus <https://educa.cetrus.com.br/carreira-medica-demografia-medica-2025/>

## 2. A solução

O ConsuMed funciona como uma ponte entre pacientes e profissionais de saúde. O site tem três páginas principais, abertas a todos (início, agendamentos e especialidades), e duas páginas de conta (login e painel do profissional). Os dados e as regras ficam no back-end (`consumed.py`); o navegador só exibe e envia pedidos à API.

### Início (`index.html`)

- Triagem simples ("O que está acontecendo?") que sugere a especialidade mais adequada e mostra profissionais indicados
- Busca direta por tipo de profissional (médico ou psicólogo) e por tipo de atendimento (online ou presencial)
- Apresentação dos serviços: consultas médicas, psicologia, atendimento online ou presencial, valor social, Libras e acessibilidade, horário à noite
- Profissionais com horário livre na semana e seção de contato

### Agendamentos (`agendamento.html`)

- Escolha em três passos: profissional, dia e horário
- Busca por nome ou especialidade, com sugestões de preenchimento automático
- Dias de atendimento do profissional nos próximos 7 dias em que ele atende, com horários já ocupados (ou já passados) bloqueados e riscados
- Resumo lateral com a escolha feita e seletor de atendimento (online ou presencial, conforme o que o profissional oferece)
- Para confirmar, é preciso estar logado como **paciente**. Sem login, a página mostra um link para entrar ou criar conta; contas de profissional são direcionadas ao painel
- A consulta usa o nome e o e-mail da conta e gera um código no formato `CM-XXXXXX` (seis caracteres hexadecimais)
- Só é possível agendar horários futuros, dentro dos próximos 30 dias
- Se dois pacientes escolherem o mesmo horário ao mesmo tempo, o banco recusa o segundo e a página avisa para escolher outro
- Lista "Minhas consultas", com opção de cancelar, visível apenas para pacientes logados
- Filtros recebidos pela busca da página inicial: `?profissional=medico|psicologo` e `?atendimento=online|presencial`, com aviso "Mostrando só..." e link para ver todos. Também é aceito o `slug` de um profissional (por exemplo, `?profissional=helena-duarte`), que já o deixa selecionado
- Dicas de preparação ("Antes da consulta") e aviso de crise (188) e emergência (192)

### Entrar (`login.html`)

- Duas abas: **Entrar** (e-mail e senha) e **Criar conta de paciente** (nome, e-mail e senha com no mínimo 8 caracteres)
- Pacientes se cadastram sozinhos. **Profissionais não se cadastram pelo site**: usam a conta fornecida pela equipe do ConsuMed
- Depois do login, o paciente volta para a página de origem (parâmetro `?next=`, aceito apenas para páginas `.html` do próprio site) e o profissional vai para o painel
- Quem já está logado é redirecionado automaticamente
- Depois de entrar, o menu mostra o nome da conta no ícone de usuário, o botão **Sair** e, para profissionais, o link **Painel**

### Painel do profissional (`painel.html`)

- Disponível apenas para contas de profissional; sem login, redireciona para `login.html?next=painel.html`
- **Próximas consultas** do profissional, com nome e e-mail do paciente, data, horário, tipo de atendimento e código, com opção de cancelar (pede confirmação)
- **Minha agenda:** o profissional escolhe os dias da semana de atendimento (caixas de seleção) e adiciona ou remove horários (campo de hora e botão "Adicionar"; clique no horário para remover)
- Exige ao menos um dia e um horário (formato `HH:MM`, no máximo 24 horários)
- Consultas já marcadas **não são apagadas** ao mudar a agenda; se alguma ficar fora da nova agenda, o painel mostra quantas

### Especialidades (`especialidades.html`)

- Explicação de cada especialidade e de quando procurá-la
- **Serviços de saúde perto de você:** a partir da localização do usuário (ou de uma cidade ou bairro digitado), lista serviços de cinco categorias (urgência e emergência, UBS e postos, CAPS, hospitais, clínicas e consultórios), do mais perto ao mais longe, com selo de rede pública (SUS), telefone ("Ligar") e rota ("Como chegar", no Google Maps)
  - Busca em um raio de **8 km**, com até **8 resultados** por categoria
  - Cada lugar é classificado pelo nome e pelas etiquetas do OpenStreetMap (por exemplo, "CAPS", "UPA", "UBS", "pronto-socorro"); o selo "Rede pública (SUS)" aparece quando o operador é público ou o nome indica serviço público
  - Cada categoria tem um texto de ajuda explicando para que serve (por exemplo, a UBS como porta de entrada do SUS) e um link para buscar a mesma categoria no Google Maps
  - O campo de cidade ou bairro tem **preenchimento automático** (sugestões vindas do back-end); se o texto não for uma sugestão, a página usa o Nominatim para localizar o endereço
  - Mensagens de estado para cada situação: aguardando permissão, buscando, erro de consulta e nenhum resultado (os dados do OpenStreetMap podem estar incompletos)
- **Filtro por especialidade ou abordagem:** 20 especialidades médicas (de clínica geral a alergia e imunologia) e 12 abordagens de psicologia (TCC, psicanálise, Gestalt, ACT, EMDR, entre outras). Ao escolher uma, os lugares passam a ser filtrados pelo nome ou pela etiqueta de especialidade do OpenStreetMap, e os profissionais que a atendem ganham destaque
- Profissionais ordenados primeiro pela especialidade escolhida e depois pela proximidade do consultório; quem atende só online aparece por último. Se os consultórios de exemplo estiverem a mais de 50 km, a página avisa que o atendimento online continua disponível
- Explicação dos termos usados nos perfis: online, presencial, valor social, Libras, local acessível e horário à noite
- Cartões de **prevenção** (vacinas, alimentação, atividade física, sono, dengue, sol, tabaco e álcool, saúde mental e consultas de rotina)
- Avisos de segurança em destaque: **192 (SAMU)** para risco de vida e **188 (CVV)** para crise emocional

### Profissionais de exemplo (dados fictícios)

| Profissional | Especialidade | Atendimento | Valor | Dias | Destaque |
|---|---|---|---|---|---|
| Dra. Helena Duarte | Clínica geral | Presencial e online | R$ 120 | Seg a sex | Consultório no Centro |
| Dr. Otávio Pires | Clínica geral | Online | R$ 90 | Seg a sex | Horário à noite |
| Dra. Marina Lacerda | Pediatria | Presencial | R$ 150 | Ter, qui e sex | Local acessível |
| Caio Meireles | Psicologia clínica | Online | R$ 50 | Seg a sáb | Valor social |
| Bianca Torres | Psicologia infantil | Presencial | R$ 70 | Seg, qua e qui | Atende em Libras |

### Acessibilidade, segurança e privacidade

- Marcação semântica e atributos ARIA (`aria-pressed`, `aria-live`, `aria-current`, rótulos em botões e campos)
- Animações desativadas para quem prefere movimento reduzido (`prefers-reduced-motion`)
- Textos inseridos dinamicamente na página passam por uma função de escape (`esc()`), que reduz o risco de injeção de HTML
- A localização do usuário fica no navegador e é enviada apenas ao OpenStreetMap para buscar os lugares próximos; o projeto não a armazena
- Avisos de emergência visíveis nas páginas de agendamento e de especialidades
- Senhas guardadas apenas como hash; sessão em cookie `HttpOnly` e `SameSite=Lax`, com chave secreta própria
- Bloqueio de 5 minutos após 5 tentativas de login erradas (por IP e e-mail)
- O servidor valida tudo de novo (datas, horários, modalidade, permissões) e só entrega arquivos de tipos permitidos (`.css`, `.js`, imagens), nunca `.py`, `.db` ou arquivos ocultos
- Pacientes só veem e cancelam as próprias consultas; profissionais, apenas as da sua agenda

### Limitações do protótipo

- Profissionais, consultórios e contas de exemplo são fictícios; não há integração com o SUS nem com operadoras de planos de saúde
- Na página inicial, os horários "Próximo horário" e os **Filtros de acesso** (valor social, Libras etc.) são apenas ilustrativos; o formulário de contato ainda não envia mensagens
- Não há lembretes nem confirmação de presença, e o cancelamento não avisa a outra parte
- O limite de tentativas de login fica na memória do servidor e é zerado ao reiniciá-lo
- Os dados do OpenStreetMap podem estar incompletos ou desatualizados, e a página avisa o usuário para confirmar horário e telefone

## 3. Objetivo de Desenvolvimento Sustentável (ODS)

**ODS escolhido:** ODS 3, Saúde e Bem-estar, em especial a meta de ampliar o acesso a serviços de saúde de qualidade (meta 3.8, cobertura universal de saúde; confirme na lista oficial da ONU).

**Como a tecnologia ajuda a atingir esse ODS:**

O ConsuMed usa tecnologia para reduzir as barreiras de acesso à saúde descritas na seção 1. A triagem orienta quem não sabe qual especialidade procurar, o agendamento mostra profissionais, dias e horários de forma organizada, e o mapa de serviços aponta a UBS, o CAPS ou a UPA mais próxima, incluindo a rede pública (SUS). O atendimento online alcança quem mora longe de regiões com mais médicos, e recursos como valor social, atendimento em Libras, locais acessíveis e horário à noite ampliam o acesso de quem tem menos renda, dificuldade de locomoção ou pouco tempo livre. Os avisos de emergência (192) e de apoio emocional (188) encaminham a pessoa ao serviço certo em situações críticas.

**Como medir o resultado (indicadores propostos):**

- Tempo necessário para encontrar um profissional e concluir um agendamento
- Número de agendamentos concluídos
- Uso da busca por serviços de saúde próximos
- Proporção de atendimentos online e de profissionais com valor social

## 4. Tecnologias utilizadas

| Camada | Tecnologia |
|---|---|
| Front-end | HTML5, CSS3 e JavaScript (sem frameworks) |
| Visual | Fontes Inter e Newsreader (Google Fonts); fundo animado com WebGL e efeito parallax |
| Back-end | Python 3 com Flask (API REST em JSON e entrega das páginas) |
| Banco de dados | SQLite (`agendamento.db`), criado automaticamente |
| Autenticação | Sessões do Flask e senhas com hash (Werkzeug) |
| Mapas e localização | API de geolocalização do navegador, Overpass API (busca de lugares) e Nominatim (busca de endereços), ambos do OpenStreetMap, e Photon (sugestões de local, via back-end) |
| Links externos | Google Maps, para busca e rotas |
| Ferramentas | GitHub, [Trello / Notion / outra, se usarem] |
| Licença | GNU GPL v3 |

## 5. Como executar o projeto

Requer **Python 3** e o Flask. O servidor entrega as páginas e a API, então abrir os `.html` direto no navegador não funciona (login e agendamento dependem da API).

```bash
# 1. Clonar o repositório
git clone [URL-DO-REPOSITORIO]

# 2. Entrar na pasta do projeto
cd [consumed]

# 3. Instalar a dependência
pip install flask

# 4. Iniciar o servidor
python consumed.py
```

Depois, abra `http://127.0.0.1:5000` no navegador.

Na primeira execução, o servidor cria sozinho o banco `agendamento.db`, a chave de sessão `.chave_secreta` e os cinco profissionais de exemplo. Cada um entra com `<slug>@consumed.example` (por exemplo, `helena-duarte@consumed.example`) e a senha de demonstração definida em `consumed.py`. Pacientes criam a conta pela página de login.

Variáveis de ambiente opcionais:

| Variável | Para que serve |
|---|---|
| `CONSUMED_SECRET` | Chave das sessões (se ausente, usa o arquivo `.chave_secreta`) |
| `CONSUMED_SENHA_DEMO` | Senha dos profissionais de exemplo (use outra fora de testes) |
| `CONSUMED_DEBUG=1` | Modo de desenvolvimento do Flask |

Observações:

- A busca de serviços de saúde próximos e as sugestões de local precisam de internet. A **geolocalização** do navegador só funciona em `localhost` ou `https`.
- O site espera a pasta `imagens/` (com `logo_nome.png` e `saude_bemestar.png`) ao lado dos arquivos HTML. Inclua-a no repositório.
- **Não publique** `.chave_secreta` nem `agendamento.db` no repositório: adicione ambos ao `.gitignore`.

### Estrutura de arquivos

```
index.html            Página inicial
agendamento.html      Agendamento de consultas
especialidades.html   Especialidades e rede de saúde
login.html            Entrar e criar conta de paciente
painel.html           Painel do profissional
style.css             Estilos
script.js             Comportamentos comuns (menu, abas, triagem, fundo animado, sessão e botão Sair)
dados.js              Funções compartilhadas (chamadas à API, escape de texto, cartão de profissional)
agendamento.js        Lógica do agendamento
especialidades.js     Localização, serviços próximos e filtro por especialidade
login.js              Login e cadastro
painel.js             Consultas e agenda do profissional
consumed.py           Back-end Flask + SQLite
agendamento.db        Banco de dados (gerado automaticamente)
.chave_secreta        Chave das sessões (gerada automaticamente; não versionar)
LICENSE               GNU GPL v3
```

### API (resumo)

| Rota | Quem acessa | Função |
|---|---|---|
| `POST /api/cadastro`, `POST /api/login`, `POST /api/logout`, `GET /api/eu` | Todos | Conta e sessão |
| `GET /api/profissionais` | Todos | Lista de profissionais |
| `GET /api/ocupados/<slug>` | Todos | Horários ocupados de um profissional (sem dados pessoais) |
| `GET /api/lugares?q=` | Todos | Sugestões de local para o preenchimento automático |
| `GET`/`POST /api/consultas` | Paciente | Listar e agendar as próprias consultas |
| `DELETE /api/consultas/<código>` | Paciente ou profissional dono | Cancelar consulta |
| `GET /api/painel`, `PUT /api/painel/agenda` | Profissional | Consultas e edição de dias e horários |

### Banco de dados

Três tabelas: `usuarios` (paciente ou profissional), `profissionais` (dados e agenda em JSON) e `consultas`. A restrição `UNIQUE (slug, data, hora)` impede dois agendamentos no mesmo horário.

## 6. Equipe e divisão de tarefas

| Integrante | Papel | Principais responsabilidades |
|---|---|---|
| Gabriel Santos / Yan Rafael | Front-end | Páginas, estilos, agendamento, especialidades e todos os arquivos JavaScript |
| Arthur Sales | Documentação e pitch | README, pesquisa de dados, apresentação, criação de repositórios |
| Erik Malta | Back-end | Gerenciar os agendamentos de forma centralizada e confiável |

## 7. Evolução do projeto

Registro das etapas de desenvolvimento, com datas e responsáveis reais.

| Data | Etapa | Responsável | Link (commit, cartão ou PR) |
|---|---|---|---|
| [dd/mm] | [ex.: definição da ideia e do ODS 3] | [Nome(s)] | [link] |
| [dd/mm] | [ex.: página inicial e triagem] | [Nome] | [link] |
| [dd/mm] | [ex.: agendamento de consultas] | [Nome] | [link] |
| [dd/mm] | [ex.: especialidades e serviços de saúde próximos] | [Nome] | [link] |
| [dd/mm] | [ex.: acessibilidade, avisos de emergência e documentação] | [Nome(s)] | [link] |


## 8. Diferencial, impacto e próximos passos

- **Diferencial:** une, em um só lugar, triagem simples, agendamento e mapa de serviços de saúde próximos (inclusive da rede pública), com foco em acesso (valor social, Libras, local acessível, horário à noite) e avisos de emergência sempre visíveis.
- **Impacto esperado:** [descreva, nas palavras da equipe, o que muda para o paciente e para o profissional]
- **Próximos passos:**
  - Ligar os filtros de acesso e os horários da página inicial aos dados reais da API, e fazer o formulário de contato enviar mensagens
  - Lembretes de consulta e confirmação de presença, para reduzir faltas e liberar vagas ociosas
  - Integração com agendas reais de profissionais e, no futuro, com serviços da rede pública
  - Profissionais e consultórios reais

## 9. Pitch

- Apresentação: [link]
- Demonstração: [link, se houver]

## Licença

Distribuído sob a licença **GNU GPL v3**. Veja o arquivo [LICENSE](LICENSE).

---

Projeto desenvolvido por [nomes da equipe] para [nome do evento ou disciplina], [ano].