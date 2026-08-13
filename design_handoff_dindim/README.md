# Handoff: Dindim (redesign do app de finanças)

## Overview
Redesign visual do app de finanças pessoais, agora chamado **Dindim**. Paleta trocada de
roxo (colidia com Nubank) para âmbar dourado. Cobre 11 telas — fluxo de entrada (Entrar,
Criar conta, Desbloqueio), Home (com versão modo escuro), Extrato, Adicionar transação,
Contas, Metas, Categorias e Perfil — e uma marca nova (duas moedas ilustradas).

## About the Design Files
Referências de design em **HTML/React DOM** — protótipos estáticos de aparência e
hierarquia. **Não são código de produção.** Alvo: `apps/mobile` (Expo + expo-router +
React Native, tema em `packages/shared/src/theme`). Recriar em React Native com
`StyleSheet`, tokens de `@financas/shared`, componentes em `apps/mobile/components`,
rotas em `apps/mobile/app`. Sem CSS.

## Fidelity
**High-fidelity.** Cores, tamanhos e copy abaixo devem ser reproduzidos fielmente.

## Design Tokens

Substituir os valores de `packages/shared/src/theme/tokens.ts` (estrutura igual, só os
valores mudam) — ver `dindim-theme.ts` pronto para colar.

### Cores (modo claro)
| Token | Valor |
|---|---|
| brand | #B8860B |
| brandPressed / texto sobre âmbar em botão escuro | #5A4A1F |
| brandSubtle | #FBF2DC |
| onBrand (texto/ícone sobre âmbar) | #FFFFFF |
| background | #F4F4F6 |
| surface | #FFFFFF |
| border | #E9E9EE |
| text | #191919 |
| textSecondary | #71717A |
| textTertiary | #A1A1AA |
| income (só entradas) | #00A868 |
| danger (só erros reais, nunca despesas) | #E24141 |
| warning | #F5A623 |

Regra: a cor de destaque (âmbar) ocupa só ~15% da tela — o resto é neutro. Sem gradiente
pesado. Raio de borda 16–24px. Verde reservado a valores de entrada; vermelho só a erros.

### Cores (modo escuro)
```
background: #121212   surface: #1C1C1C   border: #2E2E2E
brand: #D9A441        brandSubtle: #3A2F16
text: #F2F2F2         textSecondary: #A5A5A5   textTertiary: #6E6E6E
income: #2FCB84       danger: #FF6B6B
```
Hoje só a tela Home tem versão dark implementada no protótipo (`HomeScreenDark` em
screens.jsx); as demais herdam os mesmos tokens quando portadas.

### Tipografia
Inter Tight (sem mudança de família), pesos 400/500/600. Escala: caption 12, footnote 13,
body 15, callout 17, title/heading 20–28, hero 30.

### Raios e espaçamento
`radius: { sm: 8, md: 16, lg: 24, pill: 999 }`, `space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }`.
Padding lateral de tela = 24.

## Logo / Marca

Duas moedas douradas se sobrepondo, cada uma com anel interno, cifrão e a borda lateral
(espessura da moeda) serrilhada visível à direita — ver `coin-mark.svg` (arquivo pronto,
100×100 viewBox) e `Logo Dindim.dc.html` para todos os usos lado a lado.

Cores da marca: face `#EFC24A`, borda/rim `#C79424`, contorno e cifrão `#3D2E10`/`#C9971F`.

Usos:
- **Ícone do app**: quadrado âmbar (`#B8860B`) raio 28 (proporcional), marca centralizada
- **Favicon**: mesmo desenho; simplifica-se naturalmente em tamanhos pequenos (16–48px)
- **Wordmark**: marca em caixa de 32px raio 9 + "Dindim" 24px/800 ao lado (Inter Tight),
  em fundo claro ou sobre âmbar (inverte o quadrado para branco/âmbar)
- **Splash**: marca em ~94px centralizada sobre fundo âmbar cheio, com o wordmark abaixo

`Logo.native.tsx` neste bundle é o componente React Native (react-native-svg) já com esse
desenho, parametrizado por tamanho.

## Screens

Ordem das 11 telas, tokens e comportamento — ver o protótipo `Dindim APP Design.dc.html`
(abrir no navegador) e a fonte `screens.jsx` para os valores exatos de cada elemento
(cores, paddings, tamanhos de fonte). Destaques:

1. **Entrar** — bloco âmbar cheio no topo com "Oi, bem-vinda de volta", folha branca
   arredondada (28px) por cima com campos sublinhados (sem caixas), botão único no rodapé,
   "Esqueci minha senha" e "Entrar com Google" como links de texto.
2. **Criar conta** — mesmo tratamento de bloco âmbar + folha branca, campos: nome, e-mail,
   senha com medidor de força (3 barras).
3. **Desbloqueio** — biometria, saudação personalizada, ícone de digital.
4. **Home** — saldo total, gráfico "Como foram os 6 meses" (barras entrada/saída pareadas),
   "Meus limites do mês" (barras de progresso por categoria), últimas transações. Existe
   versão em modo escuro usando os tokens dark acima.
5. **Extrato, Adicionar transação, Contas, Metas, Categorias (com donut), Perfil** — ver
   screens.jsx para layout exato de cada uma.

## Files
- `Dindim APP Design.dc.html` — prancheta com as 11 telas (abrir no navegador)
- `screens.jsx` — fonte de todas as telas/componentes (cores, paddings, textos exatos)
- `android-frame.jsx` — moldura de device do protótipo, descartável na implementação
- `Logo Dindim.dc.html` — todas as aplicações da marca lado a lado
- `dindim-theme.ts` — tokens prontos para `packages/shared/src/theme`
- `coin-mark.svg` — marca em SVG standalone (ícone/favicon)
- `Logo.native.tsx` — componente React Native da marca

## Files do app que mudam
```
packages/shared/src/theme/palette.ts        cores âmbar + tokens dark
packages/shared/src/theme/tokens.ts         radius, cores
apps/mobile/app/login.tsx                   redesenhada (bloco âmbar + folha branca)
apps/mobile/app/signup.tsx                  NOVA (mesmo tratamento)
apps/mobile/components/BiometricGate.tsx    tela de desbloqueio
apps/mobile/app/home.tsx                    gráfico de fluxo + tokens + variante dark
apps/mobile/app/profile.tsx                 NOVA
apps/mobile/components/Logo.tsx             NOVA (marca das duas moedas)
assets/icon.png / adaptive-icon.png         gerar a partir de coin-mark.svg sobre fundo #B8860B
assets/favicon.png                          gerar a partir de coin-mark.svg
```

## Ordem sugerida
1. Tokens (`dindim-theme.ts`) + `Logo` component
2. Ícones do app (icon/adaptive-icon/favicon) a partir de `coin-mark.svg`
3. Fluxo de auth (entrar, criar conta, desbloqueio)
4. Home (tokens + gráfico + modo escuro)
5. Extrato, Contas, Metas, Categorias, Perfil
