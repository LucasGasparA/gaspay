const colors = {
  brand: '#7A5AF8', brandPressed: '#6344E0', brandSubtle: '#EDE8FF', onBrand: '#FFFFFF',
  background: '#F4F0FF', surface: '#FFFFFF', border: '#E3DBFB',
  text: '#241C46', textSecondary: '#7A6FA8', textTertiary: '#ABA1CE',
  income: '#2ECC9A', danger: '#FF6B6B', warning: '#FFC145',
  coin: '#FFC145', xp: '#4CC9F0', quest: '#FF7BC8', shadow: '#DCD3F7',
};
const radius = { sm: 12, md: 20, lg: 28, pill: 999 };
const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const font = "'Nunito', -apple-system, system-ui, sans-serif";
const fw = { regular: 400, medium: 500, semibold: 600 };

function money(cents) {
  const v = Math.abs(cents) / 100;
  const s = v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (cents < 0 ? '-' : '') + 'R$ ' + s;
}

const card = (extra = {}) => ({
  background: colors.surface, borderRadius: radius.lg,
  border: `2px solid ${colors.border}`, boxShadow: `0 4px 0 ${colors.shadow}`,
  ...extra,
});

function Chip({ label, value, color, icon }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px 6px 8px',
      borderRadius: radius.pill, background: color + '1F', border: `2px solid ${color}40`,
      whiteSpace: 'nowrap',
    }}>
      <div style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }}>{icon}</div>
      <span style={{ fontSize: 13, fontWeight: 800, color: colors.text }}>{value}</span>
      {label && <span style={{ fontSize: 12, color: colors.textSecondary }}>{label}</span>}
    </div>
  );
}

function XPBar({ pct, level = 7, xp = 1840, next = 2500 }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginBottom: 6 }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, background: colors.brand, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, boxShadow: `0 3px 0 ${colors.brandPressed}` }}>{level}</div>
        <div style={{ flex: 1, fontSize: 13, fontWeight: 700, color: colors.text }}>Nível {level} · Poupador Assombroso</div>
        <div style={{ fontSize: 12, color: colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>{xp}/{next} XP</div>
      </div>
      <div style={{ height: 14, borderRadius: radius.pill, background: '#E9E2FC', border: `2px solid ${colors.border}`, overflow: 'hidden', position: 'relative' }}>
        <div style={{ height: '100%', width: Math.min(pct, 100) + '%', background: `linear-gradient(90deg, ${colors.xp}, ${colors.brand})`, borderRadius: radius.pill }} />
      </div>
    </div>
  );
}

const badges = [
  { name: 'Primeiro mês', color: '#FFC145', on: true },
  { name: 'Sem delivery', color: '#2ECC9A', on: true },
  { name: 'Meta batida', color: '#FF7BC8', on: true },
  { name: 'Investidor', color: '#4CC9F0', on: false },
];

function BadgeShelf({ items = badges }) {
  return (
    <div style={{ display: 'flex', gap: space.sm }}>
      {items.map(b => (
        <div key={b.name} style={{ flex: 1, textAlign: 'center' }}>
          <div style={{
            width: 46, height: 46, margin: '0 auto 6px', borderRadius: 16,
            background: b.on ? b.color + '26' : '#EFECF9',
            border: `2px solid ${b.on ? b.color : colors.border}`,
            boxShadow: b.on ? `0 3px 0 ${b.color}55` : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: b.on ? 1 : 0.55,
          }}>
            <div style={{ width: 18, height: 18, borderRadius: 5, background: b.on ? b.color : colors.textTertiary, transform: 'rotate(45deg)' }} />
          </div>
          <div style={{ fontSize: 10, lineHeight: 1.2, color: b.on ? colors.text : colors.textTertiary, fontWeight: 700 }}>{b.name}</div>
        </div>
      ))}
    </div>
  );
}

const quests = [
  { name: 'Registrar 5 gastos', done: 4, total: 5, xp: 40, color: '#4CC9F0' },
  { name: 'Ficar abaixo do limite de delivery', done: 1, total: 1, xp: 60, color: '#2ECC9A' },
  { name: 'Guardar R$ 100 na semana', done: 0, total: 1, xp: 80, color: '#FF7BC8' },
];

