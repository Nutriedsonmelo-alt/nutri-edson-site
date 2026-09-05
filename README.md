# Site — Edson Melo Nutricionista

Landing page estática premium (HTML + CSS + JS puro, sem build). Arquivos:

- `index.html` — conteúdo e estrutura da página principal
- `privacidade.html`, `termos.html` — páginas legais mínimas
- `styles.css` — design system (cores, tipografia, componentes) e estilos
- `script.js` — menu mobile, header com glass no scroll, fade-in e FAQ
- `assets/img/` — coloque aqui as fotos e a imagem de Open Graph

## Já preenchido

WhatsApp (`5582982051810`), e-mail (`nutriedsonmelo@gmail.com`), Instagram,
número de pacientes (+1000), os três depoimentos, o produto do Método Digital
("Queima Tudo", R$ 97,00, link do checkout), o link do Grupo VIP e o CRN
(CRN-6 46887) já estão preenchidos em `index.html`.

## Antes de publicar (ainda falta)

1. **Fotos**: substitua os três `.photo-placeholder` (hero, "Sobre" e "Consulta
   Premium") por imagens reais, ex.:
   `<img src="assets/img/edson-melo.jpg" alt="Edson Melo, nutricionista" loading="lazy">`
   (use um `alt` descritivo em cada uma e `loading="lazy"` em todas exceto a
   do hero, que deve carregar imediatamente). Crie também
   `assets/img/og-image.jpg` (1200×630px) para as prévias de compartilhamento
   (Open Graph / Twitter Card), já referenciadas no `<head>`.

2. **Páginas legais**: `privacidade.html` e `termos.html` têm textos
   provisórios entre colchetes — substitua pelo conteúdo jurídico definitivo.

3. **Favicon / logo**: o ícone atual é um monograma "EM" gerado em SVG
   embutido no `<head>`. Quando tiver a marca finalizada, substitua o
   `<link rel="icon" ...>` por um arquivo real em `assets/img/`.

## Design system

Todas as variáveis de marca (cores, fontes, espaçamento, raio de borda,
transições) ficam no `:root` no topo de `styles.css`. Para criar uma nova
página mantendo a mesma identidade, reutilize esse bloco de variáveis e as
classes `.btn`, `.eyebrow`, `.section`, `.reveal` etc.

- Fundo: `--color-bg` (#0D0D0D) · Superfície: `--color-surface` (#1A1A19)
- Texto: `--color-text` (#F3EDE2) · Texto secundário: `--color-text-secondary` (#B9B0A0)
- Destaque: `--color-gold` (#C9A568)
- Títulos: Fraunces · Corpo/botões: Manrope

## Ver localmente

Abra `index.html` direto no navegador, ou rode um servidor simples:

```bash
python3 -m http.server 8080
```

e acesse `http://localhost:8080`.

## Publicar na HostGator

Envie todos os arquivos (`index.html`, `privacidade.html`, `termos.html`,
`styles.css`, `script.js`, `assets/`) via FTP ou pelo Gerenciador de
Arquivos do cPanel para a pasta `public_html/` do domínio
`nutriedsonmelo.com`. Não é necessário nenhum processo de build.
