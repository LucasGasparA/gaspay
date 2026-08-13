const colors = {
  brand: '#820AD1', brandPressed: '#6E09B0', brandSubtle: '#F6EDFD', onBrand: '#FFFFFF',
  background: '#F4F4F6', surface: '#FFFFFF', border: '#E9E9EE',
  text: '#191919', textSecondary: '#71717A', textTertiary: '#A1A1AA',
  income: '#00A868', danger: '#E24141', warning: '#F5A623',
};
const radius = { sm: 8, md: 16, lg: 24, pill: 999 };
const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const font = "'Inter Tight', -apple-system, system-ui, sans-serif";
const fw = { regular: 400, medium: 500, semibold: 600 };

function money(cents) {
  const v = Math.abs(cents) / 100;
  const s = v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (cents < 0 ? '-' : '') + 'R$ ' + s;
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

function LoginScreen() {
  return (
    <AndroidDevice>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: colors.background, fontFamily: font }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingTop: 62 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.onBrand, fontSize: 32, fontWeight: fw.semibold, marginBottom: space.sm }}>B</div>
          <div style={{ fontSize: 32, fontWeight: fw.semibold, color: colors.brand }}>Boo Finance</div>
          <div style={{ fontSize: 15, color: colors.textSecondary }}>Seu dinheiro, sem enrolação.</div>
        </div>
        <div style={{ padding: `0 ${space.lg}px ${space.xl}px`, display: 'flex', flexDirection: 'column', gap: space.md }}>
          <div style={{ background: colors.brand, borderRadius: radius.pill, padding: '16px', textAlign: 'center', color: colors.onBrand, fontSize: 17, fontWeight: fw.medium }}>Entrar com Google</div>
          <div style={{ fontSize: 12, color: colors.textTertiary, textAlign: 'center' }}>Ao continuar, você aceita os termos de uso.</div>
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
              <div style={{ width: 40, height: 40, borderRadius: radius.pill, background: colors.brandSubtle, color: colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: fw.semibold, fontSize: 15 }}>LM</div>
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
            <div style={{ background: colors.surface, borderRadius: radius.lg, padding: space.md, border: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: space.md }}>
                <div style={{ fontSize: 15, fontWeight: fw.semibold, color: colors.text }}>Últimos 6 meses</div>
                <div style={{ fontSize: 12, color: colors.income, fontWeight: fw.medium }}>+{money(225980)}</div>
              </div>
              <FlowChart />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text, marginBottom: space.md }}>Orçamentos do mês</div>
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
            <div style={{ fontSize: 28, fontWeight: fw.semibold, color: colors.text, marginBottom: space.lg }}>Metas</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: space.md }}>
              {goals.map(g => {
                const pct = (g.saved / g.target) * 100;
                return (
                  <div key={g.name} style={{ background: colors.surface, borderRadius: radius.lg, padding: space.lg }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: space.sm, marginBottom: space.sm }}>
                      <div style={{ fontSize: 17, fontWeight: fw.semibold, color: colors.text }}>{g.name}</div>
                      <div style={{ fontSize: 12, color: colors.textTertiary, whiteSpace: 'nowrap' }}>{g.deadline}</div>
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
          <div style={{ background: colors.surface, borderRadius: radius.lg, margin: `0 ${space.lg}px ${space.md}px`, padding: space.md, border: `1px solid ${colors.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: space.md }}>
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
      <div style={{ background: colors.surface, borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${colors.border}` }}>{children}</div>
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
            <div style={{ width: 56, height: 56, borderRadius: radius.pill, background: colors.brandSubtle, color: colors.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: fw.semibold, fontSize: 20, flexShrink: 0 }}>LM</div>
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
  FlowChart, DonutChart, CategoryBreakdown,
  LoginScreen, HomeScreen, TransactionsScreen, AddTransactionScreen, AccountsScreen, GoalsScreen, CategoriesScreen, ProfileScreen,
});
