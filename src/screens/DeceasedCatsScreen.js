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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useApp, useTheme } from '../context/AppContext';
import {
  formatDate,
  calculateAge,
  getBreedLabel,
  generateId,
} from '../utils/helpers';
import { DatePickerModal } from '../components/FormElements';

export default function DeceasedCatsScreen({ navigation }) {
  const { pets, updatePet } = useApp();
  const theme = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const [showMemorialModal, setShowMemorialModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [deceasedDate, setDeceasedDate] = useState('');
  const [memorialNote, setMemorialNote] = useState('');
  const [showMarkDeceasedModal, setShowMarkDeceasedModal] = useState(false);
  const [markPet, setMarkPet] = useState(null);
  const [markDate, setMarkDate] = useState('');
  const [markNote, setMarkNote] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editedNote, setEditedNote] = useState('');
  const [viewingPhotoIndex, setViewingPhotoIndex] = useState(null);
  const photoViewerRef = useRef(null);

  // Get deceased pets
  const deceasedPets = pets.filter((p) => p.isDeceased);
  // Get alive pets (for marking as deceased)
  const alivePets = pets.filter((p) => !p.isDeceased);

  const handleViewMemorial = (pet) => {
    setSelectedPet(pet);
    setIsEditingNote(false);
    setEditedNote(pet.memorialNote || '');
    setShowMemorialModal(true);
  };

  const handleMarkDeceased = (pet) => {
    setMarkPet(pet);
    setMarkDate('');
    setMarkNote('');
    setShowMarkDeceasedModal(true);
  };

  const confirmMarkDeceased = async () => {
    if (!markPet) return;

    // Validate date
    if (markDate) {
      const deceasedD = new Date(markDate);
      const todayD = new Date();
      todayD.setHours(0, 0, 0, 0);
      deceasedD.setHours(0, 0, 0, 0);

      if (deceasedD > todayD) {
        Alert.alert('日期错误', '去世日期不能是未来的日期');
        return;
      }

      if (markPet.birthDate) {
        const birthD = new Date(markPet.birthDate);
        birthD.setHours(0, 0, 0, 0);
        if (deceasedD < birthD) {
          Alert.alert('日期错误', `去世日期不能早于出生日期 (${markPet.birthDate})`);
          return;
        }
      }
    }

    Alert.alert(
      '确认标记',
      `确定要将 ${markPet.name} 标记为已故吗？这个操作可以在之后撤销。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '确认',
          onPress: async () => {
            const updatedPet = {
              ...markPet,
              isDeceased: true,
              deceasedDate: markDate || new Date().toISOString(),
              memorialNote: markNote,
              memorialPhotos: [],
            };
            await updatePet(updatedPet);
            setShowMarkDeceasedModal(false);
            Alert.alert(
              '🌈 永远记得',
              `${markPet.name} 已被添加到彩虹桥纪念册。它将永远活在我们心中。`
            );
          },
        },
      ]
    );
  };

  const handleRestorePet = (pet) => {
    Alert.alert(
      '恢复猫咪',
      `确定要将 ${pet.name} 从已故记录中恢复吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '恢复',
          onPress: async () => {
            const updatedPet = {
              ...pet,
              isDeceased: false,
              deceasedDate: undefined,
              memorialNote: undefined,
            };
            await updatePet(updatedPet);
          },
        },
      ]
    );
  };

  const handleAddMemorialPhoto = async (pet) => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('需要权限', '请允许访问相册。');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const newPhoto = {
        id: generateId(),
        uri: result.assets[0].uri,
        date: new Date().toISOString(),
      };
      const updatedPet = {
        ...pet,
        memorialPhotos: [...(pet.memorialPhotos || []), newPhoto],
      };
      await updatePet(updatedPet);
      setSelectedPet(updatedPet);
    }
  };

  const handleUpdateMemorialNote = async () => {
    if (!selectedPet) return;
    const updatedPet = { ...selectedPet, memorialNote: editedNote };
    await updatePet(updatedPet);
    setSelectedPet(updatedPet);
    setIsEditingNote(false);
  };

  const getDeceasedAge = (pet) => {
    if (!pet || !pet.birthDate || !pet.deceasedDate) return null;
    const birth = new Date(pet.birthDate);
    const deceased = new Date(pet.deceasedDate);
    let years = deceased.getFullYear() - birth.getFullYear();
    let months = deceased.getMonth() - birth.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years > 0) {
      return `享年 ${years}岁${months > 0 ? `${months}个月` : ''}`;
    }
    return `享年 ${months}个月`;
  };

  const getDaysSince = (dateString) => {
    if (!dateString) return null;
    if (typeof dateString !== 'string') return null;
    // Parse date as local date to avoid timezone issues
    const parts = dateString.split('-');
    if (parts.length !== 3) return null;
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((now - date) / 86400000);
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '昨天';
    if (diffDays < 30) return `${diffDays} 天前`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} 个月前`;
    const years = Math.floor(diffDays / 365);
    const remainMonths = Math.floor((diffDays % 365) / 30);
    return remainMonths > 0 ? `${years} 年 ${remainMonths} 个月前` : `${years} 年前`;
  };

  const isAnniversaryNear = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const thisYearAnniversary = new Date(
      now.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const diffDays = Math.round(
      (thisYearAnniversary - now) / 86400000
    );
    return diffDays >= 0 && diffDays <= 7;
  };

  const getAnniversaryText = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const years = now.getFullYear() - date.getFullYear();
    const thisYearAnniversary = new Date(
      now.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const diffDays = Math.round(
      (thisYearAnniversary - now) / 86400000
    );
    if (diffDays === 0) return `🕯️ 今天是 ${years} 周年纪念日`;
    if (diffDays > 0 && diffDays <= 7) return `🕯️ ${diffDays} 天后是 ${years} 周年纪念日`;
    return null;
  };

  const isValidDateString = (str) => {
    if (!str) return true; // empty is OK (defaults to today)
    const match = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return false;
    const d = new Date(str);
    return !isNaN(d.getTime()) && d <= new Date();
  };

  const getGenderDisplay = (gender) => {
    if (gender === 'male') return '♂️ 公';
    if (gender === 'female') return '♀️ 母';
    return null;
  };

  const handleDeleteMemorialPhoto = (pet, photoId) => {
    Alert.alert('删除照片', '确定要删除这张纪念照片吗？', [
      { text: '取消', style: 'cancel' },
      {
        text: '删除',
        style: 'destructive',
        onPress: async () => {
          const updatedPet = {
            ...pet,
            memorialPhotos: (pet.memorialPhotos || []).filter(
              (p) => p.id !== photoId
            ),
          };
          await updatePet(updatedPet);
          setSelectedPet(updatedPet);
        },
      },
    ]);
  };

  const renderDeceasedCard = (pet) => (
    <TouchableOpacity
      key={pet.id}
      style={styles.memorialCard}
      onPress={() => handleViewMemorial(pet)}
      activeOpacity={0.8}
    >
      {/* Candle decoration */}
      <View style={styles.candleDecor}>
        <Text style={styles.candleEmoji}>🕯️</Text>
      </View>

      <View style={styles.memorialCardInner}>
        {/* Pet Photo */}
        <View style={styles.memorialPhotoContainer}>
          {pet.photo ? (
            <Image source={{ uri: pet.photo }} style={styles.memorialPhoto} />
          ) : (
            <View style={styles.memorialPhotoPlaceholder}>
              <Text style={styles.memorialPhotoEmoji}>🐱</Text>
            </View>
          )}
          <View style={styles.rainbowBridge}>
            <Text style={styles.rainbowEmoji}>🌈</Text>
          </View>
        </View>

        {/* Pet Info */}
        <View style={styles.memorialInfo}>
          <Text style={styles.memorialName}>{pet.name}</Text>
          <Text style={styles.memorialBreed}>
            {getBreedLabel(pet.breed) || '未知品种'}
          </Text>
          {getDeceasedAge(pet) && (
            <Text style={styles.memorialAge}>{getDeceasedAge(pet)}</Text>
          )}
          {pet.deceasedDate && (
            <Text style={styles.memorialDate}>
              🌟 {formatDate(pet.deceasedDate)}
            </Text>
          )}
          {pet.deceasedDate && (
            <Text style={styles.memorialDaysSince}>
              离开我们 {getDaysSince(pet.deceasedDate)}
            </Text>
          )}
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.textLight}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.headerEmoji}>🌈</Text>
          <Text style={styles.headerTitle}>彩虹桥纪念册</Text>
          <Text style={styles.headerSubtitle}>
            纪念那些永远活在我们心中的毛孩子
          </Text>
          <Text style={styles.headerQuote}>
            “它们只是先去了彩虹桥的那一边等我们”
          </Text>
          {/* Stats */}
          {deceasedPets.length > 0 && (
            <View style={styles.headerStats}>
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>{deceasedPets.length}</Text>
                <Text style={styles.headerStatLabel}>毛孩子</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {deceasedPets.reduce(
                    (acc, p) => acc + (p.memorialPhotos?.length || 0),
                    0
                  )}
                </Text>
                <Text style={styles.headerStatLabel}>纪念照片</Text>
              </View>
              <View style={styles.headerStatDivider} />
              <View style={styles.headerStatItem}>
                <Text style={styles.headerStatValue}>
                  {deceasedPets.filter((p) => p.memorialNote).length}
                </Text>
                <Text style={styles.headerStatLabel}>寄语</Text>
              </View>
            </View>
          )}
        </View>

        {/* Deceased Pets */}
        {deceasedPets.length > 0 ? (
          <View style={styles.memorialListContainer}>
            {deceasedPets.map((pet) => renderDeceasedCard(pet))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🍀</Text>
            <Text style={styles.emptyTitle}>所有猫咪都健在</Text>
            <Text style={styles.emptySubtitle}>
              愿你的猫咪们都健康长寿 ❤️
            </Text>
          </View>
        )}

        {/* Mark as Deceased Section */}
        {alivePets.length > 0 && (
          <View style={styles.markSection}>
            <Text style={styles.markSectionTitle}>标记已故猫咪</Text>
            <Text style={styles.markSectionSubtitle}>
              如果你的猫咪已经离开，可以将它添加到纪念册
            </Text>
            {alivePets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.markItem}
                onPress={() => handleMarkDeceased(pet)}
              >
                <View style={styles.markItemLeft}>
                  {pet.photo ? (
                    <Image
                      source={{ uri: pet.photo }}
                      style={styles.markItemAvatar}
                    />
                  ) : (
                    <View style={styles.markItemAvatarPlaceholder}>
                      <Text style={{ fontSize: 20 }}>🐱</Text>
                    </View>
                  )}
                  <Text style={styles.markItemName}>{pet.name}</Text>
                </View>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={theme.colors.textLight}
                />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Memorial Detail Modal */}
      <Modal
        visible={showMemorialModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMemorialModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                🕯️ {selectedPet?.name} 的纪念页
              </Text>
              <TouchableOpacity onPress={() => setShowMemorialModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
            >
              {/* Memorial Photo */}
              {selectedPet?.photo && (
                <View style={styles.modalPhotoContainer}>
                  <Image
                    source={{ uri: selectedPet.photo }}
                    style={styles.modalPhoto}
                  />
                  <View style={styles.modalPhotoOverlay}>
                    <Text style={styles.modalPhotoName}>
                      {selectedPet?.name}
                    </Text>
                    {selectedPet?.birthDate && selectedPet?.deceasedDate && (
                      <Text style={styles.modalPhotoDates}>
                        {formatDate(selectedPet.birthDate)} ~{' '}
                        {formatDate(selectedPet.deceasedDate)}
                      </Text>
                    )}
                  </View>
                </View>
              )}

              {/* Info */}
              <View style={styles.modalInfoSection}>
                {getDeceasedAge(selectedPet) && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>🎂 年龄</Text>
                    <Text style={styles.modalInfoValue}>
                      {getDeceasedAge(selectedPet)}
                    </Text>
                  </View>
                )}
                <View style={styles.modalInfoRow}>
                  <Text style={styles.modalInfoLabel}>🐱 品种</Text>
                  <Text style={styles.modalInfoValue}>
                    {getBreedLabel(selectedPet?.breed) || '未知'}
                  </Text>
                </View>
                {getGenderDisplay(selectedPet?.gender) && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>🐾 性别</Text>
                    <Text style={styles.modalInfoValue}>
                      {getGenderDisplay(selectedPet?.gender)}
                    </Text>
                  </View>
                )}
                {selectedPet?.deceasedDate && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>🌟 离开日期</Text>
                    <Text style={styles.modalInfoValue}>
                      {formatDate(selectedPet.deceasedDate)}
                    </Text>
                  </View>
                )}
                {selectedPet?.deceasedDate && (
                  <View style={styles.modalInfoRow}>
                    <Text style={styles.modalInfoLabel}>⏳ 已离开</Text>
                    <Text style={styles.modalInfoValue}>
                      {getDaysSince(selectedPet.deceasedDate)}
                    </Text>
                  </View>
                )}
                {getAnniversaryText(selectedPet?.deceasedDate) && (
                  <View style={[styles.modalInfoRow, styles.modalAnniversaryRow]}>
                    <Text style={styles.modalAnniversaryText}>
                      {getAnniversaryText(selectedPet?.deceasedDate)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Memorial Note */}
              <View style={styles.modalNoteSection}>
                <View style={styles.modalNoteSectionHeader}>
                  <Text style={styles.modalNoteTitle}>💝 纪念寄语</Text>
                  {!isEditingNote ? (
                    <TouchableOpacity
                      onPress={() => setIsEditingNote(true)}
                      style={styles.editNoteBtn}
                    >
                      <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                      <Text style={styles.editNoteBtnText}>编辑</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.noteActionBtns}>
                      <TouchableOpacity
                        onPress={() => {
                          setIsEditingNote(false);
                          setEditedNote(selectedPet?.memorialNote || '');
                        }}
                        style={styles.cancelNoteBtn}
                      >
                        <Text style={styles.cancelNoteBtnText}>取消</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={handleUpdateMemorialNote}
                        style={styles.saveNoteBtn}
                      >
                        <Ionicons name="checkmark" size={18} color="#FFF" />
                        <Text style={styles.saveNoteBtnText}>保存</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
                {isEditingNote ? (
                  <TextInput
                    style={styles.modalNoteInput}
                    placeholder="写下你想对它说的话..."
                    placeholderTextColor={theme.colors.textLight}
                    multiline
                    value={editedNote}
                    onChangeText={setEditedNote}
                    autoFocus
                  />
                ) : (
                  <View style={styles.modalNoteDisplay}>
                    {selectedPet?.memorialNote ? (
                      <Text style={styles.modalNoteDisplayText}>
                        {selectedPet.memorialNote}
                      </Text>
                    ) : (
                      <Text style={styles.modalNoteEmptyText}>
                        轻点“编辑”添加纪念寄语...
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Memorial Photos */}
              <View style={styles.modalPhotosSection}>
                <View style={styles.modalPhotosSectionHeader}>
                  <Text style={styles.modalPhotosSectionTitle}>
                    📷 纪念相册
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      selectedPet && handleAddMemorialPhoto(selectedPet)
                    }
                  >
                    <Ionicons
                      name="add-circle"
                      size={28}
                      color={theme.colors.primary}
                    />
                  </TouchableOpacity>
                </View>
                {selectedPet?.memorialPhotos &&
                selectedPet.memorialPhotos.length > 0 ? (
                  <View style={styles.modalPhotosGrid}>
                    {selectedPet.memorialPhotos.map((photo, index) => (
                      <TouchableOpacity
                        key={photo.id}
                        onPress={() => setViewingPhotoIndex(index)}
                        onLongPress={() =>
                          selectedPet &&
                          handleDeleteMemorialPhoto(selectedPet, photo.id)
                        }
                        activeOpacity={0.8}
                        style={styles.photoGridItemWrapper}
                      >
                        <Image
                          source={{ uri: photo.uri }}
                          style={styles.modalPhotoGridItem}
                          resizeMode="cover"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.modalPhotosEmpty}>
                    添加照片来纪念美好时光
                  </Text>
                )}
                {selectedPet?.memorialPhotos && selectedPet.memorialPhotos.length > 0 && (
                  <Text style={styles.modalPhotosHint}>
                    💡 点击查看大图 · 长按删除
                  </Text>
                )}
              </View>

              {/* Restore Button */}
              <TouchableOpacity
                style={styles.restoreButton}
                onPress={() => {
                  setShowMemorialModal(false);
                  if (selectedPet) handleRestorePet(selectedPet);
                }}
              >
                <Ionicons
                  name="arrow-undo"
                  size={18}
                  color={theme.colors.info}
                />
                <Text style={styles.restoreButtonText}>
                  撤销已故标记
                </Text>
              </TouchableOpacity>

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Mark Deceased Modal */}
      <Modal
        visible={showMarkDeceasedModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMarkDeceasedModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.markModalOverlay}
        >
          <View style={styles.markModalContent}>
            <View style={styles.markModalIcon}>
              <Text style={{ fontSize: 40 }}>🕯️</Text>
            </View>
            <Text style={styles.markModalTitle}>
              纪念 {markPet?.name}
            </Text>
            <Text style={styles.markModalSubtitle}>
              请填写相关信息，让我们一起纪念它
            </Text>

            <TouchableOpacity
              style={[
                styles.markDatePickerBtn,
                markDate ? styles.markDatePickerBtnFilled : null,
              ]}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={markDate ? theme.colors.primary : theme.colors.textLight}
              />
              {markDate ? (
                <View style={{ flex: 1 }}>
                  <Text style={styles.markDateDisplayText}>
                    {(() => {
                      const d = new Date(markDate);
                      const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
                      const parts = markDate.split('-');
                      return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日 周${weekdays[d.getDay()]}`;
                    })()}
                  </Text>
                  <Text style={styles.markDateRawText}>{markDate}</Text>
                </View>
              ) : (
                <Text style={styles.markDatePlaceholder}>点击选择离开日期</Text>
              )}
              {markDate ? (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation && e.stopPropagation();
                    setMarkDate('');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={18} color={theme.colors.textLight} />
                </TouchableOpacity>
              ) : null}
            </TouchableOpacity>
            <Text style={styles.markDateHint}>
              💡 不选择则默认为今天
            </Text>

            <TextInput
              style={[styles.markModalInput, styles.markModalInputMultiline]}
              placeholder="写一段纪念寄语..."
              placeholderTextColor={theme.colors.textLight}
              multiline
              numberOfLines={4}
              value={markNote}
              onChangeText={setMarkNote}
            />

            <View style={styles.markModalButtons}>
              <TouchableOpacity
                style={styles.markModalCancelButton}
                onPress={() => setShowMarkDeceasedModal(false)}
              >
                <Text style={styles.markModalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.markModalConfirmButton}
                onPress={confirmMarkDeceased}
              >
                <Text style={styles.markModalConfirmText}>🌈 添加到纪念册</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Date Picker Modal for Mark Deceased */}
      <DatePickerModal
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(dateStr) => setMarkDate(dateStr)}
        initialDate={markDate}
        maxDate={new Date().toISOString().split('T')[0]}
        minDate={markPet?.birthDate || undefined}
        validationMessage={
          markPet?.birthDate
            ? `⚠️ 去世日期不能早于出生日期 (${markPet.birthDate})`
            : undefined
        }
      />

      {/* Photo Viewer Modal */}
      <Modal
        visible={viewingPhotoIndex !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingPhotoIndex(null)}
      >
        <View style={styles.photoViewerOverlay}>
          <TouchableOpacity
            style={styles.photoViewerClose}
            onPress={() => setViewingPhotoIndex(null)}
          >
            <Ionicons name="close" size={32} color="#FFF" />
          </TouchableOpacity>
          {viewingPhotoIndex !== null && selectedPet?.memorialPhotos && (
            <>
              <FlatList
                ref={photoViewerRef}
                data={selectedPet.memorialPhotos}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                initialScrollIndex={viewingPhotoIndex}
                getItemLayout={(data, index) => ({
                  length: Dimensions.get('window').width,
                  offset: Dimensions.get('window').width * index,
                  index,
                })}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.photoViewerSlide}>
                    <Image
                      source={{ uri: item.uri }}
                      style={styles.photoViewerImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                onMomentumScrollEnd={(event) => {
                  const newIndex = Math.round(
                    event.nativeEvent.contentOffset.x / Dimensions.get('window').width
                  );
                  setViewingPhotoIndex(newIndex);
                }}
              />
              <View style={styles.photoCounter}>
                <Text style={styles.photoCounterText}>
                  {viewingPhotoIndex + 1} / {selectedPet.memorialPhotos.length}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.photoViewerDeleteBtn}
                onPress={() => {
                  const photoToDelete = selectedPet.memorialPhotos[viewingPhotoIndex];
                  handleDeleteMemorialPhoto(selectedPet, photoToDelete.id);
                  // Adjust index after deletion
                  if (viewingPhotoIndex >= selectedPet.memorialPhotos.length - 1) {
                    setViewingPhotoIndex(Math.max(0, selectedPet.memorialPhotos.length - 2));
                  }
                  if (selectedPet.memorialPhotos.length <= 1) {
                    setViewingPhotoIndex(null);
                  }
                }}
              >
                <Ionicons name="trash" size={20} color="#FFF" />
                <Text style={styles.photoViewerDeleteText}>删除这张照片</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    headerSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      marginBottom: theme.spacing.md,
    },
    headerEmoji: {
      fontSize: 64,
      marginBottom: theme.spacing.sm,
    },
    headerTitle: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    headerSubtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.sm,
    },
    headerQuote: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      fontStyle: 'italic',
      textAlign: 'center',
    },
    headerStats: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
    },
    headerStatItem: {
      alignItems: 'center',
      flex: 1,
    },
    headerStatValue: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: '#BA90C6',
    },
    headerStatLabel: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    headerStatDivider: {
      width: 1,
      height: 28,
      backgroundColor: theme.colors.border,
      marginHorizontal: theme.spacing.sm,
    },
    // Memorial Cards
    memorialListContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    memorialCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    memorialCardAnniversary: {
      borderColor: '#BA90C6',
      borderWidth: 2,
    },
    anniversaryBanner: {
      backgroundColor: '#BA90C620',
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.md,
      alignItems: 'center',
    },
    anniversaryText: {
      fontSize: theme.fontSize.sm,
      color: '#BA90C6',
      fontWeight: theme.fontWeight.semibold,
    },
    candleDecor: {
      position: 'absolute',
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      zIndex: 1,
    },
    candleEmoji: {
      fontSize: 20,
    },
    memorialCardInner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
    },
    memorialPhotoContainer: {
      position: 'relative',
    },
    memorialPhoto: {
      width: 64,
      height: 64,
      borderRadius: 32,
      borderWidth: 2,
      borderColor: theme.colors.primaryLight,
    },
    memorialPhotoPlaceholder: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primaryLight + '30',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.primaryLight,
    },
    memorialPhotoEmoji: {
      fontSize: 32,
    },
    rainbowBridge: {
      position: 'absolute',
      bottom: -4,
      right: -4,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rainbowEmoji: {
      fontSize: 14,
    },
    memorialInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    memorialName: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    memorialNameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    memorialGender: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    memorialPhotoCount: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 4,
    },
    memorialBreed: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    memorialAge: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    memorialDate: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      marginTop: 4,
    },
    memorialDaysSince: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 2,
    },
    memorialNotePreview: {
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.md,
    },
    memorialNoteText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    // Empty State
    emptyContainer: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xxl,
      paddingHorizontal: theme.spacing.lg,
    },
    emptyEmoji: {
      fontSize: 64,
      marginBottom: theme.spacing.md,
    },
    emptyTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    emptySubtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
    // Mark Section
    markSection: {
      marginHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.md,
    },
    markSectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.xs,
    },
    markSectionSubtitle: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.md,
    },
    markItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    markItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    markItemAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    markItemAvatarPlaceholder: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.primaryLight + '40',
      justifyContent: 'center',
      alignItems: 'center',
    },
    markItemName: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
    // Memorial Detail Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      maxHeight: '90%',
    },
    modalHeader: {
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
    },
    modalScroll: {
      padding: theme.spacing.md,
    },
    modalPhotoContainer: {
      position: 'relative',
      borderRadius: theme.borderRadius.lg,
      overflow: 'hidden',
      marginBottom: theme.spacing.md,
    },
    modalPhoto: {
      width: '100%',
      height: 220,
    },
    modalPhotoOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: theme.spacing.md,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalPhotoName: {
      fontSize: theme.fontSize.xxl,
      fontWeight: theme.fontWeight.bold,
      color: '#FFFFFF',
    },
    modalPhotoDates: {
      fontSize: theme.fontSize.sm,
      color: '#FFFFFF',
      opacity: 0.9,
      marginTop: 4,
    },
    modalInfoSection: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    modalInfoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalInfoLabel: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    modalInfoValue: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
    modalNoteSection: {
      marginBottom: theme.spacing.md,
    },
    modalNoteSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    modalNoteTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    editNoteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    editNoteBtnText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    noteActionBtns: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    cancelNoteBtn: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelNoteBtnText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    saveNoteBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 6,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.primary,
    },
    saveNoteBtnText: {
      fontSize: theme.fontSize.sm,
      color: '#FFF',
      fontWeight: theme.fontWeight.medium,
    },
    modalNoteDisplay: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background,
    },
    modalNoteDisplayText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      lineHeight: 22,
    },
    modalNoteEmptyText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      fontStyle: 'italic',
    },
    modalNoteInput: {
      minHeight: 80,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      textAlignVertical: 'top',
    },
    modalPhotosSection: {
      marginBottom: theme.spacing.md,
    },
    modalPhotosSectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    modalPhotosSectionTitle: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    modalPhotosGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
      marginHorizontal: -2,
    },
    photoGridItemWrapper: {
      width: '48%',
      marginBottom: theme.spacing.sm,
    },
    modalPhotoGridItem: {
      width: '100%',
      aspectRatio: 1,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.border,
    },
    modalPhotosEmpty: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.textLight,
      textAlign: 'center',
      paddingVertical: theme.spacing.lg,
    },
    modalPhotosHint: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      textAlign: 'center',
      marginTop: theme.spacing.xs,
    },
    modalAnniversaryRow: {
      justifyContent: 'center',
      backgroundColor: '#BA90C610',
      borderRadius: theme.borderRadius.sm,
      marginTop: theme.spacing.xs,
      borderBottomWidth: 0,
    },
    modalAnniversaryText: {
      fontSize: theme.fontSize.md,
      color: '#BA90C6',
      fontWeight: theme.fontWeight.semibold,
      textAlign: 'center',
    },
    restoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      paddingVertical: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.info,
      borderRadius: theme.borderRadius.md,
    },
    restoreButtonText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.info,
      fontWeight: theme.fontWeight.medium,
    },
    // Mark Deceased Modal
    markModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    markModalContent: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.xl,
      width: '100%',
      maxWidth: 360,
      alignItems: 'center',
    },
    markModalIcon: {
      marginBottom: theme.spacing.md,
    },
    markModalTitle: {
      fontSize: theme.fontSize.xl,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    markModalSubtitle: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    markDatePickerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 12,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.xs,
      gap: theme.spacing.sm,
      minHeight: 48,
    },
    markDatePickerBtnFilled: {
      borderColor: theme.colors.primary + '60',
      backgroundColor: theme.colors.primary + '08',
    },
    markDateDisplayText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.text,
    },
    markDateRawText: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginTop: 1,
    },
    markDatePlaceholder: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textLight,
      flex: 1,
    },
    markDateHint: {
      fontSize: theme.fontSize.xs,
      color: theme.colors.textLight,
      marginBottom: theme.spacing.sm,
      alignSelf: 'flex-start',
    },
    markModalInput: {
      width: '100%',
      height: 48,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      fontSize: theme.fontSize.md,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginBottom: theme.spacing.sm,
    },
    markModalInputError: {
      borderColor: '#E57373',
    },
    markDateError: {
      fontSize: theme.fontSize.xs,
      color: '#E57373',
      marginBottom: theme.spacing.sm,
      marginTop: -4,
    },
    markModalInputMultiline: {
      height: 100,
      textAlignVertical: 'top',
      paddingTop: theme.spacing.sm,
    },
    markModalButtons: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginTop: theme.spacing.md,
      width: '100%',
    },
    markModalCancelButton: {
      flex: 1,
      height: 44,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    markModalCancelText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: theme.colors.textSecondary,
    },
    markModalConfirmButton: {
      flex: 1.5,
      height: 44,
      borderRadius: theme.borderRadius.md,
      backgroundColor: '#BA90C6',
      justifyContent: 'center',
      alignItems: 'center',
    },
    markModalConfirmText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.medium,
      color: '#FFFFFF',
    },
    photoViewerOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.95)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoViewerSlide: {
      width: Dimensions.get('window').width,
      height: Dimensions.get('window').height,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoViewerClose: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      right: 20,
      zIndex: 10,
      padding: 8,
      backgroundColor: 'rgba(0,0,0,0.5)',
      borderRadius: 20,
    },
    photoViewerImage: {
      width: '90%',
      height: '70%',
    },
    photoCounter: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 55 : 35,
      alignSelf: 'center',
      backgroundColor: 'rgba(0,0,0,0.6)',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    photoCounterText: {
      color: '#FFF',
      fontSize: theme.fontSize.sm,
      fontWeight: theme.fontWeight.medium,
    },
    photoViewerDeleteBtn: {
      position: 'absolute',
      bottom: Platform.OS === 'ios' ? 50 : 30,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: '#E57373',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    photoViewerDeleteText: {
      fontSize: theme.fontSize.md,
      color: '#FFF',
      fontWeight: theme.fontWeight.medium,
    },
  });