function QuestList({ items = quests }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space.sm }}>
      {items.map(q => {
        const complete = q.done >= q.total;
        return (
          <div key={q.name} style={{ display: 'flex', alignItems: 'center', gap: space.md, padding: '12px 14px', borderRadius: radius.md, background: complete ? q.color + '14' : '#FBFAFF', border: `2px solid ${complete ? q.color + '66' : colors.border}` }}>
            <div style={{ width: 24, height: 24, borderRadius: 8, flexShrink: 0, background: complete ? q.color : 'transparent', border: complete ? 'none' : `2px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>{complete ? '✓' : ''}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: colors.text }}>{q.name}</div>
              <div style={{ fontSize: 11, color: colors.textSecondary, marginTop: 2 }}>{q.done} de {q.total}</div>
            </div>
            <div style={{ fontSize: 12, fontWeight: 800, color: q.color, whiteSpace: 'nowrap' }}>+{q.xp} XP</div>
          </div>
        );
      })}
    </div>
  );
}

const GHOST_PX = [
  '......KKKK......',
  '....KKWWWWKK....',
  '...KWWWWWWWWK...',
  '..KWWWWWWWWWWK..',
  '.KWWWWWWWWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  'KWWWWWWWWWWWWWWK',
  'KWWWEEWWWWEEWWWK',
  'KWWWEEWWWWEEWWWK',
  'KWWBBWWWWWWBBWWK',
  'KWWWWWWWWWWWWWWK',
  'KWWWWWSSSSWWWWWK',
  '.KWWWSSSSSSWWWK.',
  '.KWSSSSSSSSSSWK.',
  '.KSSKKSSSSKKSSK.',
  '..KK..KKKK..KK..',
];
const GHOST_COLORS = { K: '#241C46', W: '#F5F2F0', S: '#CFC8D6', E: '#241C46', B: '#E8A79B' };

function Ghost({ size = 72, float = false }) {
  const cols = GHOST_PX[0].length, rows = GHOST_PX.length;
  const px = Math.max(1, Math.round((size / cols) * 100) / 100);
  const shadows = [];
  GHOST_PX.forEach((row, y) => row.split('').forEach((c, x) => {
    const col = GHOST_COLORS[c];
    if (col) shadows.push(`${x * px}px ${y * px}px 0 0 ${col}`);
  }));
  return (
    <div style={{ width: cols * px, height: rows * px, position: 'relative', flexShrink: 0, animation: float ? 'boo-float 3.4s steps(2, end) infinite' : 'none' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: px, height: px, boxShadow: shadows.join(', ') }} />
    </div>
  );
}

function Badge({ letter, color }) {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: radius.pill, background: color + '1A', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: fw.semibold, fontSize: 16, flexShrink: 0,
    }}>{letter}</div>
  );
}

function TxRow({ desc, cat, color, amountCents, kind, isLast }) {
  const isIncome = kind === 'income';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: space.md, padding: '12px 0',
      borderBottom: isLast ? 'none' : `1px solid ${colors.border}`,
    }}>
      <Badge letter={cat[0]} color={color} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: fw.medium, color: colors.text }}>{desc}</div>
        <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{cat}</div>
      </div>
      <div style={{
        fontSize: 15, fontWeight: fw.semibold, color: isIncome ? colors.income : colors.text,
        fontVariantNumeric: 'tabular-nums', flexShrink: 0, whiteSpace: 'nowrap',
      }}>{isIncome ? '+' : ''}{money(amountCents)}</div>
    </div>
  );
}

function ProgressBar({ pct, color = colors.brand }) {
  return (
    <div style={{ height: 6, borderRadius: radius.pill, background: colors.border, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: Math.min(pct, 100) + '%', background: color, borderRadius: radius.pill }} />
    </div>
  );
}

const tabs = ['Início', 'Extrato', 'Metas', 'Contas', 'Perfil'];
function TabBar({ active }) {
  return (
    <div style={{ display: 'flex', borderTop: `1px solid ${colors.border}`, background: colors.surface, paddingTop: 8, paddingBottom: 2, flexShrink: 0 }}>
      {tabs.map(t => (
        <div key={t} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: 6 }}>
          <div style={{ width: 20, height: 3, borderRadius: 2, background: t === active ? colors.brand : 'transparent' }} />
          <div style={{ fontSize: 11, fontWeight: t === active ? fw.semibold : fw.regular, color: t === active ? colors.brand : colors.textTertiary }}>{t}</div>
        </div>
      ))}
    </div>
  );
}

function FormRow({ label, value, isLast, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
      <div style={{ fontSize: 15, color: colors.textSecondary }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: fw.medium, color: colors.text, whiteSpace: 'nowrap' }}>
        {color && <div style={{ width: 10, height: 10, borderRadius: radius.pill, background: color, flexShrink: 0 }} />}
        {value} <span style={{ color: colors.textTertiary }}>›</span>
      </div>
    </div>
  );
}

function GhostField() {
  const spots = [
    { size: 30, top: 92, left: 28, op: 0.16 },
    { size: 20, top: 150, left: 320, op: 0.14 },
    { size: 44, top: 218, left: 344, op: 0.1 },
    { size: 24, top: 300, left: 46, op: 0.12 },
    { size: 16, top: 372, left: 296, op: 0.16 },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {spots.map((g, i) => (
        <div key={i} style={{ position: 'absolute', top: g.top, left: g.left, opacity: g.op }}>
          <Ghost size={g.size} />
        </div>
      ))}
    </div>
  );
}

function Field({ label, value, placeholder, secure, focused }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: colors.textSecondary, marginBottom: 6, letterSpacing: '0.02em' }}>{label}</div>
      <div style={{
        background: colors.surface, borderRadius: radius.md, padding: '14px 16px',
        border: `2px solid ${focused ? colors.brand : colors.border}`,
        boxShadow: focused ? `0 4px 0 ${colors.brandSubtle}` : `0 3px 0 ${colors.shadow}`,
        display: 'flex', alignItems: 'center', gap: space.sm,
      }}>
        <div style={{ flex: 1, fontSize: 15, fontWeight: value ? 700 : 400, color: value ? colors.text : colors.textTertiary, letterSpacing: secure ? '0.18em' : 'normal' }}>{value || placeholder}</div>
        {secure && <div style={{ fontSize: 12, fontWeight: 800, color: colors.brand }}>ver</div>}
      </div>
    </div>
  );
}

function BigButton({ label, variant = 'primary' }) {
  const primary = variant === 'primary';
  return (
    <div style={{
      borderRadius: radius.pill, padding: '16px', textAlign: 'center', fontSize: 16, fontWeight: 800,
      background: primary ? colors.brand : colors.surface,
      color: primary ? colors.onBrand : colors.text,
      border: primary ? 'none' : `2px solid ${colors.border}`,
      boxShadow: `0 5px 0 ${primary ? colors.brandPressed : colors.shadow}`,
    }}>{label}</div>
  );
}

function AuthHeader({ title, sub }) {
  return (
    <div style={{ padding: `${62 + space.md}px ${space.lg}px ${space.lg}px` }}>
      <div style={{ width: 34, height: 34, borderRadius: 12, background: colors.surface, border: `2px solid ${colors.border}`, boxShadow: `0 3px 0 ${colors.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text, fontSize: 16, marginBottom: space.lg }}>‹</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: colors.text }}>{title}</div>
      <div style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function WelcomeScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font, position: 'relative' }}>
        <GhostField />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingTop: 62, position: 'relative' }}>
          <div style={{ marginBottom: space.md }}><Ghost size={112} float /></div>
          <div style={{ fontSize: 34, fontWeight: 800, color: colors.brand }}>Boo Finance</div>
          <div style={{ fontSize: 15, color: colors.textSecondary, textAlign: 'center', maxWidth: 250 }}>Suas finanças leves como um fantasma. E com XP.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, marginTop: space.lg, padding: '8px 14px 8px 10px', borderRadius: radius.pill, background: colors.surface, border: `2px solid ${colors.border}`, boxShadow: `0 3px 0 ${colors.shadow}` }}>
            <div style={{ display: 'flex' }}>
              {[colors.coin, colors.quest, colors.xp].map((c, i) => (
                <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid #fff', marginLeft: i ? -8 : 0 }} />
              ))}
            </div>
            <div style={{ fontSize: 12, fontWeight: 700, color: colors.text }}>+12 mil poupadores em missão</div>
          </div>
        </div>
        <div style={{ padding: `0 ${space.lg}px ${space.xl}px`, display: 'flex', flexDirection: 'column', gap: space.md, position: 'relative' }}>
          <BigButton label="Criar minha conta" />
          <BigButton label="Já tenho conta" variant="ghost" />
          <div style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>Ao continuar, você aceita os termos de uso.</div>
        </div>
      </div>
    </AndroidDevice>
  );
}

function LoginScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font, position: 'relative' }}>
        <GhostField />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <AuthHeader title="Bem-vinda de volta" sub="Sua sequência de 12 dias está te esperando." />
          <div style={{ padding: `0 ${space.lg}px`, display: 'flex', flexDirection: 'column', gap: space.md }}>
            <Field label="E-MAIL" value="larissa.moraes@email.com" />
            <Field label="SENHA" value="••••••••" secure focused />
            <div style={{ alignSelf: 'flex-end', fontSize: 13, fontWeight: 800, color: colors.brand }}>Esqueci a senha</div>
            <BigButton label="Entrar" />
            <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, margin: `${space.xs}px 0` }}>
              <div style={{ flex: 1, height: 2, background: colors.border }} />
              <div style={{ fontSize: 12, color: colors.textTertiary, fontWeight: 700 }}>ou</div>
              <div style={{ flex: 1, height: 2, background: colors.border }} />
            </div>
            <BigButton label="Continuar com Google" variant="ghost" />
            <div style={{ textAlign: 'center', fontSize: 13, color: colors.textSecondary, marginTop: space.sm }}>
              Não tem conta? <span style={{ color: colors.brand, fontWeight: 800 }}>Criar agora</span>
            </div>
          </div>
        </div>
      </div>
    </AndroidDevice>
  );
}

function SignUpScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font, position: 'relative' }}>
        <GhostField />
        <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
          <AuthHeader title="Criar conta" sub="Leva 40 segundos e já vale 50 XP." />
          <div style={{ padding: `0 ${space.lg}px ${space.xl}px`, display: 'flex', flexDirection: 'column', gap: space.md }}>
            <Field label="COMO PODEMOS TE CHAMAR" value="Larissa" />
            <Field label="E-MAIL" placeholder="voce@email.com" />
            <Field label="CRIAR SENHA" placeholder="mínimo 8 caracteres" secure />
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {[colors.income, colors.income, colors.border].map((c, i) => (
                <div key={i} style={{ flex: 1, height: 6, borderRadius: radius.pill, background: c }} />
              ))}
              <span style={{ fontSize: 11, fontWeight: 800, color: colors.income, marginLeft: 4 }}>boa</span>
            </div>
            <div style={{ display: 'flex', gap: space.sm, alignItems: 'flex-start', padding: space.md, borderRadius: radius.md, background: colors.coin + '1A', border: `2px solid ${colors.coin}4D` }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: colors.coin, color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>$</div>
              <div style={{ fontSize: 12, color: colors.text, lineHeight: 1.4 }}>Você começa no <strong>nível 1</strong> com 100 moedas e 3 missões liberadas.</div>
            </div>
            <BigButton label="Criar conta e ganhar 50 XP" />
          </div>
        </div>
      </div>
    </AndroidDevice>
  );
}

function UnlockScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font, position: 'relative' }}>
        <GhostField />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space.md, paddingTop: 62, position: 'relative' }}>
          <div style={{ width: 56, height: 56, borderRadius: radius.pill, background: colors.brandSubtle, border: `2px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ghost size={30} /></div>
          <div style={{ fontSize: 20, fontWeight: 800, color: colors.text }}>Oi de novo, Larissa</div>
          <div style={{ fontSize: 14, color: colors.textSecondary, textAlign: 'center', maxWidth: 240 }}>Use a digital para entrar e manter sua sequência viva.</div>
          <div style={{ marginTop: space.md, width: 104, height: 104, borderRadius: radius.pill, background: colors.surface, border: `3px solid ${colors.brand}`, boxShadow: `0 5px 0 ${colors.shadow}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 46, height: 54, borderRadius: '50% 50% 45% 45%', border: `3px solid ${colors.brand}`, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 8, borderRadius: '50% 50% 45% 45%', border: `3px solid ${colors.brand}`, opacity: 0.6 }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: space.sm, padding: '6px 12px', borderRadius: radius.pill, background: colors.quest + '1F', border: `2px solid ${colors.quest}40` }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: colors.quest }} />
            <span style={{ fontSize: 12, fontWeight: 800, color: colors.text }}>12 dias seguidos</span>
          </div>
        </div>
        <div style={{ padding: `0 ${space.lg}px ${space.xl}px`, display: 'flex', flexDirection: 'column', gap: space.sm, position: 'relative' }}>
          <div style={{ textAlign: 'center', fontSize: 13, fontWeight: 800, color: colors.brand }}>Usar senha</div>
          <div style={{ textAlign: 'center', fontSize: 13, color: colors.textSecondary }}>Trocar de conta</div>
        </div>
      </div>
    </AndroidDevice>
  );
}

const budgets = [
  { name: 'Mercado', color: '#00A868', spent: 42000, limit: 60000 },
  { name: 'Restaurante', color: '#F5A623', spent: 38000, limit: 35000 },
  { name: 'Transporte', color: '#0A84D1', spent: 15000, limit: 40000 },
];
const recentTx = [
  { desc: 'Supermercado Extra', cat: 'Mercado', color: '#00A868', amount: 18450, kind: 'expense' },
  { desc: 'Salário', cat: 'Salário', color: '#00A868', amount: 620000, kind: 'income' },
  { desc: 'Uber', cat: 'Transporte', color: '#0A84D1', amount: 3200, kind: 'expense' },
  { desc: 'Netflix', cat: 'Assinaturas', color: '#820AD1', amount: 3990, kind: 'expense' },
  { desc: 'Restaurante Sabor', cat: 'Restaurante', color: '#F5A623', amount: 8900, kind: 'expense' },
];

const monthlyFlow = [
  { m: 'mar', income: 610000, expense: 428000 },
  { m: 'abr', income: 610000, expense: 391000 },
  { m: 'mai', income: 655000, expense: 470000 },
  { m: 'jun', income: 610000, expense: 355000 },
  { m: 'jul', income: 680000, expense: 412000 },
  { m: 'ago', income: 620000, expense: 394020 },
];

function FlowChart({ data = monthlyFlow, height = 132 }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense]));
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height, marginBottom: space.sm }}>
        {data.map((d, i) => {
          const last = i === data.length - 1;
          return (
            <div key={d.m} style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 3, height: '100%' }}>
              <div style={{ width: 9, height: (d.income / max) * height, background: last ? colors.income : colors.income + '59', borderRadius: '3px 3px 0 0' }} />
              <div style={{ width: 9, height: (d.expense / max) * height, background: last ? colors.brand : colors.brand + '40', borderRadius: '3px 3px 0 0' }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 14 }}>
        {data.map((d, i) => (
          <div key={d.m} style={{ flex: 1, textAlign: 'center', fontSize: 11, color: i === data.length - 1 ? colors.text : colors.textTertiary, fontWeight: i === data.length - 1 ? fw.medium : fw.regular }}>{d.m}</div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: space.md, marginTop: space.md }}>
        {[['Entradas', colors.income], ['Saídas', colors.brand]].map(([l, c]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: colors.textSecondary }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c }} />{l}
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ slices, total, size = 168, thickness = 22 }) {
  const r = (size - thickness) / 2;
  const circ = 2 * Math.PI * r;
  let acc = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {slices.map(s => {
          const len = (s.value / total) * circ;
          const el = (
            <circle key={s.name} cx={size / 2} cy={size / 2} r={r} fill="none"
              stroke={s.color} strokeWidth={thickness}
              strokeDasharray={len + ' ' + (circ - len)} strokeDashoffset={-acc} />
          );
          acc += len;
          return el;
        })}
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, color: colors.textSecondary }}>Total do mês</div>
        <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text, fontVariantNumeric: 'tabular-nums' }}>{money(total)}</div>
      </div>
    </div>
  );
}

