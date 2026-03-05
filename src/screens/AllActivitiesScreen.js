import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import EmptyState from '../components/EmptyState';
import {
  getActivityIcon,
  getActivityTypeLabel,
  formatDate,
  getRelativeTime,
  getPetTypeIcon,
  ACTIVITY_TYPES,
} from '../utils/helpers';

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  ...ACTIVITY_TYPES.map((t) => ({ key: t.value, label: t.icon + ' ' + t.label })),
];

export default function AllActivitiesScreen({ navigation }) {
  const { activities, pets } = useApp();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activePetFilter, setActivePetFilter] = useState('all');

  // Filter activities
  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Filter by type
    if (activeFilter !== 'all') {
      result = result.filter((a) => a.type === activeFilter);
    }

    // Filter by pet
    if (activePetFilter !== 'all') {
      result = result.filter((a) => a.petId === activePetFilter);
    }

    // Sort by date descending
    result.sort((a, b) => new Date(b.date) - new Date(a.date));

    return result;
  }, [activities, activeFilter, activePetFilter]);

  // Group activities by date
  const groupedActivities = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;

    filteredActivities.forEach((activity) => {
      const dateStr = new Date(activity.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (dateStr !== currentDate) {
        currentDate = dateStr;
        currentGroup = { title: dateStr, data: [] };
        groups.push(currentGroup);
      }
      currentGroup.data.push(activity);
    });

    return groups;
  }, [filteredActivities]);

  const renderActivityItem = (activity) => {
    const pet = pets.find((p) => p.id === activity.petId);
    return (
      <TouchableOpacity
        key={activity.id}
        style={styles.activityItem}
        onPress={() =>
          navigation.navigate('ActivityDetail', { activityId: activity.id })
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
            {pet?.name || '未知猫咪'} • {getRelativeTime(activity.date)}
          </Text>
          {activity.notes ? (
            <Text style={styles.activityNotes} numberOfLines={1}>
              {activity.notes}
            </Text>
          ) : null}
        </View>
        {activity.duration != null && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{activity.duration}分钟</Text>
          </View>
        )}
        <Ionicons
          name="chevron-forward"
          size={16}
          color={theme.colors.textLight}
        />
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item: group }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      {group.data.map((activity) => renderActivityItem(activity))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Fixed filter area */}
      <View style={styles.filterArea}>
        {/* Pet filter */}
        {pets.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.petFilterContainer}
          >
            {[{ id: 'all', name: '全部猫咪' }, ...pets].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.petFilterChip,
                  activePetFilter === item.id && styles.petFilterChipActive,
                ]}
                onPress={() => setActivePetFilter(item.id)}
                activeOpacity={0.7}
              >
                {item.id !== 'all' && (
                  <View style={styles.petFilterAvatar}>
                    {item.photo ? (
                      <Image
                        source={{ uri: item.photo }}
                        style={styles.petFilterImage}
                      />
                    ) : (
                      <Text style={styles.petFilterEmoji}>
                        {getPetTypeIcon(item.type)}
                      </Text>
                    )}
                  </View>
                )}
                <Text
                  style={[
                    styles.petFilterLabel,
                    activePetFilter === item.id && styles.petFilterLabelActive,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Type filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterChip,
                activeFilter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterLabel,
                  activeFilter === item.key && styles.filterLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Activity list */}
      {groupedActivities.length === 0 ? (
        <EmptyState
          emoji="📝"
          title="没有活动记录"
          message={
            activeFilter !== 'all' || activePetFilter !== 'all'
              ? '当前筛选条件下没有活动记录，试试其他筛选条件吧~'
              : '还没有任何活动记录，快去为猫咪添加一条吧~'
          }
        />
      ) : (
        <FlatList
          data={groupedActivities}
          keyExtractor={(item) => item.title}
          renderItem={renderGroup}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    // Filter area - fixed at top
    filterArea: {
      backgroundColor: theme.colors.background,
    },
    // Pet filter
    petFilterContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xs,
    },
    petFilterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.surface,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    petFilterChipActive: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    petFilterAvatar: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.xs,
      overflow: 'hidden',
    },
    petFilterImage: {
      width: 22,
      height: 22,
      borderRadius: 11,
    },
    petFilterEmoji: {
      fontSize: 14,
    },
    petFilterLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
    petFilterLabelActive: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.bold,
    },
    // Type filter
    filterContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    filterChip: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.borderRadius.round,
      backgroundColor: theme.colors.surface,
      marginRight: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterChipActive: {
      backgroundColor: theme.colors.info + '20',
      borderColor: theme.colors.info,
    },
    filterLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
    filterLabelActive: {
      color: theme.colors.info,
      fontWeight: theme.fontWeight.bold,
    },
    // List
    listContent: {
      paddingBottom: theme.spacing.xxl,
    },
    groupContainer: {
      marginTop: theme.spacing.sm,
    },
    groupTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.textSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
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
    activityNotes: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
      fontStyle: 'italic',
    },
    durationBadge: {
      backgroundColor: theme.colors.info + '15',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.xs,
    },
    durationText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.info,
      fontWeight: theme.fontWeight.bold,
    },
  });
