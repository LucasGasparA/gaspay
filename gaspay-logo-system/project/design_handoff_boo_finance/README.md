# Handoff: Boo Finance — versão gamificada (mobile)

## Overview
Redesign completo do app de finanças pessoais em uma identidade "fantasminha pixelado":
paleta lavanda clara, tipografia arredondada, cartões com sombra dura (estilo 2D chapado) e
uma camada de gamificação (nível, XP, moedas, sequência de dias, missões semanais e conquistas).

O pacote cobre 11 telas: fluxo de entrada (4), Home, Extrato, Adicionar transação, Contas,
Metas, Categorias e Perfil/Preferências.

## About the Design Files
Os arquivos deste bundle são **referências de design feitas em HTML/React DOM** — protótipos
estáticos que mostram aparência e hierarquia pretendidas. **Não são código de produção.**

O alvo é o app existente em `apps/mobile` (Expo + expo-router + React Native, tema em
`packages/shared/src/theme`). A tarefa é **recriar estes designs em React Native**, usando os
padrões já estabelecidos do repositório: `StyleSheet.create`, tokens de `@financas/shared`,
componentes em `apps/mobile/components`, rotas em `apps/mobile/app`. Nada de CSS, nada de
`box-shadow` (usar `shadowColor/shadowOffset/shadowOpacity/shadowRadius` + `elevation`, ou
uma `View` de sombra sólida deslocada — ver "Sombra 2D").

## Fidelity
**High-fidelity.** Cores, tamanhos, pesos, raios e copy estão definidos abaixo e devem ser
reproduzidos fielmente. Onde o protótipo HTML e este README divergirem, **este README manda.**

## Design Tokens

Os tokens atuais (`packages/shared/src/theme/tokens.ts`) mudam de valor, não de estrutura.
O arquivo `boo-theme.ts` deste bundle é uma substituição pronta para `lightTheme.colors` +
`radius` + `typography.family`.

### Cores
| Token | Antes | Depois |
|---|---|---|
| brand | #820AD1 | **#7A5AF8** |
| brandPressed | purple[600] | **#6344E0** |
| brandSubtle | purple[50] | **#EDE8FF** |
| onBrand | #FFFFFF | #FFFFFF |
| background | #F4F4F6 | **#F4F0FF** |
| surface | #FFFFFF | #FFFFFF |
| border | #E9E9EE | **#E3DBFB** |
| text | #191919 | **#241C46** |
| textSecondary | #71717A | **#7A6FA8** |
| textTertiary | #A1A1AA | **#ABA1CE** |
| income | #00A868 | **#2ECC9A** |
| danger | #E24141 | **#FF6B6B** |
| warning | #F5A623 | **#FFC145** |

Novos tokens de gamificação:
```
coin:   #FFC145   (moedas, recompensas)
xp:     #4CC9F0   (barra de XP, missões de registro)
quest:  #FF7BC8   (sequência de dias, missões de meta)
shadow: #DCD3F7   (sombra dura dos cartões)
```

### Raios
`{ sm: 12, md: 20, lg: 28, pill: 999 }` (antes 8/16/24/999).

### Espaçamento
Inalterado: `{ xs: 4, sm: 8, md: 16, lg: 24, xl: 32 }`. Padding lateral de tela = `space.lg` (24).

### Tipografia
Troca de **Inter Tight** por **Nunito** (arredondada). Pesos usados: 400, 500, 700, 800.
Via `@expo-google-fonts/nunito`: `Nunito_400Regular`, `Nunito_500Medium`,
`Nunito_700Bold`, `Nunito_800ExtraBold`.

Tamanhos (mantém a escala existente): caption 12, footnote 13, body 15, callout 17,
title 20, heading 24, display 28-32.
Regra nova: **títulos de seção e números de gamificação usam peso 800**, não 600.

### Sombra 2D
Todo cartão e botão principal tem sombra **sólida, sem blur, deslocada só no Y**:
- Cartão: borda `2px solid colors.border` + sombra `0 4px 0 colors.shadow`
- Botão primário: sombra `0 5px 0 colors.brandPressed`
- Campo de formulário: sombra `0 3px 0 colors.shadow`; em foco, borda `brand` + sombra `brandSubtle`