function CategoryBreakdown({ slices, total }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {slices.map(s => (
        <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: space.sm, fontSize: 13 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
          <div style={{ flex: 1, color: colors.text }}>{s.name}</div>
          <div style={{ color: colors.textSecondary, fontVariantNumeric: 'tabular-nums' }}>{Math.round((s.value / total) * 100)}%</div>
          <div style={{ width: 78, textAlign: 'right', color: colors.text, fontWeight: fw.medium, fontVariantNumeric: 'tabular-nums' }}>{money(s.value)}</div>
        </div>
      ))}
    </div>
  );
}

const catSpend = [
  { name: 'Moradia', color: '#8E6B3F', value: 210000 },
  { name: 'Mercado', color: '#00A868', value: 42000 },
  { name: 'Restaurante', color: '#F5A623', value: 38000 },
  { name: 'Transporte', color: '#0A84D1', value: 15000 },
  { name: 'Assinaturas', color: '#820AD1', value: 3990 },
  { name: 'Saúde', color: '#E24141', value: 5670 },
];
const catSpendTotal = catSpend.reduce((a, c) => a + c.value, 0);

function HomeScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: `${62 + space.md}px ${space.lg}px ${space.xl}px`, display: 'flex', flexDirection: 'column', gap: space.xl }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: fw.semibold, color: colors.text }}>Oi, Larissa</div>
                <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>Segunda-feira, 11 de agosto</div>
              </div>
              <div style={{ width: 44, height: 44, borderRadius: radius.pill, background: colors.brandSubtle, border: `2px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ghost size={24} /></div>
            </div>

            <div style={card({ padding: space.md, display: 'flex', flexDirection: 'column', gap: space.md })}>
              <XPBar pct={73} />
              <div style={{ display: 'flex', gap: space.sm }}>
                <Chip icon="$" value="1.240" label="moedas" color={colors.coin} />
                <Chip icon="12" value="12 dias" label="seguidos" color={colors.quest} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.md }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: colors.text }}>Missões da semana</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.brand }}>2 de 3</div>
              </div>
              <QuestList />
            </div>
            <div>
              <div style={{ fontSize: 13, color: colors.textSecondary }}>Saldo total</div>
              <div style={{ fontSize: 36, fontWeight: fw.semibold, color: colors.text, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{money(1248035)}</div>
              <div style={{ display: 'flex', gap: space.xl, marginTop: space.md }}>
                <div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, whiteSpace: 'nowrap' }}>Entradas</div>
                  <div style={{ fontSize: 15, fontWeight: fw.semibold, color: colors.income, marginTop: 2, whiteSpace: 'nowrap' }}>+{money(620000)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 12, color: colors.textSecondary, whiteSpace: 'nowrap' }}>Saídas</div>
                  <div style={{ fontSize: 15, fontWeight: fw.semibold, color: colors.text, marginTop: 2, whiteSpace: 'nowrap' }}>{money(394020)}</div>
                </div>
              </div>
            </div>
            <div style={card({ padding: space.md })}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.md }}>
                <div style={{ fontSize: 15, fontWeight: fw.semibold, color: colors.text }}>Como foram os 6 meses</div>
                <div style={{ fontSize: 12, color: colors.income, fontWeight: fw.medium }}>+{money(225980)}</div>
              </div>
              <FlowChart />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text, marginBottom: space.md }}>Meus limites do mês</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
                {budgets.map(b => {
                  const pct = (b.spent / b.limit) * 100;
                  const over = pct > 100;
                  return (
                    <div key={b.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm, fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: colors.text, fontWeight: fw.medium, whiteSpace: 'nowrap' }}>{b.name}</span>
                        <span style={{ color: over ? colors.danger : colors.textSecondary, whiteSpace: 'nowrap' }}>{money(b.spent)} de {money(b.limit)}</span>
                      </div>
                      <ProgressBar pct={pct} color={over ? colors.danger : b.color} />
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={card({ padding: space.md })}>
              <div style={{ fontSize: 15, fontWeight: 800, color: colors.text, marginBottom: space.md }}>Conquistas</div>
              <BadgeShelf />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text, marginBottom: space.sm }}>Últimas transações</div>
              <div>{recentTx.map((t, i) => <TxRow key={i} desc={t.desc} cat={t.cat} color={t.color} amountCents={t.amount} kind={t.kind} isLast={i === recentTx.length - 1} />)}</div>
            </div>
          </div>
        </div>
        <TabBar active="Início" />
      </div>
    </AndroidDevice>
  );
}

const txGroups = [
  { label: 'Hoje', items: [
    { desc: 'Supermercado Extra', cat: 'Mercado', color: '#00A868', amount: 18450, kind: 'expense' },
    { desc: 'Uber', cat: 'Transporte', color: '#0A84D1', amount: 3200, kind: 'expense' },
  ] },
  { label: 'Ontem', items: [
    { desc: 'Netflix', cat: 'Assinaturas', color: '#820AD1', amount: 3990, kind: 'expense' },
    { desc: 'Farmácia São João', cat: 'Saúde', color: '#E24141', amount: 5670, kind: 'expense' },
  ] },
  { label: '6 de agosto', items: [
    { desc: 'Salário', cat: 'Salário', color: '#00A868', amount: 620000, kind: 'income' },
    { desc: 'Aluguel', cat: 'Moradia', color: '#8E6B3F', amount: 210000, kind: 'expense' },
    { desc: 'Restaurante Sabor', cat: 'Restaurante', color: '#F5A623', amount: 8900, kind: 'expense' },
  ] },
];

function TransactionsScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: `${62 + space.md}px ${space.lg}px 0` }}>
            <div style={{ fontSize: 28, fontWeight: fw.semibold, color: colors.text, marginBottom: space.md }}>Extrato</div>
            <div style={{ background: colors.surface, border: `1px solid ${colors.border}`, borderRadius: radius.md, padding: '10px 14px', fontSize: 15, color: colors.textTertiary, marginBottom: space.md }}>Buscar transação</div>
            <div style={{ display: 'flex', gap: space.sm, marginBottom: space.lg }}>
              {['Todos', 'Entradas', 'Saídas'].map((f, i) => (
                <div key={f} style={{ padding: '8px 16px', borderRadius: radius.pill, fontSize: 13, fontWeight: fw.medium, background: i === 0 ? colors.brand : colors.surface, color: i === 0 ? colors.onBrand : colors.textSecondary, border: i === 0 ? 'none' : `1px solid ${colors.border}` }}>{f}</div>
              ))}
            </div>
            {txGroups.map(g => (
              <div key={g.label} style={{ marginBottom: space.lg }}>
                <div style={{ fontSize: 13, color: colors.textSecondary, fontWeight: fw.medium, marginBottom: space.sm }}>{g.label}</div>
                {g.items.map((t, i) => <TxRow key={i} desc={t.desc} cat={t.cat} color={t.color} amountCents={t.amount} kind={t.kind} isLast={i === g.items.length - 1} />)}
              </div>
            ))}
          </div>
        </div>
        <TabBar active="Extrato" />
      </div>
    </AndroidDevice>
  );
}

function AddTransactionScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${62 + space.md}px ${space.lg}px ${space.md}px` }}>
            <div style={{ fontSize: 20, fontWeight: fw.semibold, color: colors.text }}>Nova transação</div>
            <div style={{ fontSize: 15, color: colors.textTertiary }}>✕</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: space.sm, padding: `0 ${space.lg}px ${space.lg}px` }}>
            {['Saída', 'Entrada'].map((k, i) => (
              <div key={k} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: radius.pill, fontSize: 15, fontWeight: fw.medium, background: i === 0 ? colors.brand : colors.surface, color: i === 0 ? colors.onBrand : colors.textSecondary, border: i === 0 ? 'none' : `1px solid ${colors.border}` }}>{k}</div>
            ))}
          </div>
          <div style={{ textAlign: 'center', padding: `${space.lg}px 0` }}>
            <div style={{ fontSize: 44, fontWeight: fw.semibold, color: colors.text, fontVariantNumeric: 'tabular-nums' }}>R$ 184,50</div>
          </div>
          <div style={{ background: colors.surface, borderRadius: radius.lg, margin: `0 ${space.lg}px`, overflow: 'hidden' }}>
            <FormRow label="Conta" value="Conta corrente" />
            <FormRow label="Categoria" value="Mercado" color="#00A868" />
            <FormRow label="Data" value="Hoje" />
            <FormRow label="Descrição" value="Supermercado Extra" isLast />
          </div>
        </div>
        <div style={{ padding: space.lg, flexShrink: 0 }}>
          <div style={{ background: colors.brand, borderRadius: radius.pill, padding: '16px', textAlign: 'center', color: colors.onBrand, fontSize: 17, fontWeight: fw.medium }}>Salvar</div>
        </div>
      </div>
    </AndroidDevice>
  );
}

