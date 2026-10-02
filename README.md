# ConsuMed

> Tirar a dificuldade do meio do caminho entre o paciente e a consulta médica.

O **ConsuMed** é uma plataforma de saúde que conecta pacientes e profissionais em um só lugar. O usuário descobre qual especialidade procurar, encontra profissionais, vê os horários disponíveis e agenda a consulta de forma simples e organizada. A plataforma também ajuda a localizar serviços de saúde próximos (UPA, UBS, CAPS, hospitais e clínicas), inclusive da rede pública (SUS).

Projeto acadêmico alinhado ao **ODS 3, Saúde e Bem-estar**.

> **Status:** protótipo funcional de front-end. Os profissionais e consultórios são fictícios e as consultas ficam salvas apenas no navegador. O back-end em Python está previsto (veja a [seção 8](#8-diferencial-impacto-e-próximos-passos)).

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

O ConsuMed funciona como uma ponte entre pacientes e profissionais de saúde. O site tem três páginas principais.

### Início (`index.html`)

- Triagem simples ("O que está acontecendo?") que sugere a especialidade mais adequada e mostra profissionais indicados
- Busca direta por tipo de profissional (médico ou psicólogo) e por tipo de atendimento (online ou presencial)
- Apresentação dos serviços: consultas médicas, psicologia, atendimento online ou presencial, valor social, Libras e acessibilidade, horário à noite
- Profissionais com horário livre na semana e seção de contato

### Agendamentos (`agendamento.html`)

- Escolha em três passos: profissional, dia e horário
- Dias de atendimento do profissional nos próximos 7 dias, com horários já ocupados bloqueados
- Confirmação com nome, e-mail e tipo de atendimento (online ou presencial), gerando um código de consulta (formato `CM-XXXXX`)
- Lista "Minhas consultas", com opção de cancelar
- Filtros recebidos pela busca da página inicial (por exemplo, `?profissional=medico&atendimento=online`)

### Especialidades (`especialidades.html`)

- Explicação de cada especialidade e de quando procurá-la
- **Serviços de saúde perto de você:** a partir da localização do usuário (ou de uma cidade ou bairro digitado), lista serviços de cinco categorias (urgência e emergência, UBS e postos, CAPS, hospitais, clínicas e consultórios), do mais perto ao mais longe, com selo de rede pública (SUS), telefone e rota
- Profissionais ordenados pela proximidade do consultório
- Explicação dos termos usados nos perfis: online, presencial, valor social, Libras, local acessível e horário à noite
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

### Limitações do protótipo

- Não há back-end: o arquivo `consumed.py` ainda está vazio e as consultas ficam apenas no `localStorage` do navegador
- A ocupação dos horários é **simulada** (calculada a partir do profissional, do dia e da hora), e não vem de uma agenda real
- Profissionais e consultórios são fictícios; não há integração com o SUS nem com operadoras de planos de saúde
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
| Armazenamento (protótipo) | `localStorage` do navegador |
| Mapas e localização | API de geolocalização do navegador, Overpass API (busca de lugares) e Nominatim (busca de endereços), ambos do OpenStreetMap |
| Links externos | Google Maps, para busca e rotas |
| Back-end | Python (planejado; `consumed.py` ainda vazio) |
| Ferramentas | GitHub, [Trello / Notion / outra, se usarem] |
| Licença | GNU GPL v3 |

## 5. Como executar o projeto

O projeto é um site estático e não precisa de instalação.

```bash
# 1. Clonar o repositório
git clone [URL-DO-REPOSITORIO]

# 2. Entrar na pasta do projeto
cd [consumed]

# 3. Iniciar um servidor local (recomendado)
python -m http.server 8000
```

Depois, abra `http://localhost:8000` no navegador.

Observações:

- É possível abrir o `index.html` direto no navegador, mas a **geolocalização** só funciona em `localhost` ou `https`.
- A busca de serviços de saúde próximos precisa de internet (OpenStreetMap).
- O site espera a pasta `imagens/` (com `logo.png`) ao lado dos arquivos HTML. Inclua-a no repositório.

### Estrutura de arquivos

```
index.html            Página inicial
agendamento.html      Agendamento de consultas
especialidades.html   Especialidades e rede de saúde
style.css             Estilos
script.js             Comportamentos comuns (menu, abas, triagem, fundo animado)
agendamento.js        Lógica do agendamento
especialidades.js     Lógica de localização e serviços próximos
dados.js              Dados fictícios dos profissionais
consumed.py           Back-end em Python (a desenvolver)
LICENSE               GNU GPL v3
```

## 6. Equipe e divisão de tarefas

| Integrante | Papel | Principais responsabilidades |

| Gabriel Santos/ Yan Rafael | front-end|  páginas, estilos, agendamento, especialidades e todas as pastas de java scripit |
| Arthur Sales | Documentação e pitch|  README, pesquisa de dados, apresentação, criação de repositórios|
| Erik Malta | Back-end | gerenciar os agendamentos de forma centralizada e confiável|
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
  - Back-end em Python com API (por exemplo, `GET /api/profissionais`) para substituir os dados fictícios de `dados.js`
  - Salvar e cancelar consultas pela API, com o banco impedindo dois agendamentos no mesmo horário (restrição `UNIQUE` em profissional, data e hora)
  - Cadastro e login de pacientes e profissionais
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