Em React Native não existe sombra sem blur. Implementar com uma `View` de fundo deslocada:
```tsx
// components/Chunky.tsx
export function Chunky({ offset = 4, color, radius, style, children }: ChunkyProps) {
  return (
    <View>
      <View style={{ position: 'absolute', left: 0, right: 0, top: offset, bottom: -offset,
                     backgroundColor: color, borderRadius: radius }} />
      <View style={[{ borderRadius: radius, borderWidth: 2, borderColor: colors.border,
                      backgroundColor: colors.surface }, style]}>{children}</View>
    </View>
  );
}
```

## Assets

### Mascote (fantasma pixel art)
Único asset do redesign. É um bitmap 16×16 declarado em código — sem imagem.
Arquivo pronto: `ghost-pixels.ts` (bitmap + cores) e `Ghost.native.tsx` (componente RN).

Cores: `K #241C46` (contorno), `W #F5F2F0` (corpo), `S #CFC8D6` (sombra),
`E #241C46` (olhos), `B #E8A79B` (bochecha).

Onde aparece:
- Boas-vindas: 112px, **flutuando** (translateY 0 → -6px, 3.4s, `steps(2)` — movimento em 2 quadros, não suave)
- Avatar da Home: 24px, dentro de círculo 44px `brandSubtle` com borda 2px
- Avatar do Perfil: 32px, círculo 56px
- Desbloqueio: 30px, círculo 56px
- Fundo das telas de auth: 5 fantasmas estáticos, tamanhos 16-44px, opacidade 0.10-0.16, `pointerEvents: none`

**Só o mascote grande das boas-vindas anima.** Todos os outros são estáticos.

## Screens / Views

Todas as telas: fundo `colors.background`, padding lateral 24, conteúdo em `ScrollView`,
topo respeitando `useSafeAreaInsets()` (no protótipo, 62px de status bar + 16).

---

### 1. Boas-vindas — nova rota (`app/welcome.tsx`)
**Objetivo:** primeira impressão e escolha entre criar conta ou entrar.
**Layout:** coluna centralizada verticalmente; rodapé fixo com os dois botões.
- Fundo: 5 fantasmas decorativos (ver Assets)
- Mascote 112px, flutuando
- Wordmark "Boo Finance" — 34px, peso 800, `colors.brand`
- Subtítulo "Suas finanças leves como um fantasma. E com XP." — 15px, `textSecondary`, centro, largura máx. 250
- Prova social: pílula `surface`, borda 2px, sombra 3px; 3 círculos 22px sobrepostos (-8px) nas cores coin/quest/xp; texto "+12 mil poupadores em missão" 12px peso 700
- Botão primário "Criar minha conta"; botão secundário "Já tenho conta" (`surface`, borda 2px, sombra `shadow`)
- Legal: "Ao continuar, você aceita os termos de uso." 12px `textTertiary`

### 2. Entrar (`app/login.tsx`)
**Objetivo:** login com e-mail/senha ou Google.
- Botão voltar: quadrado 34px, raio 12, `surface`, borda 2px, sombra 3px
- Título "Bem-vinda de volta" 28px/800; sub "Sua sequência de 12 dias está te esperando." 14px `textSecondary`
- Campo E-MAIL (label 12px/800 `textSecondary`, caixa raio 20, padding 14/16)
- Campo SENHA — estado de foco: borda `brand`, sombra `brandSubtle`, ação "ver" 12px/800 `brand`
- "Esqueci a senha" alinhado à direita, 13px/800 `brand`
- Botão "Entrar"
- Divisor: duas linhas 2px `border` + "ou" 12px/700 `textTertiary`
- Botão secundário "Continuar com Google"
- Rodapé: "Não tem conta? **Criar agora**" (`brand`, 800)

Integra com `lib/auth-client.ts` como hoje; o Google exige provider novo no better-auth.