const accounts = [
  { name: 'Conta corrente', type: 'Conta corrente', color: '#820AD1', balance: 842035 },
  { name: 'Reserva de emergência', type: 'Poupança', color: '#00A868', balance: 406000 },
  { name: 'Cartão principal', type: 'Cartão de crédito', color: '#E24141', balance: -127800 },
  { name: 'Carteira', type: 'Dinheiro', color: '#F5A623', balance: 15000 },
];

function AccountsScreen() {
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: `${62 + space.md}px ${space.lg}px 0` }}>
            <div style={{ fontSize: 28, fontWeight: fw.semibold, color: colors.text, marginBottom: space.xs }}>Contas</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: space.xs }}>Patrimônio líquido</div>
            <div style={{ fontSize: 32, fontWeight: fw.semibold, color: colors.text, marginBottom: space.lg, fontVariantNumeric: 'tabular-nums' }}>{money(total)}</div>
            <div style={{ background: colors.surface, borderRadius: radius.lg, overflow: 'hidden' }}>
              {accounts.map((a, i) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: space.md, padding: '16px', borderBottom: i === accounts.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                  <div style={{ width: 10, height: 10, borderRadius: radius.pill, background: a.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: fw.medium, color: colors.text }}>{a.name}</div>
                    <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{a.type}</div>
                  </div>
                  <div style={{ fontSize: 15, fontWeight: fw.semibold, color: a.balance < 0 ? colors.danger : colors.text, fontVariantNumeric: 'tabular-nums' }}>{money(a.balance)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: space.md, textAlign: 'center', padding: '14px', borderRadius: radius.lg, border: `1px dashed ${colors.border}`, color: colors.brand, fontSize: 15, fontWeight: fw.medium }}>+ Nova conta</div>
          </div>
        </div>
        <TabBar active="Contas" />
      </div>
    </AndroidDevice>
  );
}

