import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Image,
  Platform,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/AppContext';
import { getPetTypeIcon, calculateAge } from '../utils/helpers';

// Custom Text Input
export function FormInput({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = 'default',
  icon,
  error,
  required = false,
}) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <View style={[formStyles.inputContainer, multiline && formStyles.inputContainerMultiline, error && formStyles.inputError]}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={theme.colors.textSecondary}
            style={[formStyles.inputIcon, multiline && formStyles.inputIconMultiline]}
          />
        )}
        <TextInput
          style={[formStyles.input, multiline && formStyles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textLight}
          multiline={multiline}
          keyboardType={keyboardType}
          numberOfLines={multiline ? 5 : 1}
        />
      </View>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

// Option Picker (like a select dropdown)
export function FormPicker({ label, options, value, onChange, required = false, error, compact = false }) {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[formStyles.pickerButton, compact && formStyles.pickerButtonCompact, error && formStyles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text
          style={[
            formStyles.pickerText,
            !selected && formStyles.pickerPlaceholder,
          ]}
        >
          {selected ? `${selected.icon || ''} ${selected.label}` : '请选择...'}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={formStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={formStyles.modalContent}>
            <View style={formStyles.modalHeader}>
              <Text style={formStyles.modalTitle}>选择{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={formStyles.modalScroll}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    formStyles.modalOption,
                    value === option.value && formStyles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    onChange(option.value);
                    setModalVisible(false);
                  }}
                >
                  {option.icon && (
                    <Text style={formStyles.optionIcon}>{option.icon}</Text>
                  )}
                  <Text
                    style={[
                      formStyles.optionText,
                      value === option.value && formStyles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {value === option.value && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

// ════════════════════════════════════════════
// Friendly Date Picker with scrollable wheels
// ════════════════════════════════════════════

export function DatePickerModal({ visible, onClose, onSelect, initialDate, maxDate, minDate, minYear = 1990, validationMessage, allowFuture = false }) {
  const theme = useTheme();
  const ds = React.useMemo(() => createDatePickerStyles(theme), [theme]);

  const today = new Date();
  const maxD = maxDate ? new Date(maxDate) : today;
  const maxYear = maxD.getFullYear();
  const minD = minDate ? new Date(minDate) : null;
  const effectiveMinYear = minD ? Math.max(minYear, minD.getFullYear()) : minYear;

  // Parse initial date
  const parseInit = () => {
    if (initialDate && initialDate.length === 10) {
      const d = new Date(initialDate);
      if (!isNaN(d.getTime())) return d;
    }
    return today;
  };

  const [selYear, setSelYear] = useState(() => parseInit().getFullYear());
  const [selMonth, setSelMonth] = useState(() => parseInit().getMonth() + 1);
  const [selDay, setSelDay] = useState(() => parseInit().getDate());

  React.useEffect(() => {
    if (visible) {
      const d = parseInit();
      setSelYear(d.getFullYear());
      setSelMonth(d.getMonth() + 1);
      setSelDay(d.getDate());
      setDateError('');
    }
  }, [visible, initialDate]);

  const years = React.useMemo(() => {
    const arr = [];
    for (let y = maxYear; y >= effectiveMinYear; y--) arr.push(y);
    return arr;
  }, [maxYear, effectiveMinYear]);

  const months = React.useMemo(() => {
    const arr = [];
    const startMonth = (minD && selYear === minD.getFullYear()) ? minD.getMonth() + 1 : 1;
    const endMonth = (!allowFuture && selYear === today.getFullYear())
      ? today.getMonth() + 1
      : 12;
    for (let m = startMonth; m <= endMonth; m++) arr.push(m);
    return arr;
  }, [selYear, allowFuture, minD]);

  const daysInMonth = React.useMemo(() => {
    return new Date(selYear, selMonth, 0).getDate();
  }, [selYear, selMonth]);

  const days = React.useMemo(() => {
    const arr = [];
    const startDay = (minD && selYear === minD.getFullYear() && selMonth === minD.getMonth() + 1)
      ? minD.getDate()
      : 1;
    const isCurrentYearMonth = !allowFuture
      && selYear === today.getFullYear()
      && selMonth === today.getMonth() + 1;
    const endDay = isCurrentYearMonth ? today.getDate() : daysInMonth;
    for (let d = startDay; d <= endDay; d++) arr.push(d);
    return arr;
  }, [selYear, selMonth, daysInMonth, allowFuture, minD]);

  React.useEffect(() => {
    // Debug logs to help diagnose empty picker issues
    if (visible) {
      try {
        console.log('DatePickerModal debug:', {
          initialDate,
          minDate: minDate ? minD && minD.toISOString().split('T')[0] : null,
          maxDate: maxD && maxD.toISOString().split('T')[0],
          effectiveMinYear,
          yearsCount: years.length,
          monthsCount: months.length,
          daysCount: days.length,
          allowFuture,
        });
      } catch (e) {
        console.warn('Error logging DatePickerModal debug:', e);
      }
    }
  }, [visible, initialDate, minDate, maxDate, selYear, selMonth]);

  // Clamp day when month/year changes
  React.useEffect(() => {
    if (selDay > daysInMonth) setSelDay(daysInMonth);
  }, [daysInMonth]);

  const [dateError, setDateError] = useState('');

  const handleConfirm = () => {
    const mm = String(selMonth).padStart(2, '0');
    const dd = String(selDay).padStart(2, '0');
    const selectedDate = new Date(selYear, selMonth - 1, selDay);
    selectedDate.setHours(0, 0, 0, 0);

    const todayClean = new Date();
    todayClean.setHours(0, 0, 0, 0);

    // Validate: not in the future (skip for reminders)
    if (!allowFuture && selectedDate > todayClean) {
      setDateError('⚠️ 不能选择未来的日期');
      return;
    }

    // Validate: not before minDate
    if (minD) {
      const minClean = new Date(minD);
      minClean.setHours(0, 0, 0, 0);
      if (selectedDate < minClean) {
        const minStr = `${minD.getFullYear()}年${minD.getMonth() + 1}月${minD.getDate()}日`;
        setDateError(validationMessage || `⚠️ 日期不能早于 ${minStr}`);
        return;
      }
    }

    // Validate: not after maxDate
    if (maxDate) {
      const maxClean = new Date(maxD);
      maxClean.setHours(0, 0, 0, 0);
      if (selectedDate > maxClean) {
        setDateError('⚠️ 日期超出允许范围');
        return;
      }
    }

    setDateError('');
    onSelect(`${selYear}-${mm}-${dd}`);
    onClose();
  };

  const quickSelect = (date) => {
    setSelYear(date.getFullYear());
    setSelMonth(date.getMonth() + 1);
    setSelDay(date.getDate());
  };

  const todayDate = new Date();
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const weekAgoDate = new Date(todayDate);
  weekAgoDate.setDate(weekAgoDate.getDate() - 7);
  const tomorrowDate = new Date(todayDate);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const weekLaterDate = new Date(todayDate);
  weekLaterDate.setDate(weekLaterDate.getDate() + 7);


  const formatPreview = () => {
    const mm = String(selMonth).padStart(2, '0');
    const dd = String(selDay).padStart(2, '0');
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const d = new Date(selYear, selMonth - 1, selDay);
    const wd = weekdays[d.getDay()];
    return `${selYear}年${selMonth}月${selDay}日 周${wd}`;
  };

  const renderWheel = (data, selected, onSelect, width, labelSuffix = '') => (
    <View style={[ds.wheelContainer, { width }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ds.wheelScroll}
        snapToInterval={44}
        decelerationRate="fast"
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={[ds.wheelItem, selected === item && ds.wheelItemSelected]}
            onPress={() => onSelect(item)}
          >
            <Text
              style={[
                ds.wheelItemText,
                selected === item && ds.wheelItemTextSelected,
              ]}
            >
              {item}{labelSuffix}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ds.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ds.container} onStartShouldSetResponder={() => true}>
          {/* Handle */}
          <View style={ds.handle} />

          {/* Header */}
          <View style={ds.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={ds.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={ds.title}>选择日期</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={ds.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>

          {/* Preview */}
          <View style={ds.preview}>
            <Text style={ds.previewText}>📅 {formatPreview()}</Text>
            {dateError ? (
              <Text style={ds.dateErrorText}>{dateError}</Text>
            ) : null}
          </View>

          {/* Quick Select */}
          <View style={ds.quickRow}>
            {(minD
              ? [
                  { label: '今天', date: todayDate },
                  { label: '明天', date: tomorrowDate },
                  { label: '一周后', date: weekLaterDate },
                ]
              : [
                  { label: '今天', date: todayDate },
                  { label: '昨天', date: yesterdayDate },
                  { label: '一周前', date: weekAgoDate },
                ]
            ).map(({ label, date }) => (
              <TouchableOpacity
                key={label}
                style={ds.quickBtn}
                onPress={() => quickSelect(date)}
              >
                <Text style={ds.quickBtnText}>{label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Wheels */}
          <View style={ds.wheelsRow}>
            {renderWheel(years, selYear, setSelYear, 100, '年')}
            {renderWheel(months, selMonth, setSelMonth, 70, '月')}
            {renderWheel(days, selDay, setSelDay, 70, '日')}
          </View>

          {/* Bottom Confirm */}
          <TouchableOpacity style={ds.confirmBtn} onPress={handleConfirm}>
            <Text style={ds.confirmBtnText}>✓ 确认选择</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const createDatePickerStyles = (theme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.border,
      alignSelf: 'center',
      marginTop: 10,
      marginBottom: 6,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    cancelText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    title: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.text,
    },
    confirmText: {
      fontSize: theme.fontSize.md,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
    },
    preview: {
      alignItems: 'center',
      paddingVertical: 12,
    },
    previewText: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.semibold,
      color: theme.colors.text,
    },
    dateErrorText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.error || '#E57373',
      marginTop: 6,
      fontWeight: theme.fontWeight.medium,
    },
    quickRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
      marginBottom: 12,
    },
    quickBtn: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      backgroundColor: theme.colors.primary + '15',
      borderWidth: 1,
      borderColor: theme.colors.primary + '30',
    },
    quickBtnText: {
      fontSize: theme.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: theme.fontWeight.medium,
    },
    wheelsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 16,
      height: 220,
    },
    wheelContainer: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      overflow: 'hidden',
    },
    wheelScroll: {
      paddingVertical: 6,
    },
    wheelItem: {
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 8,
      marginHorizontal: 4,
      marginVertical: 1,
    },
    wheelItemSelected: {
      backgroundColor: theme.colors.primary + '18',
    },
    wheelItemText: {
      fontSize: theme.fontSize.md,
      color: theme.colors.textSecondary,
    },
    wheelItemTextSelected: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: theme.colors.primary,
    },
    confirmBtn: {
      marginHorizontal: 16,
      marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
    },
    confirmBtnText: {
      fontSize: theme.fontSize.lg,
      fontWeight: theme.fontWeight.bold,
      color: '#FFF',
    },
  });

// ─── FormDateInput ───
export function FormDateInput({
  label,
  value,
  onChange,
  placeholder = '点击选择日期',
  required = false,
  error,
  isWarning = false,
  maxDate,
  minDate,
  allowFuture = false,
  hideAgeHint = false,
}) {
  const [showPicker, setShowPicker] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);

  const handleDateChange = (text) => {
    let cleaned = text.replace(/[^0-9-]/g, '');
    const digitsOnly = cleaned.replace(/-/g, '');
    let formatted = '';
    for (let i = 0; i < digitsOnly.length && i < 8; i++) {
      if (i === 4 || i === 6) {
        formatted += '-';
      }
      formatted += digitsOnly[i];
    }
    onChange(formatted);
  };

  // Calculate helper text showing relative time
  const getAgeHint = () => {
    if (!value || value.length !== 10) return null;
    const parts = value.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    const [y, m, d] = parts;
    const parsed = new Date(y, m - 1, d);
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isFuture = parsed > todayMidnight;
    if (isFuture && !allowFuture) return null;
    const diffDays = Math.round(Math.abs(parsed - todayMidnight) / 86400000);
    const suffix = isFuture ? '后' : '前';
    if (diffDays === 0) return '今天';
    if (diffDays < 30) return `约 ${diffDays} 天${suffix}`;
    const diffMonths = Math.floor(diffDays / 30.44);
    if (diffMonths < 12) return `约 ${diffMonths} 个月${suffix}`;
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return months > 0 ? `约 ${years} 岁 ${months} 个月${suffix}` : `约 ${years} 岁${suffix}`;
  };

  const getDisplayValue = () => {
    if (!value || value.length !== 10) return null;
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
    const parts = value.split('-');
    return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日 周${weekdays[d.getDay()]}`;
  };

  const ageHint = getAgeHint();
  const displayValue = getDisplayValue();

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          formStyles.datePickerButton,
          error && !isWarning && formStyles.inputError,
          error && isWarning && formStyles.inputWarning,
        ]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={value ? theme.colors.primary : theme.colors.textSecondary}
          style={formStyles.inputIcon}
        />
        <View style={formStyles.dateDisplayWrap}>
          {displayValue ? (
            <>
              <Text style={formStyles.dateDisplayText}>{displayValue}</Text>
              <Text style={formStyles.dateRawText}>{value}</Text>
            </>
          ) : (
            <Text style={formStyles.datePlaceholder}>{placeholder}</Text>
          )}
        </View>
        {value ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation && e.stopPropagation();
              onChange('');
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>

      {error && <Text style={[formStyles.errorText, isWarning && formStyles.warningText]}>{error}</Text>}
      {!hideAgeHint && ageHint && !error && (
        <Text style={formStyles.hintText}>🐱 {ageHint}</Text>
      )}

      <DatePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={onChange}
        initialDate={value}
        maxDate={maxDate}
        minDate={minDate}
        allowFuture={allowFuture}
      />
    </View>
  );
}

// Action Button
export function FormButton({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  loading = false,
}) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const buttonStyle = [
    formStyles.button,
    variant === 'secondary' && formStyles.buttonSecondary,
    variant === 'danger' && formStyles.buttonDanger,
    variant === 'outline' && formStyles.buttonOutline,
    disabled && formStyles.buttonDisabled,
  ];

  const textStyle = [
    formStyles.buttonText,
    variant === 'outline' && formStyles.buttonTextOutline,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={20}
          color={variant === 'outline' ? theme.colors.primary : '#FFF'}
        />
      )}
      <Text style={textStyle}>{loading ? '请稍候...' : title}</Text>
    </TouchableOpacity>
  );
}

// ════════════════════════════════════════════
// Time Picker Modal with scrollable wheels
// ════════════════════════════════════════════

export function TimePickerModal({ visible, onClose, onSelect, initialTime }) {
  const theme = useTheme();
  const ds = React.useMemo(() => createDatePickerStyles(theme), [theme]);

  const parseInit = () => {
    if (initialTime && /^\d{2}:\d{2}$/.test(initialTime)) {
      const [h, m] = initialTime.split(':').map(Number);
      return { h, m };
    }
    const now = new Date();
    return { h: now.getHours(), m: now.getMinutes() };
  };

  const [selHour, setSelHour] = useState(() => parseInit().h);
  const [selMin, setSelMin] = useState(() => parseInit().m);

  React.useEffect(() => {
    if (visible) {
      const { h, m } = parseInit();
      setSelHour(h);
      setSelMin(m);
    }
  }, [visible, initialTime]);

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = React.useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  const handleConfirm = () => {
    const hh = String(selHour).padStart(2, '0');
    const mm = String(selMin).padStart(2, '0');
    onSelect(`${hh}:${mm}`);
    onClose();
  };

  const formatPreview = () => {
    const hh = String(selHour).padStart(2, '0');
    const mm = String(selMin).padStart(2, '0');
    const period = selHour < 12 ? '上午' : '下午';
    const h12 = selHour % 12 || 12;
    return `${period} ${h12}:${mm}  (${hh}:${mm})`;
  };

  const renderWheel = (data, selected, onSel, width) => (
    <View style={[ds.wheelContainer, { width }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={ds.wheelScroll}
        snapToInterval={44}
        decelerationRate="fast"
      >
        {data.map((item) => (
          <TouchableOpacity
            key={item}
            style={[ds.wheelItem, selected === item && ds.wheelItemSelected]}
            onPress={() => onSel(item)}
          >
            <Text style={[ds.wheelItemText, selected === item && ds.wheelItemTextSelected]}>
              {String(item).padStart(2, '0')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={ds.overlay} activeOpacity={1} onPress={onClose}>
        <View style={ds.container} onStartShouldSetResponder={() => true}>
          <View style={ds.handle} />
          <View style={ds.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={ds.cancelText}>取消</Text>
            </TouchableOpacity>
            <Text style={ds.title}>选择时间</Text>
            <TouchableOpacity onPress={handleConfirm}>
              <Text style={ds.confirmText}>确定</Text>
            </TouchableOpacity>
          </View>
          <View style={ds.preview}>
            <Text style={ds.previewText}>🕐 {formatPreview()}</Text>
          </View>
          <View style={[ds.wheelsRow, { justifyContent: 'center', gap: 24 }]}>
            <View style={{ alignItems: 'center' }}>
              <Text style={[ds.cancelText, { marginBottom: 4 }]}>时</Text>
              {renderWheel(hours, selHour, setSelHour, 80)}
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[ds.cancelText, { marginBottom: 4 }]}>分</Text>
              {renderWheel(minutes, selMin, setSelMin, 80)}
            </View>
          </View>
          <TouchableOpacity style={ds.confirmBtn} onPress={handleConfirm}>
            <Text style={ds.confirmBtnText}>✓ 确认选择</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── FormTimeInput ───
export function FormTimeInput({ label, value, onChange, required = false, error }) {
  const [showPicker, setShowPicker] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);

  const displayValue = value && /^\d{2}:\d{2}$/.test(value)
    ? (() => {
        const [h, m] = value.split(':').map(Number);
        const period = h < 12 ? '上午' : '下午';
        const h12 = h % 12 || 12;
        return `${period} ${h12}:${String(m).padStart(2, '0')}`;
      })()
    : null;

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[formStyles.datePickerButton, error && formStyles.inputError]}
        onPress={() => setShowPicker(true)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="time-outline"
          size={20}
          color={value ? theme.colors.primary : theme.colors.textSecondary}
          style={formStyles.inputIcon}
        />
        <View style={formStyles.dateDisplayWrap}>
          {displayValue ? (
            <>
              <Text style={formStyles.dateDisplayText}>{displayValue}</Text>
              <Text style={formStyles.dateRawText}>{value}</Text>
            </>
          ) : (
            <Text style={formStyles.datePlaceholder}>点击选择时间</Text>
          )}
        </View>
        {value ? (
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation && e.stopPropagation(); onChange(''); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={theme.colors.textLight} />
          </TouchableOpacity>
        ) : null}
      </TouchableOpacity>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
      <TimePickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={onChange}
        initialTime={value}
      />
    </View>
  );
}

// Section Header

export function SectionHeader({ title, actionLabel, onAction }) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  return (
    <View style={formStyles.sectionHeader}>
      <Text style={formStyles.sectionTitle}>{title}</Text>
      {actionLabel && (
        <TouchableOpacity onPress={onAction}>
          <Text style={formStyles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Chip / Tag selector
export function ChipGroup({ options, value, onChange, multiSelect = false }) {
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const handlePress = (optionValue) => {
    if (multiSelect) {
      const newValues = value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue];
      onChange(newValues);
    } else {
      onChange(optionValue);
    }
  };

  return (
    <View style={formStyles.chipGroup}>
      {options.map((option) => {
        const isSelected = multiSelect
          ? value.includes(option.value)
          : value === option.value;
        return (
          <TouchableOpacity
            key={option.value}
            style={[formStyles.chip, isSelected && formStyles.chipSelected]}
            onPress={() => handlePress(option.value)}
          >
            {option.icon && (
              <Text style={formStyles.chipIcon}>{option.icon}</Text>
            )}
            <Text
              style={[
                formStyles.chipText,
                isSelected && formStyles.chipTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Pet Picker with photos and rich card display
export function FormPetPicker({ label, pets, value, onChange, required = false, error }) {
  const [modalVisible, setModalVisible] = useState(false);
  const theme = useTheme();
  const formStyles = React.useMemo(() => createFormStyles(theme), [theme]);
  const selected = pets.find((p) => p.id === value);

  const genderSymbol = (gender) => gender === 'male' ? '♂' : gender === 'female' ? '♀' : null;
  const genderColor = (gender) => gender === 'male' ? '#3B82F6' : '#EC4899';

  return (
    <View style={formStyles.inputGroup}>
      {label && (
        <Text style={formStyles.label}>
          {label}
          {required && <Text style={formStyles.required}> *</Text>}
        </Text>
      )}
      <TouchableOpacity
        style={[formStyles.petPickerButton, error && formStyles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        {selected ? (
          <View style={formStyles.petPickerSelected}>
            <View style={formStyles.petPickerAvatarSmall}>
              {selected.photo ? (
                <Image source={{ uri: selected.photo }} style={formStyles.petPickerAvatarImgSmall} />
              ) : (
                <Text style={formStyles.petPickerEmojiSmall}>{getPetTypeIcon(selected.type)}</Text>
              )}
            </View>
            <Text style={formStyles.petPickerSelectedName}>{selected.name}</Text>
            {genderSymbol(selected.gender) && (
              <Text style={[formStyles.petPickerGenderSmall, { color: genderColor(selected.gender) }]}>
                {genderSymbol(selected.gender)}
              </Text>
            )}
          </View>
        ) : (
          <View style={formStyles.petPickerSelected}>
            <Ionicons name="paw-outline" size={20} color={theme.colors.textLight} />
            <Text style={formStyles.pickerPlaceholder}>请选择猫咪...</Text>
          </View>
        )}
        <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={formStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={formStyles.petPickerModalContent}>
            <View style={formStyles.petPickerModalHandle} />
            <View style={formStyles.petPickerModalHeader}>
              <Text style={formStyles.modalTitle}>选择猫咪</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView style={formStyles.petPickerModalScroll} showsVerticalScrollIndicator={false}>
              {pets.map((pet) => {
                const isSelected = value === pet.id;
                const age = pet.birthDate ? calculateAge(pet.birthDate) : null;
                const gs = genderSymbol(pet.gender);
                const gc = genderColor(pet.gender);
                return (
                  <TouchableOpacity
                    key={pet.id}
                    style={[
                      formStyles.petPickerCard,
                      isSelected && formStyles.petPickerCardSelected,
                    ]}
                    onPress={() => {
                      onChange(pet.id);
                      setModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={formStyles.petPickerAvatarContainer}>
                      {pet.photo ? (
                        <Image source={{ uri: pet.photo }} style={formStyles.petPickerAvatarImg} />
                      ) : (
                        <View style={formStyles.petPickerAvatarPlaceholder}>
                          <Text style={formStyles.petPickerEmoji}>{getPetTypeIcon(pet.type)}</Text>
                        </View>
                      )}
                      {gs && (
                        <View style={[formStyles.petPickerGenderDot, { backgroundColor: gc }]}>
                          <Text style={formStyles.petPickerGenderDotText}>{gs}</Text>
                        </View>
                      )}
                    </View>
                    <View style={formStyles.petPickerInfo}>
                      <Text style={[
                        formStyles.petPickerName,
                        isSelected && formStyles.petPickerNameSelected,
                      ]}>{pet.name}</Text>
                      <View style={formStyles.petPickerMeta}>
                        {age && (
                          <View style={formStyles.petPickerTag}>
                            <Ionicons name="calendar-outline" size={11} color={theme.colors.primary} />
                            <Text style={formStyles.petPickerTagText}>{age}</Text>
                          </View>
                        )}
                        {pet.weight && (
                          <View style={formStyles.petPickerTag}>
                            <Ionicons name="fitness-outline" size={11} color={theme.colors.primary} />
                            <Text style={formStyles.petPickerTagText}>{pet.weight} {pet.weightUnit || 'kg'}</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    {isSelected && (
                      <View style={formStyles.petPickerCheck}>
                        <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
      {error && <Text style={formStyles.errorText}>{error}</Text>}
    </View>
  );
}

const createFormStyles = (theme) => StyleSheet.create({
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputContainerMultiline: {
    alignItems: 'flex-start',
    paddingTop: theme.spacing.sm,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  inputWarning: {
    borderColor: theme.colors.warning || '#E8A317',
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  inputIconMultiline: {
    marginTop: Platform.OS === 'ios' ? 14 : 10,
  },
  input: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  multilineInput: {
    minHeight: 110,
    textAlignVertical: 'top',
    paddingBottom: 12,
  },
  // Date picker button styles
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52,
  },
  dateDisplayWrap: {
    flex: 1,
  },
  dateDisplayText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
  },
  dateRawText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: 1,
  },
  datePlaceholder: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.textLight,
  },
  dateActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginLeft: theme.spacing.sm,
  },
  dateModeSwitchBtn: {
    paddingLeft: theme.spacing.sm,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  warningText: {
    color: theme.colors.warning || '#E8A317',
  },
  hintText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  // Picker
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  pickerButtonCompact: {
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  pickerText: {
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  pickerPlaceholder: {
    color: theme.colors.textLight,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '60%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  modalScroll: {
    padding: theme.spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  optionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  optionText: {
    flex: 1,
    fontSize: theme.fontSize.lg,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  // Button
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.sm,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary,
  },
  buttonDanger: {
    backgroundColor: theme.colors.error,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFF',
  },
  buttonTextOutline: {
    color: theme.colors.primary,
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  sectionAction: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  // Chips
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 4,
  },
  chipSelected: {
    backgroundColor: `${theme.colors.primary}20`,
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  chipTextSelected: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  // Pet Picker styles
  petPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 52,
  },
  petPickerSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    flex: 1,
  },
  petPickerAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: theme.colors.primaryLight + '40',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petPickerAvatarImgSmall: {
    width: 32,
    height: 32,
    borderRadius: 10,
  },
  petPickerEmojiSmall: {
    fontSize: 18,
  },
  petPickerSelectedName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text,
  },
  petPickerGenderSmall: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
  },
  petPickerModalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl + 4,
    borderTopRightRadius: theme.borderRadius.xl + 4,
    maxHeight: '70%',
    paddingBottom: theme.spacing.xl,
  },
  petPickerModalHandle: {
    width: 40,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  petPickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  petPickerModalScroll: {
    padding: theme.spacing.md,
  },
  petPickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  petPickerCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '08',
  },
  petPickerAvatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  petPickerAvatarImg: {
    width: 56,
    height: 56,
    borderRadius: 18,
  },
  petPickerAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: theme.colors.primaryLight + '50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petPickerEmoji: {
    fontSize: 26,
  },
  petPickerGenderDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.inputBackground,
  },
  petPickerGenderDotText: {
    fontSize: 9,
    color: '#FFF',
    fontWeight: '700',
  },
  petPickerInfo: {
    flex: 1,
  },
  petPickerName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  petPickerNameSelected: {
    color: theme.colors.primary,
  },
  petPickerMeta: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  petPickerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: theme.colors.primary + '12',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.round,
  },
  petPickerTagText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.primaryDark || theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  petPickerCheck: {
    marginLeft: theme.spacing.sm,
  },
});