### 3. Criar conta — nova rota (`app/signup.tsx`)
- Título "Criar conta"; sub "Leva 40 segundos e já vale 50 XP."
- Campos: "COMO PODEMOS TE CHAMAR", "E-MAIL" (placeholder voce@email.com), "CRIAR SENHA" (placeholder "mínimo 8 caracteres")
- Medidor de força: 3 barras 6px de altura, raio pill — preenchidas em `income`, vazias em `border`; rótulo "boa" 11px/800 `income`
- Card de recompensa: fundo `coin` a 10%, borda 2px `coin` a 30%, círculo 24px `coin` com "$" branco, texto "Você começa no **nível 1** com 100 moedas e 3 missões liberadas."
- Botão "Criar conta e ganhar 50 XP"
- Validação: nome obrigatório; e-mail formato; senha mín. 8 (barras: 1 = fraca <8, 2 = boa ≥8, 3 = forte ≥12 com número e símbolo)

### 4. Desbloqueio (`components/BiometricGate.tsx`)
**Objetivo:** re-entrada por biometria mantendo a sequência.
- Círculo 56px com mascote 30px; "Oi de novo, Larissa" 20px/800
- "Use a digital para entrar e manter sua sequência viva." 14px `textSecondary`, centro, máx. 240
- Alvo de digital: círculo 104px, `surface`, borda 3px `brand`, sombra 5px `shadow`; dentro, dois arcos concêntricos (raio 50/50/45/45%) borda 3px `brand`, o interno com opacidade 0.6
- Selo de sequência: pílula `quest` a 12%, borda 2px `quest` a 25%, ponto 8px, "12 dias seguidos" 12px/800
- Rodapé: "Usar senha" (`brand`, 800) e "Trocar de conta" (`textSecondary`)

### 5. Home (`app/home.tsx`)
Ordem das seções, de cima para baixo (gap 32 entre blocos):
1. **Saudação** — "Oi, Larissa" 24px/600 + data 13px `textSecondary`; à direita, avatar 44px com mascote
2. **Cartão de progresso** (cartão chunky, padding 16, gap 16):
   - `XPBar`: quadrado 30px raio 10 `brand` com o nível (13px/800, sombra 3px `brandPressed`); "Nível 7 · Poupador Assombroso" 13px/700; "1840/2500 XP" 12px `textSecondary` tabular; trilha 14px de altura, raio pill, fundo #E9E2FC, borda 2px `border`, preenchimento em gradiente `xp → brand` a 73%
   - Chips: moedas ("$", "1.240", "moedas", cor `coin`) e sequência ("12", "12 dias", "seguidos", cor `quest`). Chip = pílula com fundo cor a 12%, borda 2px cor a 25%, ícone circular 18px, valor 13px/800
3. **Missões da semana** — título 17px/800 + contador "2 de 3" 12px/700 `brand`; lista de 3 itens:
   - Item: padding 12/14, raio 20, borda 2px. Concluído: fundo cor a 8%, borda cor a 40%, caixa 24px raio 8 preenchida com "✓" branco. Pendente: fundo #FBFAFF, borda `border`, caixa vazia
   - Nome 14px/700; progresso "4 de 5" 11px `textSecondary`; recompensa "+40 XP" 12px/800 na cor da missão
   - Dados: "Registrar 5 gastos" 4/5 +40XP (`xp`); "Ficar abaixo do limite de delivery" 1/1 +60XP (`income`); "Guardar R$ 100 na semana" 0/1 +80XP (`quest`)
4. **Saldo total** — 36px/600 tabular, rótulo 13px; abaixo, Entradas (`income`, com "+") e Saídas, 15px/600
5. **Cartão "Como foram os 6 meses"** — ver Gráficos
6. **"Meus limites do mês"** — por categoria: nome 13px/500 + "gasto de limite" à direita (`danger` se estourou); barra 6px raio pill, cor da categoria (`danger` acima de 100%)
7. **Conquistas** — cartão chunky com 4 selos: quadrado 46px raio 16, borda 2px na cor, sombra 3px cor a 33%, losango 18px (rotate 45°) no centro; nome 10px/700 abaixo. Bloqueado: fundo #EFECF9, borda `border`, opacidade 0.55
8. **Últimas transações** — linha existente do app: badge circular 40px com a inicial da categoria (fundo cor a 10%, texto na cor), descrição 15px/500, categoria 13px `textSecondary`, valor 15px/600 tabular (entrada em `income` com "+")

