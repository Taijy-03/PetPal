// Generate unique IDs without external dependency issues
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const TIMEZONE = 'Asia/Kuala_Lumpur';

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: TIMEZONE,
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  });
};

export const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return formatDate(dateString);
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return '未知';
  const now = new Date();
  const birth = new Date(birthDate);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    return `${years}岁${months > 0 ? `${months}个月` : ''}`;
  }
  return `${months}个月`;
};

export const getPetTypeIcon = (type) => {
  return '🐱';
};

const BREED_LABELS = {
  ragdoll: '布偶猫',
  british_shorthair: '英国短毛猫',
  american_shorthair: '美国短毛猫',
  persian: '波斯猫',
  siamese: '暇罗猫',
  maine_coon: '缅因猫',
  scottish_fold: '苏格兰折耳猫',
  russian_blue: '俄罗斯蓝猫',
  bombay: '孟买猫',
  bengal: '孟加拉豹猫',
  abyssinian: '阿比西尼亚猫',
  birman: '伯曼猫',
  burmese: '缅甸猫',
  sphynx: '加拿大无毛猫',
  exotic_shorthair: '异国短毛猫',
  american_curl: '美国卷毛猫',
  ragamuffin: '褴褴猫',
  devon_rex: '德文卷毛猫',
  cornish_rex: '柯尼斯卷毛猫',
  tonkinese: '东奇尼猫',
  american_bobtail: '美国短尾猫',
  japanese_bobtail: '日本短尾猫',
  egyptian_mau: '埃及猫',
  highland_fold: '高地折耳猫',
  chartreux: '法国蓝猫',
  norwegian_forest: '挪威森林猫',
  siberian: '西伯利亚猫',
  turkish_van: '土耳其梵猫',
  turkish_angora: '土耳其安哥拉猫',
  chinese_domestic: '中华田园猫',
  orange_tabby: '橘猫',
  calico: '三花猫',
  tuxedo: '奶牛猫',
  tabby: '狸花猫',
  white_cat: '白猫',
  black_cat: '黑猫',
  mixed: '混血猫',
  other: '其他',
};

export const getBreedLabel = (breed) => {
  if (!breed) return '猫咪';
  return BREED_LABELS[breed] || breed;
};

export const getActivityIcon = (type) => {
  const icons = {
    feed: '🐟',
    play: '🧶',
    groom: '🪮',
    sleep: '😴',
    litter: '🚽',
    vet: '🏥',
    medicine: '💊',
    cuddle: '🤗',
    other: '📝',
  };
  return icons[type?.toLowerCase()] || '📝';
};

export const getHealthIcon = (type) => {
  const icons = {
    vaccination: '💉',
    checkup: '🩺',
    medication: '💊',
    surgery: '🏥',
    dental: '🦷',
    allergy: '🤧',
    injury: '🩹',
    weight: '⚖️',
    deworming: '🐛',
    sterilization: '✂️',
    note: '📝',
  };
  return icons[type?.toLowerCase()] || '📝';
};

export const PET_TYPES = [
  { label: '猫咪', value: 'cat', icon: '🐱' },
];

export const ACTIVITY_TYPES = [
  { label: '喂食', value: 'feed', icon: '🐟' },
  { label: '玩耍', value: 'play', icon: '🧶' },
  { label: '梳毛', value: 'groom', icon: '🪮' },
  { label: '睡觉', value: 'sleep', icon: '😴' },
  { label: '铲屎', value: 'litter', icon: '🚽' },
  { label: '看医生', value: 'vet', icon: '🏥' },
  { label: '吃药', value: 'medicine', icon: '💊' },
  { label: '撸猫', value: 'cuddle', icon: '🤗' },
  { label: '其他', value: 'other', icon: '📝' },
];

export const HEALTH_RECORD_TYPES = [
  { label: '疫苗', value: 'vaccination', icon: '💉' },
  { label: '体检', value: 'checkup', icon: '🩺' },
  { label: '用药', value: 'medication', icon: '💊' },
  { label: '手术', value: 'surgery', icon: '🏥' },
  { label: '牙科', value: 'dental', icon: '🦷' },
  { label: '过敏', value: 'allergy', icon: '🤧' },
  { label: '受伤', value: 'injury', icon: '🩹' },
  { label: '体重', value: 'weight', icon: '⚖️' },
  { label: '驱虫', value: 'deworming', icon: '🐛' },
  { label: '绝育', value: 'sterilization', icon: '✂️' },
  { label: '备注', value: 'note', icon: '📝' },
];

export const REMINDER_FREQUENCIES = [
  { label: '一次', value: 'once' },
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每年', value: 'yearly' },
];
