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
  getRelativeTime,
  getActivityIcon,
  getActivityTypeLabel,
} from '../utils/helpers';

export default function ActivityDetailScreen({ navigation, route }) {
  const { activityId } = route.params;
  const { activities, pets, removeActivity } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const activity = activities.find((a) => a.id === activityId);
  const pet = activity ? pets.find((p) => p.id === activity.petId) : null;

  if (!activity) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>找不到该活动</Text>
      </View>
    );
  }

  const handleDelete = () => {
    Alert.alert('删除活动', '确定要删除这条活动记录吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          await removeActivity(activityId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部 */}
      <View style={styles.header}>
        <Text style={styles.headerIcon}>{getActivityIcon(activity.type)}</Text>
        <Text style={styles.headerTitle}>
          {getActivityTypeLabel(activity.type)}
        </Text>
        <Text style={styles.headerTime}>{getRelativeTime(activity.date)}</Text>
      </View>

      {/* 详情卡片 */}
      <View style={styles.card}>
        <DetailRow
          icon="calendar-outline"
          label="日期"
          value={formatDate(activity.date)}
          theme={theme}
        />
        <DetailRow
          icon="paw-outline"
          label="猫咪"
          value={pet?.name || '未知'}
          theme={theme}
        />
        {activity.duration != null && (
          <DetailRow
            icon="timer-outline"
            label="时长"
            value={`${activity.duration} 分钟`}
            theme={theme}
          />
        )}
        {activity.distance != null && (
          <DetailRow
            icon="navigate-outline"
            label="距离"
            value={`${activity.distance} km`}
            theme={theme}
          />
        )}
        {activity.calories != null && (
          <DetailRow
            icon="flame-outline"
            label="消耗"
            value={`${activity.calories} 卡路里`}
            theme={theme}
          />
        )}
      </View>

      {/* 备注 */}
      {activity.notes ? (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>备注</Text>
          <Text style={styles.notesText}>{activity.notes}</Text>
        </View>
      ) : null}

      {/* 创建时间 */}
      {activity.createdAt && (
        <Text style={styles.createdAt}>
          创建于 {formatDate(activity.createdAt)}
        </Text>
      )}

      {/* 删除 & 编辑按钮 */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() =>
            navigation.navigate('AddActivity', {
              petId: activity.petId,
              activity,
            })
          }
        >
          <Ionicons name="pencil-outline" size={20} color={theme.colors.primary} />
          <Text style={[styles.actionBtnText, { color: theme.colors.primary }]}>编辑</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          <Text style={[styles.actionBtnText, { color: theme.colors.error }]}>删除</Text>
        </TouchableOpacity>
      </View>

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
      marginBottom: 4,
    },
    headerTime: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
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
    actionRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    actionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    },
    editBtn: {
      borderColor: theme.colors.primary + '40',
    },
    deleteBtn: {
      borderColor: theme.colors.error + '40',
    },
    actionBtnText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
    },
  });