### 6. Extrato (`app/transactions`)
Lista agrupada por dia ("Hoje", "Ontem", "6 de agosto"), cabeçalho de grupo 13px `textSecondary`,
linhas idênticas às da Home. Sem mudança estrutural — só tokens e tipografia.

### 7. Adicionar transação (`components/TransactionForm.tsx`)
Valor grande no topo, seletor Despesa/Receita em pílulas, campos em grupo (`surface`, raio 28,
borda 2px, sombra 4px) com linhas label/valor + "›", botão primário chunky no rodapé.

### 8. Contas (`app/accounts.tsx`)
Total no topo, lista de contas em cartão chunky, saldo tabular por linha.

### 9. Metas (`app/goals` — hoje inexistente)
Título "Metas" 28px/800 + sub "Cada meta concluída vira XP e uma conquista nova." 13px.
Cada meta: cartão chunky, nome 17px/800, selo "+250 XP" (pílula `coin` a 14%, borda 2px `coin` a 33%,
11px/800), barra de progresso, "R$ X guardado" / "N% de R$ Y".
Rodapé: "+ Nova meta" em caixa tracejada, `brand`, 15px/500.

### 10. Categorias
Abas Despesas/Receitas (pílula ativa `brand`, inativa `surface` com borda), cartão chunky com o
donut + rateio (ver Gráficos), depois a lista de categorias com badge circular e "›".

### 11. Perfil e preferências — nova rota (`app/profile.tsx`)
- Cabeçalho: "Perfil" 24px/600; cartão com avatar 56px (mascote 32px), nome 17px/600,
  e-mail 13px `textSecondary`, ação "Editar" 13px/500 `brand`
- Grupos (título 12px/500 maiúsculo com letter-spacing 0.06em; caixa chunky):
  - **Conta** — Dados pessoais (hint "Nome, CPF, telefone") · Contas conectadas "3 bancos" · Assinatura "Grátis"
  - **Preferências** — Moeda "BRL (R$)" · Início do mês financeiro "Dia 1" · Modo escuro (toggle off) · Ocultar saldo ao abrir (hint "Mostra apenas ao tocar", toggle on)
  - **Notificações** — Alertas de orçamento (hint "Ao atingir 80% do limite", on) · Resumo semanal (on) · Lembrete de contas a pagar (off)
  - **Segurança** — Biometria para abrir o app (on) · Alterar senha · Exportar meus dados "CSV"
- Linha: 14px vertical / 16px horizontal, label 15px, hint 12px `textSecondary`, valor 14px `textSecondary` + "›"
- Toggle: trilha 44×26 raio pill (`brand` ligado / `border` desligado), botão 20px branco com sombra
- Rodapé: "Sair da conta" em caixa `surface` com borda, texto `danger` 15px/500

## Gráficos

### Fluxo de 6 meses (Home)
Barras pareadas por mês, altura do container 132px, gap 14 entre meses, 3 entre as duas barras,
largura 9px, raio 3px só no topo. Entrada = `income`, saída = `brand`; **mês atual em cor cheia,
anteriores a ~25-35% de opacidade**. Rótulos 11px (mês atual em `text`/500, resto `textTertiary`).
Legenda: quadrado 8px raio 2 + rótulo 12px `textSecondary`.
Escala: altura = valor / máximo do conjunto.
Dados: mar 6100/4280, abr 6100/3910, mai 6550/4700, jun 6100/3550, jul 6800/4120, ago 6200/3940 (reais).

### Donut de categorias
Anel 168px, espessura 22px, fatias contíguas em sentido horário a partir do topo
(no HTML: `stroke-dasharray` acumulado com rotação -90°; em RN use `react-native-svg` com a mesma
matemática). Centro: "Total do mês" 11px `textSecondary` + valor 17px/600 tabular.
Rateio abaixo: ponto 8px + nome + % + valor alinhado à direita (largura fixa 78px, tabular).
Dados: Moradia 2100, Mercado 420, Restaurante 380, Transporte 150, Assinaturas 39,90, Saúde 56,70.

## Navegação
Tab bar de 5 itens: **Início · Extrato · Metas · Contas · Perfil**.
Indicador = barra 20×3 raio 2 em `brand` acima do rótulo; rótulo 11px, ativo em `brand`/600,
inativo `textTertiary`/400. Topo da barra: borda 1px `border`, fundo `surface`.

