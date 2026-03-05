import React, { useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import PetCard from '../components/PetCard';
import EmptyState from '../components/EmptyState';
import {
  getRelativeTime,
  getActivityIcon,
  getHealthIcon,
  getPetTypeIcon,
  getActivityTypeLabel,
  getHealthTypeLabel,
  formatDate,
  calculateAge,
} from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Cat care tips
const CAT_TIPS = [
  { emoji: '💧', tip: '成年猫每天需要约200-300ml的水，保持水碗清洁哦~' },
  { emoji: '🐟', tip: '猫咪是肉食动物，蛋白质是它们最重要的营养来源' },
  { emoji: '😺', tip: '猫咪缓慢眨眼是在对你说"我爱你"' },
  { emoji: '🧶', tip: '每天15-20分钟的互动游戏可以让猫咪保持健康体重' },
  { emoji: '🌙', tip: '猫咪每天大约睡16个小时，是真正的睡神！' },
  { emoji: '🪥', tip: '定期给猫咪刷牙可以预防口腔疾病' },
  { emoji: '🏠', tip: '猫咪需要一个安全的高处来观察周围的环境' },
  { emoji: '🧹', tip: '猫砂盆每天至少清理一次，猫咪很爱干净的' },
  { emoji: '🌿', tip: '猫草可以帮助猫咪排出毛球，建议定期提供' },
  { emoji: '❤️', tip: '猫咪发出的咕噜声频率在25-150Hz，有助于愈合骨骼' },
  { emoji: '🎯', tip: '猫咪的胡须可以感知气流变化，千万不要修剪哦' },
  { emoji: '🔔', tip: '猫咪对主人的声音有独特的反应，多和它说话吧' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 6) return { text: '夜猫子~ 🌙', sub: '深夜了，猫咪们睡着了吗？' };
  if (hour < 9) return { text: '早安喵~ ☀️', sub: '新的一天开始啦！' };
  if (hour < 12) return { text: '上午好~ 🌤️', sub: '猫咪们还好吗？' };
  if (hour < 14) return { text: '中午好~ 🌞', sub: '记得给猫咪喂饭哦！' };
  if (hour < 18) return { text: '下午好~ 🍵', sub: '和猫咪一起享受下午时光~' };
  if (hour < 21) return { text: '晚上好~ 🌆', sub: '猫咪们在等你回家呢~' };
  return { text: '晚安喵~ 🌙', sub: '和猫咪一起休息吧~' };
}

function getTodayDateString() {
  const now = new Date();
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekday = weekdays[now.getDay()];
  return `${month}月${day}日 ${weekday}`;
}

export default function HomeScreen({ navigation }) {
  const {
    pets,
    activities,
    healthRecords,
    reminders,
    isLoading,
    refreshData,
    selectPet,
  } = useApp();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [refreshing, setRefreshing] = useState(false);
  const [petPickerVisible, setPetPickerVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, []);

  const greeting = getGreeting();
  const todayDate = getTodayDateString();

  // Daily tip (changes each day)
  const dailyTip = useMemo(() => {
    const dayOfYear = Math.floor(
      (new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    return CAT_TIPS[dayOfYear % CAT_TIPS.length];
  }, []);

  // Get recent activities (last 3)
  const recentActivities = useMemo(
    () =>
      [...activities]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3),
    [activities]
  );

  // Get upcoming reminders (最多 2 条)
  const upcomingReminders = useMemo(
    () =>
      [...reminders]
        .filter((r) => new Date(r.dateTime) >= new Date() && r.isActive !== false)
        .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
        .slice(0, 2),
    [reminders]
  );

  // Today's activities
  const todayActivities = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return activities.filter((a) => {
      const d = new Date(a.date);
      return d >= today && d < tomorrow;
    });
  }, [activities]);

  // Recent health records (last 2)
  const recentHealthRecords = useMemo(
    () =>
      [...healthRecords]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 2),
    [healthRecords]
  );

  // Stats
  const totalPets = pets.length;
  const totalRecords = healthRecords.length;
  const totalActivities = activities.length;
  const activeReminders = reminders.filter((r) => r.isActive !== false).length;

  // Today's care checklist
  const careChecklist = useMemo(() => {
    const todayTypes = new Set(todayActivities.map((a) => a.type));
    return [
      { type: 'feed', label: '喂食', icon: '🐟', done: todayTypes.has('feed') },
      { type: 'litter', label: '铲屎', icon: '🚽', done: todayTypes.has('litter') },
      { type: 'play', label: '玩耍', icon: '🧶', done: todayTypes.has('play') },
      { type: 'groom', label: '梳毛', icon: '🪮', done: todayTypes.has('groom') },
      { type: 'cuddle', label: '撸猫', icon: '🤗', done: todayTypes.has('cuddle') },
    ];
  }, [todayActivities]);

  const completedCare = careChecklist.filter((c) => c.done).length;

  // Quick actions
  const quickActions = [
    { icon: 'restaurant-outline', label: '喂食', color: '#E8C547', screen: 'AddActivity', params: { presetType: 'feed' } },
    { icon: 'medkit-outline', label: '健康', color: '#A8D5A2', screen: 'AddHealthRecord' },
    { icon: 'game-controller-outline', label: '玩耍', color: '#9DC4E0', screen: 'AddActivity', params: { presetType: 'play' } },
    { icon: 'alarm-outline', label: '提醒', color: '#F9D89C', screen: 'AddReminder' },
  ];

  const handlePetPress = (pet) => {
    selectPet(pet);
    navigation.navigate('PetDetail', { petId: pet.id });
  };

  const navigateWithPet = (petId, action) => {
    if (action.params) {
      navigation.navigate(action.screen, { petId, ...action.params });
    } else {
      navigation.navigate(action.screen, { petId });
    }
  };

  const handleQuickAction = (action) => {
    if (pets.length === 0) {
      navigation.navigate('AddPet');
      return;
    }
    if (pets.length === 1) {
      navigateWithPet(pets[0].id, action);
      return;
    }
    // Multiple pets — show picker
    setPendingAction(action);
    setPetPickerVisible(true);
  };

  const handlePetSelected = (pet) => {
    setPetPickerVisible(false);
    if (pendingAction) {
      navigateWithPet(pet.id, pendingAction);
      setPendingAction(null);
    }
  };

  const handleChecklistAction = (itemType) => {
    const action = { screen: 'AddActivity', params: { presetType: itemType } };
    handleQuickAction(action);
  };

  if (pets.length === 0 && !isLoading) {
    return (
      <View style={styles.container}>
        <EmptyState
          emoji="🐱"
          title="欢迎来到喵记！"
          message="开始添加你的第一只猫咪，记录它的健康、活动和美好时光吧~"
          actionLabel="添加你的猫咪"
          onAction={() => navigation.navigate('AddPet')}
        />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary}
          colors={[theme.colors.primary]}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with Greeting */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.dateText}>{todayDate}</Text>
            <Text style={styles.greeting}>{greeting.text}</Text>
            <Text style={styles.greetingSub}>{greeting.sub}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddPet')}
          >
            <Ionicons name="paw" size={18} color="#FFF" />
            <Text style={styles.addButtonText}>添加猫咪</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Tip Banner */}
        <View style={styles.tipBanner}>
          <Text style={styles.tipEmoji}>{dailyTip.emoji}</Text>
          <View style={styles.tipContent}>
            <Text style={styles.tipLabel}>每日小贴士</Text>
            <Text style={styles.tipText} numberOfLines={2}>{dailyTip.tip}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        {quickActions.map((action, index) => (
          <TouchableOpacity
            key={index}
            style={styles.quickActionItem}
            onPress={() => handleQuickAction(action)}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
              <Ionicons name={action.icon} size={24} color={action.color} />
            </View>
            <Text style={styles.quickActionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#E8C547' }]}
          onPress={() => navigation.navigate('PetsTab')}
          activeOpacity={0.8}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="paw" size={22} color="#FFF" />
          </View>
          <Text style={styles.statNumber}>{totalPets}</Text>
          <Text style={styles.statLabel}>猫咪</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#A8D5A2' }]}
          activeOpacity={0.8}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="medkit" size={22} color="#FFF" />
          </View>
          <Text style={styles.statNumber}>{totalRecords}</Text>
          <Text style={styles.statLabel}>健康记录</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#9DC4E0' }]}
          activeOpacity={0.8}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="footsteps" size={22} color="#FFF" />
          </View>
          <Text style={styles.statNumber}>{totalActivities}</Text>
          <Text style={styles.statLabel}>活动</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.statCard, { backgroundColor: '#F9D89C' }]}
          onPress={() => navigation.navigate('RemindersTab')}
          activeOpacity={0.8}
        >
          <View style={styles.statIconContainer}>
            <Ionicons name="notifications" size={22} color="#FFF" />
          </View>
          <Text style={styles.statNumber}>{activeReminders}</Text>
          <Text style={styles.statLabel}>提醒</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Today's Care Checklist */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="checkbox-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>今日照顾</Text>
          </View>
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>
              {completedCare}/{careChecklist.length}
            </Text>
          </View>
        </View>
        <View style={styles.careChecklistContainer}>
          {/* Progress Bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    width: `${(completedCare / careChecklist.length) * 100}%`,
                    backgroundColor:
                      completedCare === careChecklist.length
                        ? theme.colors.success
                        : theme.colors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <View style={styles.checklistRow}>
            {careChecklist.map((item) => (
              <TouchableOpacity
                key={item.type}
                style={[
                  styles.checklistItem,
                  item.done && styles.checklistItemDone,
                ]}
                onPress={() => {
                  if (!item.done && pets.length > 0) {
                    handleChecklistAction(item.type);
                  }
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.checklistEmoji}>{item.icon}</Text>
                <Text
                  style={[
                    styles.checklistLabel,
                    item.done && styles.checklistLabelDone,
                  ]}
                >
                  {item.label}
                </Text>
                {item.done && (
                  <Ionicons
                    name="checkmark-circle"
                    size={14}
                    color={theme.colors.success}
                    style={styles.checkIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* My Pets */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="heart-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>我的猫咪</Text>
          </View>
          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={() => navigation.navigate('PetsTab')}
          >
            <Text style={styles.seeAll}>查看全部</Text>
            <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
        {pets.slice(0, 3).map((pet) => (
          <PetCard
            key={pet.id}
            pet={pet}
            onPress={() => handlePetPress(pet)}
          />
        ))}
        {pets.length > 3 && (
          <TouchableOpacity
            style={styles.showMoreButton}
            onPress={() => navigation.navigate('PetsTab')}
          >
            <Text style={styles.showMoreText}>
              还有 {pets.length - 3} 只猫咪...
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Health Records */}
      {recentHealthRecords.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="fitness-outline" size={20} color={theme.colors.success} />
              <Text style={styles.sectionTitle}>健康档案</Text>
            </View>
            {healthRecords.length > 2 && (
              <TouchableOpacity
                style={styles.seeAllButton}
                onPress={() => navigation.navigate('PetDetail', { petId: pets[0]?.id })}
              >
                <Text style={styles.seeAll}>查看全部</Text>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          {recentHealthRecords.map((record) => {
            const pet = pets.find((p) => p.id === record.petId);
            return (
              <TouchableOpacity
                key={record.id}
                style={styles.healthItem}
                onPress={() =>
                  navigation.navigate('HealthRecordDetail', {
                    recordId: record.id,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={[styles.healthIconContainer, { backgroundColor: theme.colors.success + '15' }]}>
                  <Text style={styles.healthIcon}>
                    {getHealthIcon(record.type)}
                  </Text>
                </View>
                <View style={styles.healthInfo}>
                  <Text style={styles.healthTitle}>
                    {getHealthTypeLabel(record.type)}
                  </Text>
                  <Text style={styles.healthSubtitle}>
                    {pet?.name || '未知猫咪'} • {formatDate(record.date)}
                  </Text>
                  {record.notes && (
                    <Text style={styles.healthNotes} numberOfLines={1}>
                      {record.notes}
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Recent Activity */}
      {recentActivities.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="time-outline" size={20} color={theme.colors.info} />
              <Text style={styles.sectionTitle}>最近活动</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('AllActivities')}
            >
              <Text style={styles.seeAll}>全部</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {recentActivities.map((activity) => {
            const pet = pets.find((p) => p.id === activity.petId);
            return (
              <TouchableOpacity
                key={activity.id}
                style={styles.activityItem}
                onPress={() =>
                  navigation.navigate('ActivityDetail', {
                    activityId: activity.id,
                  })
                }
                activeOpacity={0.7}
              >
                <View style={styles.activityIconContainer}>
                  <Text style={styles.activityIcon}>
                    {getActivityIcon(activity.type)}
                  </Text>
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>
                    {getActivityTypeLabel(activity.type)}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {pet?.name || '未知猫咪'} •{' '}
                    {getRelativeTime(activity.date)}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={theme.colors.textLight} />
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Ionicons name="alarm-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.sectionTitle}>即将到来</Text>
            </View>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate('RemindersTab')}
            >
              <Text style={styles.seeAll}>全部提醒</Text>
              <Ionicons name="chevron-forward" size={14} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          {upcomingReminders.map((reminder) => {
            const pet = pets.find((p) => p.id === reminder.petId);
            const reminderDate = new Date(reminder.dateTime);
            const now = new Date();
            // Compare by calendar date, not time difference
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const reminderDayStart = new Date(reminderDate.getFullYear(), reminderDate.getMonth(), reminderDate.getDate());
            const diffDays = Math.round((reminderDayStart - todayStart) / 86400000);
            const isUrgent = diffDays <= 1;
            return (
              <View
                key={reminder.id}
                style={[
                  styles.reminderItem,
                  isUrgent && styles.reminderItemUrgent,
                ]}
              >
                <View style={[styles.reminderIconBox, isUrgent && styles.reminderIconUrgent]}>
                  <Ionicons
                    name={isUrgent ? 'alarm' : 'alarm-outline'}
                    size={20}
                    color={isUrgent ? theme.colors.error : theme.colors.warning}
                  />
                </View>
                <View style={styles.reminderInfo}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <Text style={styles.reminderSubtitle}>
                    {pet?.name} •{' '}
                    {reminderDate.toLocaleDateString('zh-CN')}
                  </Text>
                </View>
                <View style={[styles.reminderDaysBadge, isUrgent && styles.reminderDaysBadgeUrgent]}>
                  <Text style={[styles.reminderDaysText, isUrgent && styles.reminderDaysTextUrgent]}>
                    {diffDays <= 0 ? '今天' : diffDays === 1 ? '明天' : `${diffDays}天后`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Bottom Spacer */}
      <View style={{ height: theme.spacing.xxl }} />

      {/* Pet Picker Modal */}
      <Modal
        visible={petPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPetPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPetPickerVisible(false)}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1}>
              <View style={styles.modalContent}>
                <View style={styles.modalHandle} />
                <Text style={styles.modalTitle}>选择猫咪</Text>
                <Text style={styles.modalSubtitle}>
                  请选择要{pendingAction?.screen === 'AddHealthRecord' ? '记录健康信息' : pendingAction?.screen === 'AddReminder' ? '添加提醒' : '记录活动'}的猫咪
                </Text>
                <View style={styles.petPickerList}>
                  {pets.map((pet) => (
                    <TouchableOpacity
                      key={pet.id}
                      style={styles.petPickerItem}
                      onPress={() => handlePetSelected(pet)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.petPickerAvatar}>
                        {pet.photo ? (
                          <Image source={{ uri: pet.photo }} style={styles.petPickerImage} />
                        ) : (
                          <Text style={styles.petPickerEmoji}>{getPetTypeIcon(pet.type)}</Text>
                        )}
                      </View>
                      <View style={styles.petPickerInfo}>
                        <Text style={styles.petPickerName}>{pet.name}</Text>
                        {pet.birthDate && (
                          <Text style={styles.petPickerAge}>{calculateAge(pet.birthDate)}</Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={theme.colors.textLight} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setPetPickerVisible(false)}
                >
                  <Text style={styles.modalCancelText}>取消</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    // Header
    headerCard: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.xl,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 3,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
    },
    dateText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
      marginBottom: 4,
    },
    greeting: {
      fontSize: 26,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    greetingSub: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: theme.borderRadius.xl,
      backgroundColor: theme.colors.primary,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    addButtonText: {
      color: '#FFF',
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
    },

    // Tip Banner
    tipBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.primaryLight + '30',
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm + 2,
      marginTop: theme.spacing.md,
    },
    tipEmoji: {
      fontSize: 28,
      marginRight: theme.spacing.sm,
    },
    tipContent: {
      flex: 1,
    },
    tipLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primaryDark,
      fontWeight: theme.fontWeight.bold,
      marginBottom: 2,
    },
    tipText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 18,
    },

    // Quick Actions
    quickActionsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.sm,
    },
    quickActionItem: {
      alignItems: 'center',
    },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    quickActionLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.text,
      fontWeight: theme.fontWeight.medium,
    },

    // Stats
    statsContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    statCard: {
      width: 105,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.borderRadius.xl,
      alignItems: 'center',
      marginRight: theme.spacing.sm + 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    statIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: 'rgba(255,255,255,0.25)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statNumber: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: '#FFF',
      marginTop: theme.spacing.xs,
    },
    statLabel: {
      fontSize: theme.fontSize.xs,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
      fontWeight: theme.fontWeight.medium,
    },

    // Section
    section: {
      marginTop: theme.spacing.lg,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs + 2,
    },
    sectionTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    seeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    seeAll: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.semibold,
    },
    showMoreButton: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      marginHorizontal: theme.spacing.md,
    },
    showMoreText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },

    // Care Checklist
    careChecklistContainer: {
      marginHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
    progressBarContainer: {
      marginBottom: theme.spacing.md,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: theme.colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: '100%',
      borderRadius: 3,
    },
    progressBadge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.round,
    },
    progressText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.bold,
    },
    checklistRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    checklistItem: {
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.md,
      position: 'relative',
      opacity: 0.7,
      minWidth: 52,
    },
    checklistItemDone: {
      opacity: 1,
      backgroundColor: theme.colors.success + '10',
    },
    checklistEmoji: {
      fontSize: 24,
      marginBottom: 4,
    },
    checklistLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
    checklistLabelDone: {
      color: theme.colors.success,
      fontWeight: theme.fontWeight.bold,
    },
    checkIcon: {
      position: 'absolute',
      top: 2,
      right: 0,
    },

    // Health Records
    healthItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    healthIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    healthIcon: {
      fontSize: 20,
    },
    healthInfo: {
      flex: 1,
    },
    healthTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    healthSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    healthNotes: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
      fontStyle: 'italic',
    },

    // Activity
    activityItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    activityIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.info + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    activityIcon: {
      fontSize: 20,
    },
    activityInfo: {
      flex: 1,
    },
    activityTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    activitySubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    activityCount: {
      backgroundColor: theme.colors.info + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.round,
    },
    activityCountText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.info,
      fontWeight: theme.fontWeight.bold,
    },

    // Reminders
    reminderItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginVertical: theme.spacing.xs,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
      borderLeftWidth: 3,
      borderLeftColor: theme.colors.warning,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 1,
    },
    reminderItemUrgent: {
      borderLeftColor: theme.colors.error,
      backgroundColor: theme.colors.error + '08',
    },
    reminderIconBox: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: theme.colors.warning + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    reminderIconUrgent: {
      backgroundColor: theme.colors.error + '15',
    },
    reminderInfo: {
      flex: 1,
    },
    reminderTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    reminderSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    reminderDaysBadge: {
      backgroundColor: theme.colors.warning + '20',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      borderRadius: theme.borderRadius.round,
    },
    reminderDaysBadgeUrgent: {
      backgroundColor: theme.colors.error + '20',
    },
    reminderDaysText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.warning,
      fontWeight: theme.fontWeight.bold,
    },
    reminderDaysTextUrgent: {
      color: theme.colors.error,
    },

    // Pet Picker Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      width: '100%',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl + 4,
      borderTopRightRadius: theme.borderRadius.xl + 4,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
      paddingTop: theme.spacing.sm,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: theme.spacing.md,
    },
    modalTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 4,
    },
    modalSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    petPickerList: {
      gap: theme.spacing.sm,
    },
    petPickerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.inputBackground,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
    },
    petPickerAvatar: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
      overflow: 'hidden',
    },
    petPickerImage: {
      width: 48,
      height: 48,
      borderRadius: 16,
    },
    petPickerEmoji: {
      fontSize: 24,
    },
    petPickerInfo: {
      flex: 1,
    },
    petPickerName: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    petPickerAge: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    modalCancelButton: {
      marginTop: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
      backgroundColor: theme.colors.border + '60',
      borderRadius: theme.borderRadius.lg,
    },
    modalCancelText: {
      fontSize: theme.fontSize.lg,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
  });
