import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearAll, pets, healthRecords, activities, reminders } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const handleClearData = () => {
    Alert.alert(
      '清除所有数据',
      '这将永久删除所有猫咪、健康记录、活动和提醒。此操作不可撤销。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除所有',
          style: 'destructive',
          onPress: () => {
            clearAll();
            Alert.alert('完成', '所有数据已清除。');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      pets,
      healthRecords,
      activities,
      reminders,
      settings,
    };
    Alert.alert(
      '导出数据',
      `数据概览：\n• ${pets.length} 只猫咪\n• ${healthRecords.length} 条健康记录\n• ${activities.length} 条活动\n• ${reminders.length} 条提醒\n\n完整版将支持数据导出功能。`
    );
  };

  const StatItem = ({ icon, color, label, value }) => (
    <View style={styles.statItem}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appIcon}>🐱</Text>
        <Text style={styles.appName}>喵记</Text>
        <Text style={styles.appVersion}>版本 1.0.0</Text>
      </View>

      {/* General Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>通用</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#BA90C620' }]}>
              <Ionicons name="moon" size={20} color="#BA90C6" />
            </View>
            <View>
              <Text style={styles.settingLabel}>深色模式</Text>
              <Text style={styles.settingDescription}>
                切换深色外观
              </Text>
            </View>
          </View>
          <Switch
            value={settings.darkMode}
            onValueChange={(value) => updateSettings({ darkMode: value })}
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + '50',
            }}
            thumbColor={
              settings.darkMode ? theme.colors.primary : theme.colors.textLight
            }
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8A0BF20' }]}>
              <Ionicons name="notifications" size={20} color="#E8A0BF" />
            </View>
            <View>
              <Text style={styles.settingLabel}>通知</Text>
              <Text style={styles.settingDescription}>
                启用推送通知
              </Text>
            </View>
          </View>
          <Switch
            value={settings.notificationsEnabled}
            onValueChange={(value) =>
              updateSettings({ notificationsEnabled: value })
            }
            trackColor={{
              false: theme.colors.border,
              true: theme.colors.primary + '50',
            }}
            thumbColor={
              settings.notificationsEnabled
                ? theme.colors.primary
                : theme.colors.textLight
            }
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleExportData}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#9DC4E020' }]}>
              <Ionicons name="download-outline" size={20} color="#9DC4E0" />
            </View>
            <View>
              <Text style={styles.settingLabel}>导出数据</Text>
              <Text style={styles.settingDescription}>
                下载你的猫咪数据
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textLight}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E88B8B20' }]}>
              <Ionicons name="trash-outline" size={20} color="#E88B8B" />
            </View>
            <View>
              <Text style={styles.settingLabel}>清除所有数据</Text>
              <Text style={styles.settingDescription}>
                删除所有猫咪和记录
              </Text>
            </View>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.textLight}
          />
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>统计</Text>
        <View style={styles.statsGrid}>
          <StatItem
            icon="paw"
            color="#E8A0BF"
            label="猫咪总数"
            value={pets.length}
          />
          <StatItem
            icon="medkit"
            color="#BA90C6"
            label="健康记录"
            value={healthRecords.length}
          />
          <StatItem
            icon="footsteps"
            color="#9DC4E0"
            label="活动"
            value={activities.length}
          />
          <StatItem
            icon="alarm"
            color="#8BC7A3"
            label="提醒"
            value={reminders.length}
          />
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <View style={[styles.settingIcon, { backgroundColor: '#E8A0BF20' }]}>
              <Ionicons name="heart" size={20} color="#E8A0BF" />
            </View>
            <View>
              <Text style={styles.settingLabel}>用爱打造</Text>
              <Text style={styles.settingDescription}>
                专为爱猫人士打造 🐱
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
  },
  appIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.sm,
  },
  appName: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  appVersion: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: theme.spacing.md,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  settingDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statItem: {
    width: '47%',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});
