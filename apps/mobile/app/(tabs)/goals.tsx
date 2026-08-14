import { formatCents, lightTheme } from '@dindim/shared';
import { Link, useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar } from '../../components/ProgressBar';
import { useDeleteGoal, useGoals } from '../../hooks/use-goals';

const { colors, space, radius, typography } = lightTheme;

export default function Goals() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading } = useGoals();
  const deleteGoal = useDeleteGoal();
  const goals = data?.items ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + space.md }]}
    >
      <Text style={styles.title}>Metas</Text>

      {isLoading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: space.lg }} />
      ) : goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Nenhuma meta ainda"
          subtitle="Defina quanto quer juntar pra uma viagem, uma reserva ou o que for — e acompanhe o progresso aqui."
          actionLabel="Criar minha primeira meta"
          onAction={() => router.push('/goal/new')}
        />
      ) : (
        <View style={{ gap: space.md }}>
          {goals.map((goal) => {
            const saved = BigInt(goal.savedCents);
            const target = BigInt(goal.targetCents);
            const pct = target > 0n ? Number((saved * 100n) / target) : 0;
            return (
              <Pressable
                key={goal.id}
                style={styles.card}
                onLongPress={() => void deleteGoal.mutateAsync(goal.id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{goal.name}</Text>
                  <Text style={styles.deadline}>{goal.deadline ?? 'Sem prazo'}</Text>
                </View>
                <ProgressBar pct={pct} />
                <View style={styles.cardFooter}>
                  <Text style={styles.saved}>{formatCents(saved)} guardado</Text>
                  <Text style={styles.target}>
                    {Math.round(pct)}% de {formatCents(target)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      <Link href="/goal/new" asChild>
        <Text style={styles.newGoal}>+ Nova meta</Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: space.lg, paddingBottom: space.xl },
  title: {
    fontSize: typography.size.display,
    fontWeight: typography.weight.semibold,
    color: colors.text,
    marginBottom: space.lg,
  },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    gap: space.sm,
    marginBottom: space.sm,
  },
  name: { fontSize: 17, fontWeight: typography.weight.semibold, color: colors.text, flexShrink: 1 },
  deadline: { fontSize: typography.size.caption, color: colors.textTertiary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', gap: space.sm, marginTop: space.sm },
  saved: { fontSize: typography.size.footnote, color: colors.textSecondary },
  target: { fontSize: typography.size.footnote, fontWeight: typography.weight.medium, color: colors.text },
  empty: { textAlign: 'center', color: colors.textTertiary, fontSize: typography.size.body, marginTop: space.xl },
  newGoal: {
    marginTop: space.md,
    textAlign: 'center',
    paddingVertical: 14,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    color: colors.brand,
    fontSize: typography.size.body,
    fontWeight: typography.weight.medium,
  },
});
