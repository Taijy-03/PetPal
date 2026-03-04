// Generate unique IDs without external dependency issues
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(dateString);
};

export const calculateAge = (birthDate) => {
  if (!birthDate) return 'Unknown';
  const now = new Date();
  const birth = new Date(birthDate);
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  
  if (months < 0) {
    years--;
    months += 12;
  }
  
  if (years > 0) {
    return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months}mo` : ''}`;
  }
  return `${months} month${months !== 1 ? 's' : ''}`;
};

export const getPetTypeIcon = (type) => {
  const icons = {
    dog: '🐕',
    cat: '🐈',
    bird: '🐦',
    fish: '🐟',
    rabbit: '🐇',
    hamster: '🐹',
    turtle: '🐢',
    snake: '🐍',
    other: '🐾',
  };
  return icons[type?.toLowerCase()] || '🐾';
};

export const getActivityIcon = (type) => {
  const icons = {
    walk: '🚶',
    feed: '🍖',
    groom: '✂️',
    play: '🎾',
    train: '🎓',
    bath: '🛁',
    sleep: '😴',
    vet: '🏥',
    medicine: '💊',
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
    note: '📝',
  };
  return icons[type?.toLowerCase()] || '📝';
};

export const PET_TYPES = [
  { label: 'Dog', value: 'dog', icon: '🐕' },
  { label: 'Cat', value: 'cat', icon: '🐈' },
  { label: 'Bird', value: 'bird', icon: '🐦' },
  { label: 'Fish', value: 'fish', icon: '🐟' },
  { label: 'Rabbit', value: 'rabbit', icon: '🐇' },
  { label: 'Hamster', value: 'hamster', icon: '🐹' },
  { label: 'Turtle', value: 'turtle', icon: '🐢' },
  { label: 'Snake', value: 'snake', icon: '🐍' },
  { label: 'Other', value: 'other', icon: '🐾' },
];

export const ACTIVITY_TYPES = [
  { label: 'Walk', value: 'walk', icon: '🚶' },
  { label: 'Feed', value: 'feed', icon: '🍖' },
  { label: 'Groom', value: 'groom', icon: '✂️' },
  { label: 'Play', value: 'play', icon: '🎾' },
  { label: 'Training', value: 'train', icon: '🎓' },
  { label: 'Bath', value: 'bath', icon: '🛁' },
  { label: 'Sleep', value: 'sleep', icon: '😴' },
  { label: 'Vet Visit', value: 'vet', icon: '🏥' },
  { label: 'Medicine', value: 'medicine', icon: '💊' },
  { label: 'Other', value: 'other', icon: '📝' },
];

export const HEALTH_RECORD_TYPES = [
  { label: 'Vaccination', value: 'vaccination', icon: '💉' },
  { label: 'Checkup', value: 'checkup', icon: '🩺' },
  { label: 'Medication', value: 'medication', icon: '💊' },
  { label: 'Surgery', value: 'surgery', icon: '🏥' },
  { label: 'Dental', value: 'dental', icon: '🦷' },
  { label: 'Allergy', value: 'allergy', icon: '🤧' },
  { label: 'Injury', value: 'injury', icon: '🩹' },
  { label: 'Weight Check', value: 'weight', icon: '⚖️' },
  { label: 'Note', value: 'note', icon: '📝' },
];

export const REMINDER_FREQUENCIES = [
  { label: 'Once', value: 'once' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
];
