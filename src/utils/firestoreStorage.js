import { db, storage } from '../firebase';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import * as ImageManipulator from 'expo-image-manipulator';

export const uploadImageAsync = async (uri) => {
  if (!uri || !uri.startsWith('file://')) return uri;

  try {
    // 压缩图片并转为 base64，直接存入 Firestore 规避 Firebase Storage 问题
    const manipResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500 } }], // 限制为500px防止base64过大拖慢Firestore
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG, base64: true }
    );
        
    if (manipResult.base64) {
      // 加上 Data URI 前缀，以便可以作为 Image组件 的 source={{uri: ...}} 直接显示
      return `data:image/jpeg;base64,${manipResult.base64}`;
    }
    
    return uri;
  } catch (error) {
    console.error('Error generating base64 image: ', error);
    return uri;
  }
};

// PETS
export const getPets = async () => {
  const snapshot = await getDocs(collection(db, 'pets'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addPet = async (pet) => {
  if (pet.photo) {
    pet.photo = await uploadImageAsync(pet.photo);
  }
  const docRef = await addDoc(collection(db, 'pets'), pet);
  return docRef.id;
};

export const updatePet = async (updatedPet) => {
  const { id, ...data } = updatedPet;
  if (data.photo) {
    data.photo = await uploadImageAsync(data.photo);
  }
  if (data.photos && Array.isArray(data.photos)) {
    data.photos = await Promise.all(
      data.photos.map(async (p) => {
        if (p.uri && p.uri.startsWith('file://')) {
          const newUri = await uploadImageAsync(p.uri);
          return { ...p, uri: newUri };
        }
        return p;
      })
    );
  }
  await setDoc(doc(db, 'pets', id), data, { merge: true });
  return true;
};

export const deletePet = async (petId) => {
  await deleteDoc(doc(db, 'pets', petId));
  // 级联删除相关记录
  const healthRecords = await getHealthRecordsByPet(petId);
  for (const r of healthRecords) await deleteHealthRecord(r.id);
  const activities = await getActivitiesByPet(petId);
  for (const a of activities) await deleteActivity(a.id);
  const reminders = await getRemindersByPet(petId);
  for (const r of reminders) await deleteReminder(r.id);
  
  // 删除以该猫咪为 Root 的家族命名记录
  const families = await getFamilies();
  const orphanedFamilies = families.filter(f => f.rootPetId === petId);
  for (const f of orphanedFamilies) await deleteFamily(f.id);

  return true;
};

// HEALTH RECORDS
export const getHealthRecords = async () => {
  const snapshot = await getDocs(collection(db, 'health_records'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addHealthRecord = async (record) => {
  const docRef = await addDoc(collection(db, 'health_records'), record);
  return docRef.id;
};

export const updateHealthRecord = async (updatedRecord) => {
  const { id, ...data } = updatedRecord;
  await setDoc(doc(db, 'health_records', id), data, { merge: true });
  return true;
};

export const deleteHealthRecord = async (recordId) => {
  await deleteDoc(doc(db, 'health_records', recordId));
  return true;
};

export const getHealthRecordsByPet = async (petId) => {
  const q = query(collection(db, 'health_records'), where('petId', '==', petId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// ACTIVITIES
export const getActivities = async () => {
  const snapshot = await getDocs(collection(db, 'activities'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addActivity = async (activity) => {
  const docRef = await addDoc(collection(db, 'activities'), activity);
  return docRef.id;
};

export const updateActivity = async (updatedActivity) => {
  const { id, ...data } = updatedActivity;
  await setDoc(doc(db, 'activities', id), data, { merge: true });
  return true;
};

export const deleteActivity = async (activityId) => {
  await deleteDoc(doc(db, 'activities', activityId));
  return true;
};

export const getActivitiesByPet = async (petId) => {
  const q = query(collection(db, 'activities'), where('petId', '==', petId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// REMINDERS
export const getReminders = async () => {
  const snapshot = await getDocs(collection(db, 'reminders'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addReminder = async (reminder) => {
  const docRef = await addDoc(collection(db, 'reminders'), reminder);
  return docRef.id;
};

export const updateReminder = async (updatedReminder) => {
  const { id, ...data } = updatedReminder;
  await setDoc(doc(db, 'reminders', id), data, { merge: true });
  return true;
};

export const deleteReminder = async (reminderId) => {
  await deleteDoc(doc(db, 'reminders', reminderId));
  return true;
};

export const getRemindersByPet = async (petId) => {
  const q = query(collection(db, 'reminders'), where('petId', '==', petId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

// FAMILIES
export const getFamilies = async () => {
  const snapshot = await getDocs(collection(db, 'families'));
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
};

export const addFamily = async (family) => {
  const docRef = await addDoc(collection(db, 'families'), family);
  return docRef.id;
};

export const updateFamily = async (updatedFamily) => {
  const { id, ...data } = updatedFamily;
  await setDoc(doc(db, 'families', id), data, { merge: true });
  return true;
};

export const deleteFamily = async (familyId) => {
  await deleteDoc(doc(db, 'families', familyId));
  return true;
};

// SETTINGS（全局设置，只有一份，存为单文档）
export const getSettings = async () => {
  const docRef = doc(db, 'settings', 'global');
  const snapshot = await getDocs(collection(db, 'settings'));
  if (!snapshot.empty) {
    const docSnap = snapshot.docs[0];
    return { ...docSnap.data(), id: docSnap.id };
  }
  return {
    darkMode: false,
    notificationsEnabled: true,
    defaultPetType: 'cat',
  };
};

export const saveSettings = async (settings) => {
  await setDoc(doc(db, 'settings', 'global'), settings, { merge: true });
  return true;
};

// 清理和清空功能可根据 Firestore 规则实现，如需代码实现可补充

// 兼容 AppContext 旧调用，防止报错
export const cleanOldRecords = async () => true;

// Clear all data: delete all documents in main collections and reset global settings
export const clearAllData = async () => {
  try {
    const collections = ['pets', 'health_records', 'activities', 'reminders', 'families'];
    for (const col of collections) {
      const snapshot = await getDocs(collection(db, col));
      const deletes = snapshot.docs.map((d) => deleteDoc(doc(db, col, d.id)));
      await Promise.all(deletes);
    }

    // Reset settings to defaults
    const defaults = {
      darkMode: false,
      notificationsEnabled: true,
      defaultPetType: 'cat',
    };
    await setDoc(doc(db, 'settings', 'global'), defaults, { merge: true });

    return true;
  } catch (error) {
    console.error('Error clearing Firestore data:', error);
    return false;
  }
};
