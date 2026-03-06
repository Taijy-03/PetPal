import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Modal,
  FlatList,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp, useTheme } from '../context/AppContext';
import { formatDate, calculateAge, getBreedLabel } from '../utils/helpers';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NODE_SIZE = 68;
const SMALL_NODE_SIZE = 54;

const RELATIONSHIP_TYPES = [
  { label: '母亲', value: 'mother', emoji: '👩' },
  { label: '父亲', value: 'father', emoji: '👨' },
  { label: '子女', value: 'child', emoji: '🧒' },
  { label: '兄弟姐妹', value: 'sibling', emoji: '👫' },
  { label: '伴侣', value: 'mate', emoji: '💕' },
];

export default function CatFamilyBookScreen({ navigation }) {
  const { pets, updatePet } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [showRelationModal, setShowRelationModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [selectedRelationType, setSelectedRelationType] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedPetId, setFocusedPetId] = useState(null);
  const [showTips, setShowTips] = useState(true);

  // Stats
  const totalRelations = useMemo(
    () =>
      Math.round(
        pets.reduce((acc, p) => acc + (p.relationships?.length || 0), 0) / 2
      ),
    [pets]
  );

  const getRelationships = useCallback(
    (pet) => {
      if (!pet || !pet.relationships || pet.relationships.length === 0) return [];
      return pet.relationships
        .map((rel) => {
          const relatedPet = pets.find((p) => p.id === rel.petId);
          if (!relatedPet) return null;
          return { ...rel, pet: relatedPet };
        })
        .filter(Boolean);
    },
    [pets]
  );

  const buildTreeData = useCallback(
    (pet) => {
      const rels = getRelationships(pet);
      return {
        parents: rels.filter((r) => r.type === 'mother' || r.type === 'father'),
        mate: rels.find((r) => r.type === 'mate') || null,
        children: rels.filter((r) => r.type === 'child'),
        siblings: rels.filter((r) => r.type === 'sibling'),
      };
    },
    [getRelationships]
  );

  const getRelationEmoji = (type) => {
    const found = RELATIONSHIP_TYPES.find((r) => r.value === type);
    return found ? found.emoji : '🐱';
  };

  const getRelationLabel = (type) => {
    const found = RELATIONSHIP_TYPES.find((r) => r.value === type);
    return found ? found.label : '关系';
  };

  const handleAddRelation = (pet) => {
    setSelectedPet(pet);
    setSelectedRelationType(null);
    setSearchQuery('');
    setShowRelationModal(true);
  };

  const handleSelectRelation = async (targetPet) => {
    if (!selectedPet || !selectedRelationType) return;

    const existingRelations = selectedPet.relationships || [];
    const alreadyExists = existingRelations.find(
      (r) => r.petId === targetPet.id && r.type === selectedRelationType
    );
    if (alreadyExists) {
      Alert.alert('提示', '这个关系已经存在了');
      return;
    }

    const updatedPet = {
      ...selectedPet,
      relationships: [
        ...existingRelations,
        { petId: targetPet.id, type: selectedRelationType },
      ],
    };
    await updatePet(updatedPet);

    const reverseType = getReverseRelationType(selectedRelationType);
    const targetRelations = targetPet.relationships || [];
    const reverseExists = targetRelations.find(
      (r) => r.petId === selectedPet.id && r.type === reverseType
    );
    if (!reverseExists) {
      const updatedTarget = {
        ...targetPet,
        relationships: [
          ...targetRelations,
          { petId: selectedPet.id, type: reverseType },
        ],
      };
      await updatePet(updatedTarget);
    }

    setShowRelationModal(false);
    Alert.alert('✅ 成功', `已添加 ${selectedPet.name} 与 ${targetPet.name} 的关系`);
  };

  const getReverseRelationType = (type) => {
    switch (type) {
      case 'mother':
      case 'father':
        return 'child';
      case 'child':
        return 'mother';
      case 'sibling':
        return 'sibling';
      case 'mate':
        return 'mate';
      default:
        return 'sibling';
    }
  };

  const handleRemoveRelation = (pet, relationPetId, relationType) => {
    Alert.alert('删除关系', '确定要删除这个关系吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updatedPet = {
            ...pet,
            relationships: (pet.relationships || []).filter(
              (r) => !(r.petId === relationPetId && r.type === relationType)
            ),
          };
          await updatePet(updatedPet);

          const targetPet = pets.find((p) => p.id === relationPetId);
          if (targetPet) {
            const reverseType = getReverseRelationType(relationType);
            const updatedTarget = {
              ...targetPet,
              relationships: (targetPet.relationships || []).filter(
                (r) => !(r.petId === pet.id && r.type === reverseType)
              ),
            };
            await updatePet(updatedTarget);
          }
        },
      },
    ]);
  };

  const availablePetsForRelation = pets.filter((p) => {
    if (!selectedPet) return false;
    if (p.id === selectedPet.id) return false;
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // ─── Build family groups via BFS ───
  const familyRoots = useMemo(() => {
    const visited = new Set();
    const groups = [];
    pets.forEach((pet) => {
      if (visited.has(pet.id)) return;
      const rels = getRelationships(pet);
      if (rels.length === 0) return;
      const group = [];
      const queue = [pet];
      while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        group.push(current);
        const currentRels = getRelationships(current);
        currentRels.forEach((r) => {
          if (!visited.has(r.pet.id)) queue.push(r.pet);
        });
      }
      groups.push(group);
    });
    return groups;
  }, [pets, getRelationships]);

  const loners = useMemo(() => {
    return pets.filter((p) => !p.relationships || p.relationships.length === 0);
  }, [pets]);

  // ════════════════════════════════════════════
  //  TREE VISUAL COMPONENTS
  // ════════════════════════════════════════════

  const TreeNode = ({ pet, size = NODE_SIZE, label, isFocused, onLongPress }) => (
    <TouchableOpacity
      style={styles.treeNodeWrapper}
      onPress={() => {
        if (focusedPetId === pet.id) {
          // Already focused — navigate to detail
          navigation.navigate('PetsTab', {
            screen: 'PetDetail',
            params: { petId: pet.id },
          });
        } else {
          setFocusedPetId(pet.id);
        }
      }}
      onLongPress={onLongPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.treeNode,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: isFocused ? theme.colors.primary : theme.colors.border,
            borderWidth: isFocused ? 3 : 2,
          },
        ]}
      >
        {pet.photo ? (
          <Image
            source={{ uri: pet.photo }}
            style={{
              width: size - 6,
              height: size - 6,
              borderRadius: (size - 6) / 2,
            }}
          />
        ) : (
          <Text style={{ fontSize: size * 0.38 }}>🐱</Text>
        )}
        {pet.isDeceased && (
          <View style={styles.treeNodeBadge}>
            <Text style={{ fontSize: 10 }}>⭐</Text>
          </View>
        )}
        {pet.gender && (
          <View style={[styles.treeGenderBadge, { backgroundColor: pet.gender === 'male' ? '#9DC4E0' : '#E8A0BF' }]}>
            <Text style={{ fontSize: 8, color: '#fff' }}>{pet.gender === 'male' ? '♂' : '♀'}</Text>
          </View>
        )}
      </View>
      <Text style={styles.treeNodeName} numberOfLines={1}>
        {pet.name}
      </Text>
      {label && <Text style={styles.treeNodeLabel}>{label}</Text>}
    </TouchableOpacity>
  );

  const VLine = ({ height = 24 }) => (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 2,
          height,
          backgroundColor: theme.colors.textLight + '60',
        }}
      />
    </View>
  );

  const Dot = () => (
    <View style={{ alignItems: 'center' }}>
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: theme.colors.textLight,
        }}
      />
    </View>
  );

  const HLine = ({ width: w = 40 }) => (
    <View
      style={{
        width: w,
        height: 2,
        backgroundColor: theme.colors.textLight + '60',
        alignSelf: 'center',
      }}
    />
  );

  // ─── Render a single Family Tree ───
  const renderFamilyTree = (group, groupIndex) => {
    // Pick the focal cat for this tree
    const focusedInGroup = focusedPetId ? group.find((p) => p.id === focusedPetId) : null;
    const petWithParents = group.find((p) => {
      const rels = getRelationships(p);
      return rels.some((r) => r.type === 'mother' || r.type === 'father');
    });
    const rootPet = focusedInGroup || petWithParents || group[0];
    const tree = buildTreeData(rootPet);

    return (
      <View key={`group-${groupIndex}`} style={styles.treeCard}>
        {/* Card Header */}
        <View style={styles.treeCardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.treeCardTitle}>🌳 家族 {groupIndex + 1}</Text>
            <Text style={styles.treeCardMemberCount}>
              {group.length} 只猫咪 · {Math.round(group.reduce((acc, p) => acc + (p.relationships?.length || 0), 0) / 2)} 个关系
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addRelBtn}
            onPress={() => handleAddRelation(rootPet)}
          >
            <Ionicons name="add-circle" size={22} color={theme.colors.primary} />
            <Text style={styles.addRelBtnText}>添加</Text>
          </TouchableOpacity>
        </View>

        {/* Tree Canvas - horizontally scrollable */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.treeCanvas}
        >
          <View style={styles.treeColumn}>
            {/* ══ LEVEL 1: Parents ══ */}
            {tree.parents.length > 0 && (
              <>
                <View style={styles.treeLevel}>
                  {tree.parents.map((rel, i) => (
                    <React.Fragment key={rel.petId}>
                      {i > 0 && (
                        <View style={styles.parentConnector}>
                          <HLine width={28} />
                          <Text style={styles.parentHeartEmoji}>❤️</Text>
                          <HLine width={28} />
                        </View>
                      )}
                      <TreeNode
                        pet={rel.pet}
                        size={SMALL_NODE_SIZE}
                        label={getRelationLabel(rel.type)}
                        onLongPress={() =>
                          handleRemoveRelation(rootPet, rel.petId, rel.type)
                        }
                      />
                    </React.Fragment>
                  ))}
                </View>
                {/* Connector down from parents */}
                <VLine height={14} />
                <Dot />
                <VLine height={14} />
              </>
            )}

            {/* ══ LEVEL 2: Focal Cat + Mate ══ */}
            <View style={styles.treeLevel}>
              {tree.mate && (
                <>
                  <TreeNode
                    pet={tree.mate.pet}
                    size={SMALL_NODE_SIZE}
                    label="伴侣"
                    onLongPress={() =>
                      handleRemoveRelation(rootPet, tree.mate.petId, 'mate')
                    }
                  />
                  <View style={styles.mateLink}>
                    <View style={[styles.mateDash, { borderColor: '#E8A0BF' }]} />
                    <Text style={{ fontSize: 13 }}>💕</Text>
                    <View style={[styles.mateDash, { borderColor: '#E8A0BF' }]} />
                  </View>
                </>
              )}
              <View style={styles.focalNodeWrap}>
                <View style={styles.focalGlow}>
                  <TreeNode
                    pet={rootPet}
                    size={NODE_SIZE}
                    isFocused={true}
                  />
                </View>
                <TouchableOpacity
                  style={[styles.focalAddBtn, { backgroundColor: theme.colors.primary }]}
                  onPress={() => handleAddRelation(rootPet)}
                >
                  <Ionicons name="add" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ══ LEVEL 3: Children ══ */}
            {tree.children.length > 0 && (
              <>
                <VLine height={14} />
                <Dot />
                {/* Horizontal spread line */}
                {tree.children.length > 1 && (
                  <View style={styles.branchBar}>
                    <View
                      style={[
                        styles.branchBarLine,
                        { backgroundColor: theme.colors.textLight + '60' },
                      ]}
                    />
                  </View>
                )}
                <View style={styles.treeLevel}>
                  {tree.children.map((rel) => (
                    <View key={rel.petId} style={styles.childBranch}>
                      <VLine height={14} />
                      <TreeNode
                        pet={rel.pet}
                        size={SMALL_NODE_SIZE}
                        label="子女"
                        onLongPress={() =>
                          handleRemoveRelation(rootPet, rel.petId, 'child')
                        }
                      />
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* ══ LEVEL 4: Siblings ══ */}
            {tree.siblings.length > 0 && (
              <View style={styles.siblingsArea}>
                <View style={styles.siblingDivider}>
                  <View style={[styles.siblingDivLine, { backgroundColor: theme.colors.border }]} />
                  <Text style={styles.siblingDivText}>👫 兄弟姐妹</Text>
                  <View style={[styles.siblingDivLine, { backgroundColor: theme.colors.border }]} />
                </View>
                <View style={styles.treeLevel}>
                  {tree.siblings.map((rel) => (
                    <TreeNode
                      key={rel.petId}
                      pet={rel.pet}
                      size={SMALL_NODE_SIZE}
                      label="兄弟姐妹"
                      onLongPress={() =>
                        handleRemoveRelation(rootPet, rel.petId, 'sibling')
                      }
                    />
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer hint */}
        <Text style={styles.treeHint}>💡 点击切换视角 · 再次点击查看详情 · 长按删除关系</Text>
      </View>
    );
  };

  // ════════════════════════════════════════════
  //  MAIN RENDER
  // ════════════════════════════════════════════

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerEmoji}>🌳</Text>
          <Text style={styles.headerTitle}>猫咪家庭树</Text>
          <Text style={styles.headerSub}>以树状图展示猫咪之间的家庭关系</Text>

          {/* Stats Summary */}
          {pets.length > 0 && (
            <View style={styles.statsSummary}>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>{pets.length}</Text>
                <Text style={styles.statPillLabel}>猫咪</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>{familyRoots.length}</Text>
                <Text style={styles.statPillLabel}>家族</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>{totalRelations}</Text>
                <Text style={styles.statPillLabel}>关系</Text>
              </View>
              <View style={styles.statPill}>
                <Text style={styles.statPillValue}>{loners.length}</Text>
                <Text style={styles.statPillLabel}>独立</Text>
              </View>
            </View>
          )}
        </View>

        {/* Quick Tips */}
        {showTips && pets.length > 0 && (
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Text style={styles.tipsTitle}>📝 使用提示</Text>
              <TouchableOpacity onPress={() => setShowTips(false)}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.tipItem}>🔹 点击「未建立关系」的猫咪开始创建家族</Text>
            <Text style={styles.tipItem}>🔹 点击树中的头像切换视角</Text>
            <Text style={styles.tipItem}>🔹 再次点击聚焦猫咪可查看详情页</Text>
            <Text style={styles.tipItem}>🔹 长按节点可删除关系</Text>
            <Text style={styles.tipItem}>🔹 支持 5 种关系: 父母、子女、兄弟姐妹、伴侣</Text>
          </View>
        )}

        {/* Family Trees */}
        {familyRoots.map((group, i) => renderFamilyTree(group, i))}

        {/* Loner Pets */}
        {loners.length > 0 && (
          <View style={styles.lonersCard}>
            <Text style={styles.lonersTitle}>🐱 还没有家庭关系</Text>
            <Text style={styles.lonersSub}>点击猫咪可以开始建立家庭关系</Text>
            <View style={styles.lonersGrid}>
              {loners.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.lonerItem}
                  onPress={() => handleAddRelation(pet)}
                  activeOpacity={0.7}
                >
                  <View style={styles.lonerAvatarWrap}>
                    {pet.photo ? (
                      <Image source={{ uri: pet.photo }} style={styles.lonerAvatar} />
                    ) : (
                      <View style={styles.lonerAvatarEmpty}>
                        <Text style={{ fontSize: 26 }}>🐱</Text>
                      </View>
                    )}
                    <View style={styles.lonerPlus}>
                      <Ionicons name="add-circle" size={20} color={theme.colors.primary} />
                    </View>
                  </View>
                  <Text style={styles.lonerName} numberOfLines={1}>{pet.name}</Text>
                  <Text style={styles.lonerBreed} numberOfLines={1}>
                    {getBreedLabel(pet.breed) || '未知品种'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Global Empty */}
        {pets.length === 0 && (
          <View style={styles.emptyWrap}>
            <Text style={{ fontSize: 64 }}>📭</Text>
            <Text style={styles.emptyTitle}>还没有猫咪</Text>
            <Text style={styles.emptySub}>先添加猫咪，然后就可以建立家庭关系了</Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ══ Add Relation Modal ══ */}
      <Modal
        visible={showRelationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRelationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedRelationType
                  ? `为 ${selectedPet?.name} 选择${getRelationLabel(selectedRelationType)}`
                  : `为 ${selectedPet?.name} 添加关系`}
              </Text>
              <TouchableOpacity onPress={() => setShowRelationModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {!selectedRelationType ? (
              <View style={styles.relTypeList}>
                {RELATIONSHIP_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={styles.relTypeRow}
                    onPress={() => setSelectedRelationType(type.value)}
                  >
                    <Text style={styles.relTypeEmoji}>{type.emoji}</Text>
                    <Text style={styles.relTypeLabel}>{type.label}</Text>
                    <Ionicons name="chevron-forward" size={20} color={theme.colors.textLight} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.petPickContainer}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setSelectedRelationType(null)}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.colors.primary} />
                  <Text style={styles.backBtnText}>返回</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.searchInput}
                  placeholder="搜索猫咪..."
                  placeholderTextColor={theme.colors.textLight}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />

                <FlatList
                  data={availablePetsForRelation}
                  keyExtractor={(item) => item.id}
                  style={{ flex: 1 }}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.petPickRow}
                      onPress={() => handleSelectRelation(item)}
                    >
                      {item.photo ? (
                        <Image source={{ uri: item.photo }} style={styles.petPickAvatar} />
                      ) : (
                        <View style={styles.petPickAvatarEmpty}>
                          <Text style={{ fontSize: 20 }}>🐱</Text>
                        </View>
                      )}
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.petPickName}>{item.name}</Text>
                        <Text style={styles.petPickBreed}>
                          {getBreedLabel(item.breed) || '未知品种'}
                        </Text>
                      </View>
                      {item.isDeceased && (
                        <Text style={styles.petPickDeceased}>⭐ 喵星</Text>
                      )}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                      <Text style={{ color: theme.colors.textLight }}>没有可选择的猫咪</Text>
                    </View>
                  }
                />
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ════════════════════════════════════════════
//  STYLES
// ════════════════════════════════════════════

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },

    // ─── Header ───
    header: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
    },
    headerEmoji: { fontSize: 56, marginBottom: theme.spacing.sm },
    headerTitle: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerSub: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    statsSummary: {
      flexDirection: 'row',
      marginTop: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    statPill: {
      backgroundColor: theme.colors.primaryLight + '30',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: 20,
      alignItems: 'center',
      minWidth: 60,
    },
    statPillValue: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
    },
    statPillLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    tipsCard: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.primaryLight + '15',
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.primaryLight + '40',
    },
    tipsHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    tipsTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    tipItem: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      lineHeight: 22,
    },
    treeCardMemberCount: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
    },

    // ─── Tree Card ───
    treeCard: {
      backgroundColor: theme.colors.surface,
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
    },
    treeCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    treeCardTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    addRelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    addRelBtnText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },

    // ─── Tree Canvas ───
    treeCanvas: {
      paddingVertical: theme.spacing.lg,
      paddingHorizontal: theme.spacing.xl,
      minWidth: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    treeColumn: { alignItems: 'center' },
    treeLevel: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start',
      gap: theme.spacing.md,
    },

    // ─── Tree Nodes ───
    treeNodeWrapper: { alignItems: 'center', width: 80 },
    treeNode: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
    },
    treeNodeBadge: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    treeGenderBadge: {
      position: 'absolute',
      top: -1,
      left: -1,
      width: 16,
      height: 16,
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
    treeNodeName: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: 5,
      textAlign: 'center',
      maxWidth: 80,
    },
    treeNodeLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 1,
    },

    // ─── Parent love connector ───
    parentConnector: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'center',
      marginTop: 20,
    },
    parentHeartEmoji: { fontSize: 12, marginHorizontal: 2 },

    // ─── Focal node ───
    focalNodeWrap: { position: 'relative' },
    focalGlow: {
      borderRadius: 999,
      padding: 3,
    },
    focalAddBtn: {
      position: 'absolute',
      bottom: 18,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },

    // ─── Mate connector ───
    mateLink: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 2,
      marginTop: 14,
    },
    mateDash: {
      width: 18,
      height: 0,
      borderTopWidth: 2,
      borderStyle: 'dashed',
    },

    // ─── Children branch ───
    branchBar: {
      width: '65%',
      maxWidth: 280,
      alignSelf: 'center',
    },
    branchBarLine: { height: 2, width: '100%' },
    childBranch: { alignItems: 'center' },

    // ─── Siblings ───
    siblingsArea: { marginTop: theme.spacing.lg, width: '100%' },
    siblingDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    siblingDivLine: { flex: 1, height: 1 },
    siblingDivText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginHorizontal: theme.spacing.sm,
    },

    // ─── Hint ───
    treeHint: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      textAlign: 'center',
      paddingVertical: theme.spacing.sm,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },

    // ─── Loner Pets ───
    lonersCard: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    lonersTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: 4,
    },
    lonersSub: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    lonersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.md },
    lonerItem: { alignItems: 'center', width: (SCREEN_WIDTH - 80) / 3 },
    lonerAvatarWrap: { position: 'relative' },
    lonerAvatar: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    lonerAvatarEmpty: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    lonerPlus: { position: 'absolute', bottom: -4, right: -4 },
    lonerName: {
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
      marginTop: 6,
      textAlign: 'center',
    },
    lonerBreed: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      textAlign: 'center',
    },

    // ─── Empty ───
    emptyWrap: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    emptySub: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },

    // ─── Modal ───
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalBox: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '80%',
      paddingBottom: theme.spacing.xxl,
    },
    modalHead: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    relTypeList: { padding: theme.spacing.md },
    relTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    relTypeEmoji: { fontSize: 28, marginRight: theme.spacing.md },
    relTypeLabel: { flex: 1, fontSize: theme.fontSize.lg, color: theme.colors.text },

    petPickContainer: { flex: 1, padding: theme.spacing.md },
    backBtn: { flexDirection: 'row', alignItems: 'center', marginBottom: theme.spacing.sm },
    backBtnText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.primary,
      marginLeft: 4,
    },
    searchInput: {
      height: 44,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.sm,
    },
    petPickRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    petPickAvatar: { width: 44, height: 44, borderRadius: 22 },
    petPickAvatarEmpty: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
    },
    petPickName: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
    petPickBreed: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
    petPickDeceased: { fontSize: theme.fontSize.sm, color: theme.colors.textSecondary },
  });
