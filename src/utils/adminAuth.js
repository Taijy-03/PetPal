import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const KEYS = {
  FAILED_ATTEMPTS: 'admin_failed_attempts',
  LOCKOUT_UNTIL: 'admin_lockout_until',
};

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate a random salt for password hashing
 */
const generateSalt = () => {
  return Crypto.getRandomValues(new Uint8Array(16))
    .reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '');
};

/**
 * Hash a password with a salt using SHA-256
 */
const hashPassword = async (password, salt) => {
  const combined = salt + password;
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
  return hash;
};

/**
 * Check if admin password has been set up
 */
export const isAdminPasswordSet = async () => {
  try {
    const adminDocRef = doc(db, 'settings', 'admin');
    const adminDocSnap = await getDoc(adminDocRef);
    if (adminDocSnap.exists()) {
      return !!adminDocSnap.data().passwordHash;
    }
    return false;
  } catch (error) {
    console.error('Error checking admin password:', error);
    return false;
  }
};

/**
 * Set up admin password (first time or reset)
 */
export const setAdminPassword = async (password) => {
  try {
    const salt = generateSalt();
    const hash = await hashPassword(password, salt);

    const adminDocRef = doc(db, 'settings', 'admin');
    await setDoc(adminDocRef, {
      passwordHash: hash,
      salt: salt,
    }, { merge: true });

    // Reset failed attempts on password change
    await SecureStore.deleteItemAsync(KEYS.FAILED_ATTEMPTS);
    await SecureStore.deleteItemAsync(KEYS.LOCKOUT_UNTIL);

    return { success: true };
  } catch (error) {
    console.error('Error setting admin password:', error);
    return { success: false, error: '密码设置失败，请重试' };
  }
};

/**
 * Get current lockout status
 */
export const getLockoutStatus = async () => {
  try {
    const lockoutUntil = await SecureStore.getItemAsync(KEYS.LOCKOUT_UNTIL);
    const failedAttemptsStr = await SecureStore.getItemAsync(KEYS.FAILED_ATTEMPTS);
    const failedAttempts = failedAttemptsStr ? parseInt(failedAttemptsStr, 10) : 0;

    if (lockoutUntil) {
      const lockoutTime = parseInt(lockoutUntil, 10);
      const now = Date.now();
      if (now < lockoutTime) {
        const remainingMs = lockoutTime - now;
        const remainingMin = Math.ceil(remainingMs / 60000);
        return {
          isLocked: true,
          remainingMinutes: remainingMin,
          failedAttempts,
        };
      } else {
        // Lockout expired, clear it
        await SecureStore.deleteItemAsync(KEYS.LOCKOUT_UNTIL);
        await SecureStore.deleteItemAsync(KEYS.FAILED_ATTEMPTS);
        return { isLocked: false, failedAttempts: 0 };
      }
    }

    return { isLocked: false, failedAttempts };
  } catch (error) {
    console.error('Error getting lockout status:', error);
    return { isLocked: false, failedAttempts: 0 };
  }
};

/**
 * Verify admin password with brute-force protection
 */
export const verifyAdminPassword = async (password) => {
  try {
    // Check lockout first
    const lockout = await getLockoutStatus();
    if (lockout.isLocked) {
      return {
        success: false,
        error: `账户已锁定，请 ${lockout.remainingMinutes} 分钟后再试`,
        isLocked: true,
      };
    }

    const adminDocRef = doc(db, 'settings', 'admin');
    const adminDocSnap = await getDoc(adminDocRef);

    if (!adminDocSnap.exists() || !adminDocSnap.data().passwordHash || !adminDocSnap.data().salt) {
      return { success: false, error: '管理员密码未设置' };
    }

    const storedHash = adminDocSnap.data().passwordHash;
    const salt = adminDocSnap.data().salt;

    const inputHash = await hashPassword(password, salt);

    if (inputHash === storedHash) {
      // Correct password — reset failed attempts
      await SecureStore.deleteItemAsync(KEYS.FAILED_ATTEMPTS);
      await SecureStore.deleteItemAsync(KEYS.LOCKOUT_UNTIL);
      return { success: true };
    } else {
      // Wrong password — increment failed attempts
      const newAttempts = lockout.failedAttempts + 1;
      await SecureStore.setItemAsync(KEYS.FAILED_ATTEMPTS, newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        // Trigger lockout
        const lockoutUntil = Date.now() + LOCKOUT_DURATION_MS;
        await SecureStore.setItemAsync(KEYS.LOCKOUT_UNTIL, lockoutUntil.toString());
        return {
          success: false,
          error: `密码错误次数过多，账户已锁定 5 分钟`,
          isLocked: true,
        };
      }

      const remaining = MAX_ATTEMPTS - newAttempts;
      return {
        success: false,
        error: `密码错误，还剩 ${remaining} 次尝试机会`,
        isLocked: false,
      };
    }
  } catch (error) {
    console.error('Error verifying admin password:', error);
    return { success: false, error: '验证失败，请重试' };
  }
};
