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
  getHealthIcon,
  getHealthTypeLabel,
  formatDate,
  getPetTypeIcon,
  HEALTH_RECORD_TYPES,
} from '../utils/helpers';

const FILTER_TABS = [
  { key: 'all', label: '全部' },
  ...HEALTH_RECORD_TYPES.map((t) => ({ key: t.value, label: t.icon + ' ' + t.label })),
];

export default function AllHealthRecordsScreen({ navigation }) {
  const { healthRecords, pets } = useApp();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState('all');
  const [activePetFilter, setActivePetFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    let result = [...healthRecords];
    if (activeFilter !== 'all') {
      result = result.filter((r) => r.type === activeFilter);
    }
    if (activePetFilter !== 'all') {
      result = result.filter((r) => r.petId === activePetFilter);
    }
    result.sort((a, b) => new Date(b.date) - new Date(a.date));
    return result;
  }, [healthRecords, activeFilter, activePetFilter]);

  // Group by date
  const groupedRecords = useMemo(() => {
    const groups = [];
    let currentDate = null;
    let currentGroup = null;
    filteredRecords.forEach((record) => {
      const dateStr = new Date(record.date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      if (dateStr !== currentDate) {
        currentDate = dateStr;
        currentGroup = { title: dateStr, data: [] };
        groups.push(currentGroup);
      }
      currentGroup.data.push(record);
    });
    return groups;
  }, [filteredRecords]);

  const renderRecordItem = (record) => {
    const pet = pets.find((p) => p.id === record.petId);
    return (
      <TouchableOpacity
        key={record.id}
        style={styles.recordItem}
        onPress={() => navigation.navigate('HealthRecordDetail', { recordId: record.id })}
        activeOpacity={0.7}
      >
        <View style={styles.recordIconContainer}>
          <Text style={styles.recordIcon}>{getHealthIcon(record.type)}</Text>
        </View>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle}>{record.title}</Text>
          <Text style={styles.recordSubtitle}>
            {pet?.name || '未知猫咪'} • {getHealthTypeLabel(record.type)}
          </Text>
          {record.veterinarian ? (
            <Text style={styles.recordMeta} numberOfLines={1}>
              👨‍⚕️ {record.veterinarian}{record.clinic ? ` · ${record.clinic}` : ''}
            </Text>
          ) : null}
        </View>
        {record.cost != null && (
          <View style={styles.costBadge}>
            <Text style={styles.costText}>RM{record.cost}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={16} color={theme.colors.textLight} />
      </TouchableOpacity>
    );
  };

  const renderGroup = ({ item: group }) => (
    <View style={styles.groupContainer}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      {group.data.map((record) => renderRecordItem(record))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filterArea}>
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
                      <Image source={{ uri: item.photo }} style={styles.petFilterImage} />
                    ) : (
                      <Text style={styles.petFilterEmoji}>{getPetTypeIcon(item.type)}</Text>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTER_TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.filterChip, activeFilter === item.key && styles.filterChipActive]}
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

      {/* List */}
      {groupedRecords.length === 0 ? (
        <EmptyState
          emoji="📋"
          title="没有健康记录"
          message={
            activeFilter !== 'all' || activePetFilter !== 'all'
              ? '当前筛选条件下没有记录，试试其他筛选条件~'
              : '还没有任何健康记录，快去添加一条吧~'
          }
        />
      ) : (
        <FlatList
          data={groupedRecords}
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
    container: { flex: 1, backgroundColor: theme.colors.background },
    filterArea: { backgroundColor: theme.colors.background },
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
    petFilterImage: { width: 22, height: 22, borderRadius: 11 },
    petFilterEmoji: { fontSize: 14 },
    petFilterLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
    petFilterLabelActive: {
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.bold,
    },
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
      backgroundColor: theme.colors.secondary + '20',
      borderColor: theme.colors.secondary,
    },
    filterLabel: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeight.medium,
    },
    filterLabelActive: {
      color: theme.colors.secondary,
      fontWeight: theme.fontWeight.bold,
    },
    listContent: { paddingBottom: theme.spacing.xxl },
    groupContainer: { marginTop: theme.spacing.sm },
    groupTitle: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.textSecondary,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.background,
    },
    recordItem: {
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
    recordIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: theme.colors.secondary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: theme.spacing.md,
    },
    recordIcon: { fontSize: 20 },
    recordInfo: { flex: 1 },
    recordTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    recordSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    recordMeta: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
      fontStyle: 'italic',
    },
    costBadge: {
      backgroundColor: theme.colors.secondary + '15',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 2,
      borderRadius: theme.borderRadius.round,
      marginRight: theme.spacing.xs,
    },
    costText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.secondary,
      fontWeight: theme.fontWeight.bold,
    },
  });
