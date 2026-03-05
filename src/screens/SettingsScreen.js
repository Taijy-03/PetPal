import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
  Linking,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import {
  isAdminPasswordSet,
  setAdminPassword,
  verifyAdminPassword,
  getLockoutStatus,
} from '../utils/adminAuth';

export default function SettingsScreen({ navigation }) {
  const { settings, updateSettings, clearAll, pets, healthRecords, activities, reminders } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalMode, setModalMode] = useState('verify'); // 'setup' or 'verify'
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasAdminPassword, setHasAdminPassword] = useState(false);

  // Hidden features state
  const [tapCount, setTapCount] = useState(0);
  const [showHiddenFeatures, setShowHiddenFeatures] = useState(false);
  const hiddenFadeAnim = useRef(new Animated.Value(0)).current;

  const revealHiddenFeatures = useCallback(() => {
    setShowHiddenFeatures(true);
    Animated.spring(hiddenFadeAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  }, [hiddenFadeAnim]);

  // Derived stats
  const deceasedPetsCount = pets.filter((p) => p.isDeceased).length;
  const alivePetsCount = pets.filter((p) => !p.isDeceased).length;
  const familyRelationsCount = pets.reduce(
    (acc, p) => acc + (p.relationships?.length || 0),
    0
  ) / 2; // each relation is stored twice

  // Check if admin password exists on mount
  useEffect(() => {
    checkPasswordStatus();
  }, []);

  const checkPasswordStatus = useCallback(async () => {
    const isSet = await isAdminPasswordSet();
    setHasAdminPassword(isSet);
  }, []);

  const resetModal = useCallback(() => {
    setShowPasswordModal(false);
    setPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setIsVerifying(false);
  }, []);

  const handleClearData = useCallback(async () => {
    // Check lockout first
    const lockout = await getLockoutStatus();
    if (lockout.isLocked) {
      Alert.alert(
        '账户已锁定',
        `密码错误次数过多，请 ${lockout.remainingMinutes} 分钟后再试`
      );
      return;
    }

    setPassword('');
    setConfirmPassword('');
    setPasswordError('');

    if (hasAdminPassword) {
      setModalMode('verify');
    } else {
      setModalMode('setup');
    }
    setShowPasswordModal(true);
  }, [hasAdminPassword]);

  const handleSetupPassword = useCallback(async () => {
    if (password.length < 6) {
      setPasswordError('密码至少需要 6 个字符');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('两次输入的密码不一致');
      return;
    }

    setIsVerifying(true);
    const result = await setAdminPassword(password);
    setIsVerifying(false);

    if (result.success) {
      setHasAdminPassword(true);
      resetModal();
      Alert.alert('设置成功', '管理员密码已设置。请再次点击清除数据以验证密码。');
    } else {
      setPasswordError(result.error);
    }
  }, [password, confirmPassword, resetModal]);

  const handleConfirmClear = useCallback(async () => {
    if (!password) {
      setPasswordError('请输入密码');
      return;
    }

    setIsVerifying(true);
    const result = await verifyAdminPassword(password);
    setIsVerifying(false);

    if (result.success) {
      resetModal();
      Alert.alert(
        '确认清除',
        '密码验证成功。确定要清除所有数据吗？此操作不可撤销。',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '确认清除',
            style: 'destructive',
            onPress: () => {
              clearAll();
              Alert.alert('完成', '所有数据已清除。');
            },
          },
        ]
      );
    } else {
      setPasswordError(result.error);
      if (result.isLocked) {
        setTimeout(() => resetModal(), 1500);
      }
    }
  }, [password, clearAll, resetModal]);

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
        <TouchableOpacity
          onPress={() => {
            const newCount = tapCount + 1;
            setTapCount(newCount);
            if (newCount >= 7 && !showHiddenFeatures) {
              revealHiddenFeatures();
              Alert.alert(
                '🐾 喵~ 你发现了秘密！',
                '猫咪家庭树和彩虹桥纪念册已解锁。\n\n📖 家庭树：记录猫咪之间的亲属关系\n🌈 纪念册：永远纪念离开的毛孩子',
              );
            } else if (newCount >= 3 && newCount < 7) {
              // No alert, just show progress
            }
          }}
          onLongPress={() => {
            if (!showHiddenFeatures) {
              revealHiddenFeatures();
              Alert.alert(
                '🐾 喵~ 你发现了秘密！',
                '猫咪家庭树和彩虹桥纪念册已解锁。\n\n📖 家庭树：记录猫咪之间的亲属关系\n🌈 纪念册：永远纪念离开的毛孩子',
              );
            }
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.appIcon}>🐱</Text>
        </TouchableOpacity>
        <Text style={styles.appName}>喵记</Text>
        <Text style={styles.appVersion}>版本 1.0.0</Text>
        {/* Unlock progress hint */}
        {tapCount >= 3 && tapCount < 7 && !showHiddenFeatures && (
          <View style={styles.unlockProgressContainer}>
            <View style={styles.unlockProgressBar}>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <View
                  key={i}
                  style={[
                    styles.unlockDot,
                    {
                      backgroundColor:
                        i <= tapCount
                          ? theme.colors.primary
                          : theme.colors.border,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={styles.unlockHintText}>
              再点 {7 - tapCount} 次... 🤫
            </Text>
          </View>
        )}
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
            value={alivePetsCount}
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
          {showHiddenFeatures && familyRelationsCount > 0 && (
            <StatItem
              icon="git-merge"
              color="#E8C547"
              label="家庭关系"
              value={Math.round(familyRelationsCount)}
            />
          )}
          {showHiddenFeatures && deceasedPetsCount > 0 && (
            <StatItem
              icon="heart-half"
              color="#BA90C6"
              label="已故猫咪"
              value={deceasedPetsCount}
            />
          )}
        </View>
      </View>

      {/* Hidden Features */}
      {showHiddenFeatures && (
        <Animated.View
          style={[
            styles.section,
            {
              opacity: hiddenFadeAnim,
              transform: [
                {
                  translateY: hiddenFadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.sectionTitle}>🐾 隐藏功能</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('CatFamilyBook')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#E8C54720' }]}>
                <Ionicons name="git-network" size={20} color="#E8C547" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>🌳 猫咪家庭树</Text>
                <Text style={styles.settingDescription}>
                  以树状图记录猫咪间的亲属关系
                </Text>
              </View>
            </View>
            {Math.round(familyRelationsCount) > 0 && (
              <View style={styles.settingBadge}>
                <Text style={styles.settingBadgeText}>
                  {Math.round(familyRelationsCount)}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('DeceasedCats')}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#BA90C620' }]}>
                <Ionicons name="heart-half" size={20} color="#BA90C6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.settingLabel}>🌈 彩虹桥纪念册</Text>
                <Text style={styles.settingDescription}>
                  永远纪念已离开的毛孩子
                </Text>
              </View>
            </View>
            {deceasedPetsCount > 0 && (
              <View style={[styles.settingBadge, { backgroundColor: '#BA90C620' }]}>
                <Text style={[styles.settingBadgeText, { color: '#BA90C6' }]}>
                  {deceasedPetsCount}
                </Text>
              </View>
            )}
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.colors.textLight}
            />
          </TouchableOpacity>
        </Animated.View>
      )}

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

      {/* Admin Password Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={resetModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalIconContainer}>
              <Ionicons
                name={modalMode === 'setup' ? 'key' : 'lock-closed'}
                size={32}
                color="#E88B8B"
              />
            </View>
            <Text style={styles.modalTitle}>
              {modalMode === 'setup' ? '设置管理员密码' : '管理员验证'}
            </Text>
            <Text style={styles.modalDescription}>
              {modalMode === 'setup'
                ? '首次使用需要设置管理员密码（至少 6 位），用于保护数据安全'
                : '清除所有数据需要管理员权限，请输入管理员密码'}
            </Text>
            <TextInput
              style={[
                styles.passwordInput,
                passwordError ? styles.passwordInputError : null,
              ]}
              placeholder={modalMode === 'setup' ? '设置密码（至少 6 位）' : '请输入管理员密码'}
              placeholderTextColor={theme.colors.textLight}
              secureTextEntry
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setPasswordError('');
              }}
              autoFocus
              editable={!isVerifying}
            />
            {modalMode === 'setup' && (
              <TextInput
                style={[
                  styles.passwordInput,
                  passwordError ? styles.passwordInputError : null,
                ]}
                placeholder="再次输入密码确认"
                placeholderTextColor={theme.colors.textLight}
                secureTextEntry
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setPasswordError('');
                }}
                editable={!isVerifying}
              />
            )}
            {passwordError ? (
              <Text style={styles.errorText}>{passwordError}</Text>
            ) : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={resetModal}
                disabled={isVerifying}
              >
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalConfirmButton,
                  isVerifying && styles.modalButtonDisabled,
                ]}
                onPress={modalMode === 'setup' ? handleSetupPassword : handleConfirmClear}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalConfirmText}>
                    {modalMode === 'setup' ? '设置密码' : '验证并清除'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  unlockProgressContainer: {
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  unlockProgressBar: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  unlockDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unlockHintText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
  },
  settingBadge: {
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  settingBadgeText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
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
  // Password Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E88B8B15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  modalDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  passwordInput: {
    width: '100%',
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    marginBottom: theme.spacing.sm,
  },
  passwordInputError: {
    borderColor: '#E88B8B',
  },
  errorText: {
    color: '#E88B8B',
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semiBold,
    color: theme.colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 44,
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#E88B8B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semiBold,
    color: '#FFFFFF',
  },
  modalButtonDisabled: {
    opacity: 0.6,
  },
});
