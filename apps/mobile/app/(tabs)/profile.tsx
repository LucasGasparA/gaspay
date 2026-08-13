import { lightTheme } from '@dindim/shared';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingRow } from '../../components/SettingRow';
import { SettingsGroup } from '../../components/SettingsGroup';
import { useMe } from '../../hooks/use-me';
import { signOut } from '../../lib/auth-client';
import { useTheme } from '../../lib/theme-context';

const { colors, space, radius, typography } = lightTheme;

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.charAt(0) ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : '';
  return (first + last).toUpperCase();
}

export default function Profile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: me } = useMe();
  const { isDark, setDark } = useTheme();

  // Preferências ainda não têm backend — toggles são só locais por enquanto.
  const [hideBalance, setHideBalance] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [billReminder, setBillReminder] = useState(false);
  const [biometrics, setBiometrics] = useState(true);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
    >
      <Text style={styles.title}>Perfil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarLabel}>{me ? initials(me.user.name) : ''}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{me?.user.name ?? '...'}</Text>
          <Text style={styles.email}>{me?.user.email ?? ''}</Text>
        </View>
        <Text style={styles.editLink}>Editar</Text>
      </View>

      <SettingsGroup title="Conta">
        <SettingRow label="Dados pessoais" hint="Nome, CPF, telefone" />
        <SettingRow label="Contas conectadas" value="3 bancos" />
        <SettingRow label="Assinatura" value="Grátis" isLast />
      </SettingsGroup>

      <SettingsGroup title="Preferências">
        <SettingRow label="Moeda" value="BRL (R$)" />
        <SettingRow label="Início do mês financeiro" value="Dia 1" />
        <SettingRow label="Modo escuro" toggle on={isDark} onToggle={setDark} />
        <SettingRow
          label="Ocultar saldo ao abrir"
          hint="Mostra apenas ao tocar"
          toggle
          on={hideBalance}
          onToggle={setHideBalance}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup title="Notificações">
        <SettingRow
          label="Alertas de orçamento"
          hint="Ao atingir 80% do limite"
          toggle
          on={budgetAlerts}
          onToggle={setBudgetAlerts}
        />
        <SettingRow label="Resumo semanal" toggle on={weeklySummary} onToggle={setWeeklySummary} />
        <SettingRow
          label="Lembrete de contas a pagar"
          toggle
          on={billReminder}
          onToggle={setBillReminder}
          isLast
        />
      </SettingsGroup>

      <SettingsGroup title="Segurança">
        <SettingRow label="Biometria para abrir o app" toggle on={biometrics} onToggle={setBiometrics} />
        <SettingRow label="Alterar senha" />
        <SettingRow label="Exportar meus dados" value="CSV" isLast />
      </SettingsGroup>

      <SettingsGroup title="Organização">
        <SettingRow label="Categorias" onPress={() => router.push('/categories')} isLast />
      </SettingsGroup>

      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutLabel}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  title: { fontSize: typography.size.heading, fontWeight: typography.weight.semibold, color: colors.text, marginBottom: space.md },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    marginBottom: space.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.brandSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { color: colors.brand, fontWeight: typography.weight.semibold, fontSize: typography.size.title },
  profileInfo: { flex: 1, minWidth: 0 },
  name: { fontSize: 17, fontWeight: typography.weight.semibold, color: colors.text },
  email: { fontSize: typography.size.footnote, color: colors.textSecondary, marginTop: 2 },
  editLink: { fontSize: typography.size.footnote, fontWeight: typography.weight.medium, color: colors.brand },
  signOut: {
    marginTop: space.sm,
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  signOutLabel: { color: colors.danger, fontSize: typography.size.body, fontWeight: typography.weight.medium },
});