const goals = [
  { name: 'Viagem para o Chile', saved: 280000, target: 800000, deadline: 'Dez 2026' },
  { name: 'Reserva de emergência', saved: 406000, target: 600000, deadline: 'Sem prazo' },
  { name: 'Notebook novo', saved: 120000, target: 450000, deadline: 'Mar 2027' },
];

function GoalsScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ padding: `${62 + space.md}px ${space.lg}px 0` }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: colors.text, marginBottom: 4 }}>Metas</div>
            <div style={{ fontSize: 13, color: colors.textSecondary, marginBottom: space.lg }}>Cada meta concluída vira XP e uma conquista nova.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
              {goals.map(g => {
                const pct = (g.saved / g.target) * 100;
                return (
                  <div key={g.name} style={card({ padding: space.lg })}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm, marginBottom: space.sm }}>
                      <div style={{ fontSize: 17, fontWeight: 800, color: colors.text }}>{g.name}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: colors.coin, background: colors.coin + '24', border: `2px solid ${colors.coin}55`, borderRadius: radius.pill, padding: '3px 9px', whiteSpace: 'nowrap' }}>+250 XP</div>
                    </div>
                    <ProgressBar pct={pct} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: space.sm, marginTop: space.sm, fontSize: 13 }}>
                      <span style={{ color: colors.textSecondary, whiteSpace: 'nowrap' }}>{money(g.saved)} guardado</span>
                      <span style={{ color: colors.text, fontWeight: fw.medium, whiteSpace: 'nowrap' }}>{Math.round(pct)}% de {money(g.target)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: space.md, textAlign: 'center', padding: '14px', borderRadius: radius.lg, border: `1px dashed ${colors.border}`, color: colors.brand, fontSize: 15, fontWeight: fw.medium }}>+ Nova meta</div>
          </div>
        </div>
        <TabBar active="Metas" />
      </div>
    </AndroidDevice>
  );
}

const expenseCats = [
  { name: 'Mercado', color: '#00A868' }, { name: 'Restaurante', color: '#F5A623' },
  { name: 'Transporte', color: '#0A84D1' }, { name: 'Moradia', color: '#8E6B3F' },
  { name: 'Saúde', color: '#E24141' }, { name: 'Educação', color: '#4A4A9E' },
  { name: 'Lazer', color: '#D10A8E' }, { name: 'Assinaturas', color: '#820AD1' },
  { name: 'Compras', color: '#0AB5B5' }, { name: 'Contas', color: '#5A078F' },
  { name: 'Outros', color: '#71717A' },
];

function CategoriesScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, padding: `${62 + space.md}px ${space.lg}px ${space.md}px` }}>
            <div style={{ width: 32, height: 32, borderRadius: radius.pill, background: colors.surface, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.text, fontSize: 16 }}>‹</div>
            <div style={{ fontSize: 20, fontWeight: fw.semibold, color: colors.text }}>Categorias</div>
          </div>
          <div style={{ display: 'flex', gap: space.sm, padding: `0 ${space.lg}px ${space.lg}px` }}>
            {['Despesas', 'Receitas'].map((k, i) => (
              <div key={k} style={{ flex: 1, textAlign: 'center', padding: '10px', borderRadius: radius.pill, fontSize: 14, fontWeight: fw.medium, background: i === 0 ? colors.brand : colors.surface, color: i === 0 ? colors.onBrand : colors.textSecondary, border: i === 0 ? 'none' : `1px solid ${colors.border}` }}>{k}</div>
            ))}
          </div>
          <div style={{ background: colors.surface, borderRadius: radius.lg, margin: `0 ${space.lg}px ${space.md}px`, padding: space.md, border: `2px solid ${colors.border}`, boxShadow: `0 4px 0 ${colors.shadow}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md }}>
            <DonutChart slices={catSpend} total={catSpendTotal} />
            <div style={{ width: '100%' }}>
              <CategoryBreakdown slices={catSpend} total={catSpendTotal} />
            </div>
          </div>
          <div style={{ background: colors.surface, borderRadius: radius.lg, margin: `0 ${space.lg}px`, overflow: 'hidden' }}>
            {expenseCats.map((c, i) => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: space.md, padding: '14px 16px', borderBottom: i === expenseCats.length - 1 ? 'none' : `1px solid ${colors.border}` }}>
                <Badge letter={c.name[0]} color={c.color} />
                <div style={{ fontSize: 15, color: colors.text, flex: 1 }}>{c.name}</div>
                <div style={{ color: colors.textTertiary, fontSize: 15 }}>›</div>
              </div>
            ))}
          </div>
          <div style={{ margin: `${space.md}px ${space.lg}px`, textAlign: 'center', padding: '14px', borderRadius: radius.lg, border: `1px dashed ${colors.border}`, color: colors.brand, fontSize: 15, fontWeight: fw.medium }}>+ Nova categoria</div>
        </div>
      </div>
    </AndroidDevice>
  );
}

function Switch({ on }) {
  return (
    <div style={{ width: 44, height: 26, borderRadius: radius.pill, background: on ? colors.brand : colors.border, position: 'relative', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 3, left: on ? 21 : 3, width: 20, height: 20, borderRadius: radius.pill, background: colors.surface, boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function SettingRow({ label, hint, value, toggle, on, isLast }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: space.md, padding: '14px 16px', borderBottom: isLast ? 'none' : `1px solid ${colors.border}` }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, color: colors.text }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}>{hint}</div>}
      </div>
      {toggle
        ? <Switch on={on} />
        : <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {value && <span style={{ fontSize: 14, color: colors.textSecondary }}>{value}</span>}
            <span style={{ color: colors.textTertiary, fontSize: 15 }}>›</span>
          </div>}
    </div>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <div style={{ margin: `0 ${space.lg}px ${space.md}px` }}>
      <div style={{ fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: colors.textSecondary, fontWeight: fw.medium, margin: `0 4px ${space.sm}px` }}>{title}</div>
      <div style={{ background: colors.surface, borderRadius: radius.lg, overflow: 'hidden', border: `2px solid ${colors.border}`, boxShadow: `0 4px 0 ${colors.shadow}` }}>{children}</div>
    </div>
  );
}

function ProfileScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: space.lg }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: space.sm, padding: `${62 + space.md}px ${space.lg}px ${space.md}px` }}>
            <div style={{ fontSize: 24, fontWeight: fw.semibold, color: colors.text }}>Perfil</div>
          </div>

          <div style={{ background: colors.surface, borderRadius: radius.lg, margin: `0 ${space.lg}px ${space.lg}px`, padding: space.md, border: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: space.md }}>
            <div style={{ width: 56, height: 56, borderRadius: radius.pill, background: colors.brandSubtle, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ghost size={32} /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text }}>Larissa Moraes</div>
              <div style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>larissa.moraes@email.com</div>
            </div>
            <div style={{ fontSize: 13, fontWeight: fw.medium, color: colors.brand, flexShrink: 0 }}>Editar</div>
          </div>

          <SettingsGroup title="Conta">
            <SettingRow label="Dados pessoais" hint="Nome, CPF, telefone" />
            <SettingRow label="Contas conectadas" value="3 bancos" />
            <SettingRow label="Assinatura" value="Grátis" isLast />
          </SettingsGroup>

          <SettingsGroup title="Preferências">
            <SettingRow label="Moeda" value="BRL (R$)" />
            <SettingRow label="Início do mês financeiro" value="Dia 1" />
            <SettingRow label="Modo escuro" toggle on={false} />
            <SettingRow label="Ocultar saldo ao abrir" hint="Mostra apenas ao tocar" toggle on={true} isLast />
          </SettingsGroup>

          <SettingsGroup title="Notificações">
            <SettingRow label="Alertas de orçamento" hint="Ao atingir 80% do limite" toggle on={true} />
            <SettingRow label="Resumo semanal" toggle on={true} />
            <SettingRow label="Lembrete de contas a pagar" toggle on={false} isLast />
          </SettingsGroup>

          <SettingsGroup title="Segurança">
            <SettingRow label="Biometria para abrir o app" toggle on={true} />
            <SettingRow label="Alterar senha" />
            <SettingRow label="Exportar meus dados" value="CSV" isLast />
          </SettingsGroup>

          <div style={{ margin: `${space.sm}px ${space.lg}px 0`, textAlign: 'center', padding: '14px', borderRadius: radius.lg, border: `1px solid ${colors.border}`, background: colors.surface, color: colors.danger, fontSize: 15, fontWeight: fw.medium }}>Sair da conta</div>
        </div>
        <TabBar active="Perfil" />
      </div>
    </AndroidDevice>
  );
}

Object.assign(window, {
  FlowChart, DonutChart, CategoryBreakdown, Ghost, XPBar, QuestList, BadgeShelf, Chip,
  WelcomeScreen, LoginScreen, SignUpScreen, UnlockScreen, HomeScreen, TransactionsScreen, AddTransactionScreen, AccountsScreen, GoalsScreen, CategoriesScreen, ProfileScreen,
});