Fluxo: Boas-vindas → (Criar conta | Entrar) → Home. Sessão salva → Desbloqueio → Home.

## Interactions & Behavior
- Botões chunky: ao pressionar, deslocar o conteúdo 3-4px em Y e reduzir a sombra ao mesmo valor (efeito de "afundar"). Usar `Pressable` + `Animated`/`withSpring` com o `spring` já existente nos tokens.
- Barra de XP: animar largura com `springSoft` quando o XP muda.
- Missão concluída: marcar a caixa e animar a barra de XP; sem confete.
- Mascote das boas-vindas: `translateY` 0 → -6px em 2 quadros (`steps(2)`), loop 3.4s. Nada de easing suave — o movimento é intencionalmente "travado", combinando com o pixel art.
- Nenhuma outra animação nova. Respeitar `prefers-reduced-motion`/`AccessibilityInfo.isReduceMotionEnabled`.
- Estados de carregamento e erro: manter os atuais (`ActivityIndicator`, `RefreshControl`), apenas com as cores novas.

## State Management
Gamificação é o único domínio novo. Sugestão de contrato (a definir na API):
```ts
type GamificationDTO = {
  level: number; levelTitle: string; xp: number; xpToNext: number;
  coins: number; streakDays: number;
  quests: { id: string; name: string; done: number; total: number; xp: number; accent: 'xp'|'income'|'quest' }[];
  badges: { id: string; name: string; unlocked: boolean; accent: string }[];
};
```
Consumir via `hooks/use-gamification.ts` seguindo o padrão de `use-transactions.ts`
(react-query, mesma `lib/api.ts`). Enquanto o backend não existir, um mock local resolve —
os valores do protótipo estão nas seções acima.

Estado local por tela: foco de campo (login/signup), aba ativa (categorias), toggles (perfil,
persistidos em `secure-sync-storage` como as preferências atuais).

## Files
Referências de design neste bundle:
- `Boo Finance Leve.dc.html` — prancheta com as 11 telas
- `screens-boo.jsx` — todas as telas e componentes (fonte da verdade visual)
- `android-frame.jsx` — moldura de device do protótipo, **descartável** na implementação
- `boo-theme.ts` — tokens prontos para `packages/shared/src/theme`
- `ghost-pixels.ts` + `Ghost.native.tsx` — mascote em React Native

Arquivos do app que mudam:
```
packages/shared/src/theme/palette.ts        cores novas
packages/shared/src/theme/tokens.ts         radius, typography.family, tokens de gamificação
apps/mobile/app/_layout.tsx                 carregar Nunito
apps/mobile/app/welcome.tsx                 NOVA
apps/mobile/app/login.tsx                   redesenhada
apps/mobile/app/signup.tsx                  NOVA
apps/mobile/app/profile.tsx                 NOVA
apps/mobile/app/home.tsx                    XP, missões, conquistas, gráfico
apps/mobile/app/accounts.tsx                tokens
apps/mobile/components/BiometricGate.tsx    tela de desbloqueio
apps/mobile/components/TransactionForm.tsx  tokens
apps/mobile/components/Chunky.tsx           NOVA (sombra 2D)
apps/mobile/components/Ghost.tsx            NOVA (mascote)
apps/mobile/components/XPBar.tsx            NOVA
apps/mobile/components/QuestList.tsx        NOVA
apps/mobile/components/BadgeShelf.tsx       NOVA
apps/mobile/components/FlowChart.tsx        NOVA
apps/mobile/components/CategoryDonut.tsx    NOVA (react-native-svg)
apps/mobile/hooks/use-gamification.ts       NOVA
```

## Ordem sugerida de implementação
1. Tokens + Nunito + `Chunky` + `Ghost` (base visual)
2. Fluxo de auth (boas-vindas, login, signup, desbloqueio)
3. Home sem gamificação (tokens + gráfico de fluxo)
4. `use-gamification` mockado + XPBar, QuestList, BadgeShelf
5. Perfil, Metas, Categorias com donut
6. Contrato real da API de gamificação
