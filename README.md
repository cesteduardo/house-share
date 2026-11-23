# Entre · landing page conceito

Conceito de landing page para um app brasileiro de **copropriedade residencial**: pessoas com o mesmo plano compram um imóvel juntas, com simulação, contrato e escritura.

**Página publicada:** https://cesteduardo.github.io/house-share/

## Arquivos

| Arquivo | Papel |
|---|---|
| `index.html` | Conteúdo, planta baixa em SVG inline e FAQ com JSON-LD |
| `style.css` | Sistema visual (no molde do GR Vagas e do iPiscinas, em laranja) |
| `animations.js` | Simulador, planta reativa, barra fixa no celular, formulário e eventos de `dataLayer` |
| `fonts/inter-pt-wght.woff2` | Inter variável, recortada para o português (licença OFL em `fonts/OFL-Inter.txt`) |

Sem frameworks, sem bibliotecas e sem arquivos de imagem: a planta, os ícones e as texturas são desenhados em código.

## Tamanho

| Arquivo | Minificado | gzip |
|---|---|---|
| index.html | 30,3 KB | 8,6 KB |
| style.css | 28,3 KB | 7,5 KB |
| animations.js | 7,2 KB | 2,9 KB |
| **Total** | **65,8 KB** | **19,0 KB** |
| Fonte (WOFF2) | 34,9 KB | — |

## Conteúdo a confirmar antes de ir ao ar

Os marcadores entre colchetes aparecem de propósito na página:

- `[DADO A CONFIRMAR]`: número de lares formados
- `[DEPOIMENTO REAL]`: três depoimentos
- `[LOGO PARCEIRO]`: logos de parceiros
- `[CONFIRMAR POR MUNICÍPIO]`: faixa de ITBI e cartório (estimada em 3% a 5%)
- `[CONFIRMAR COM BANCOS PARCEIROS]`: composição de renda entre não parentes
- `[MODELO DE COBRANÇA A DEFINIR]`
- `[NÚMERO DE WHATSAPP A PREENCHER]` (links `wa.me/5500000000000`)
- `[RAZÃO SOCIAL A PREENCHER]`, CNPJ, CRECI

O formulário da lista de espera valida os campos e mostra a confirmação, mas **ainda não envia dados para lugar nenhum**: falta conectar a um backend ou CRM em `animations.js` (ponto marcado no código).

## Eventos de tracking (`window.dataLayer`)

`cta_header_click`, `cta_hero_click`, `cta_dock_click`, `simulator_change`, `simulator_complete`, `form_start`, `form_submit`, `whatsapp_click`. Nenhum dado pessoal é enviado ao `dataLayer`.
