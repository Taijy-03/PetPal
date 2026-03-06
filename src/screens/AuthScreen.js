import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '../firebase';

const auth = getAuth(app);

export default function AuthScreen({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess && onAuthSuccess();
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        Alert.alert('注册成功', '请使用新账号登录');
        setIsLogin(true);
      }
    } catch (e) {
      Alert.alert('错误', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isLogin ? '登录' : '注册'}</Text>
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title={isLogin ? '登录' : '注册'} onPress={handleAuth} disabled={loading} />
      <Text style={styles.switchText} onPress={() => setIsLogin(!isLogin)}>
        {isLogin ? '没有账号？点此注册' : '已有账号？点此登录'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  switchText: {
    marginTop: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
