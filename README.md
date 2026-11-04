# Site da Caloreta

Página de apresentação da Caloreta (caloreta.com.br). HTML, CSS e JavaScript puros, sem build.
O app fica em https://app.caloreta.com.br (repositório `caloreta-app`).

- `index.html` – conteúdo e textos.
- `estilos.css` – cores e fontes do design system v1.0.2 (Lilita One + Nunito), efeitos e versão para celular.
- `script.js` – efeitos de rolagem, contadores, troca de telas em "Como funciona", inclinação do celular e galeria arrastável. Tudo desliga com "reduzir movimento".
- `img/` – telas reais do app (modo demonstração) e o banner de prévia de link `og.jpg` (1200×630).
- `favicon.svg` (com versão para modo escuro), `favicon.ico` (16/32/48), `img/apple-touch-icon.png` (180) e ícones 192/512 do `site.webmanifest`.
- `vercel.json` – cabeçalhos de segurança e cache das imagens.

Ver localmente: `npx serve .` e abrir http://localhost:3000.

Regras dos textos (as mesmas do app): calorias vêm das tabelas, nunca da IA; aviso "Estimativa aproximada…" e citação das fontes no rodapé; nada de dieta, diagnóstico ou promessa de resultado; 18+.
