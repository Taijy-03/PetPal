import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import {
  formatDate,
  getHealthIcon,
  getHealthTypeLabel,
} from '../utils/helpers';

export default function HealthRecordDetailScreen({ navigation, route }) {
  const { recordId } = route.params;
  const { healthRecords, pets, removeHealthRecord } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const record = healthRecords.find((r) => r.id === recordId);
  const pet = record ? pets.find((p) => p.id === record.petId) : null;

  if (!record) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>找不到该记录</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除记录', `确定要删除"${record.title}"吗？`, [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeHealthRecord(record.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{getHealthIcon(record.type)}</Text>
        <Text style={styles.headerTitle}>{record.title}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{getHealthTypeLabel(record.type)}</Text>
        </View>
      </View>

      {/* 详情卡片 */}
      <View style={styles.card}>
        <DetailRow
          icon="calendar-outline"
          label="日期"
          value={formatDate(record.date)}
          theme={theme}
        />
        <DetailRow
          icon="paw-outline"
          label="猫咪"
          value={pet?.name || '未知'}
          theme={theme}
        />
        {record.veterinarian && (
          <DetailRow
            icon="person-outline"
            label="兽医"
            value={record.veterinarian}
            theme={theme}
          />
        )}
        {record.clinic && (
          <DetailRow
            icon="business-outline"
            label="诊所"
            value={record.clinic}
            theme={theme}
          />
        )}
        {record.cost != null && (
          <DetailRow
            icon="cash-outline"
            label="费用"
            value={`RM${record.cost}`}
            theme={theme}
          />
        )}
        {record.nextDueDate && (
          <DetailRow
            icon="refresh-outline"
            label="下次日期"
            value={formatDate(record.nextDueDate)}
            theme={theme}
          />
        )}
      </View>

      {/* 备注 */}
      {record.notes ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>备注</Text>
          <Text style={styles.notesText}>{record.notes}</Text>
        </View>
      ) : null}

      {/* 创建时间 */}
      {record.createdAt && (
        <Text style={styles.createdAt}>
          创建于 {formatDate(record.createdAt)}
        </Text>
      )}

      {/* 删除按钮 */}
      <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        <Text style={styles.deleteBtnText}>删除此记录</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function DetailRow({ icon, label, value, theme }) {
  const styles = React.useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        <Ionicons name={icon} size={20} color={theme.colors.textSecondary} />
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
    },
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerIcon: {
      fontSize: 48,
      marginBottom: theme.spacing.sm,
    },
    headerTitle: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    badge: {
      backgroundColor: theme.colors.secondary + '20',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.round,
    },
    badgeText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.secondary,
      fontWeight: theme.fontWeight.semibold,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm + 4,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    detailLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      maxWidth: '55%',
      textAlign: 'right',
    },
    sectionTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    notesText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    createdAt: {
      textAlign: 'center',
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginTop: theme.spacing.lg,
    },
    deleteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.error + '40',
    },
    deleteBtnText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.error,
    },
  });
