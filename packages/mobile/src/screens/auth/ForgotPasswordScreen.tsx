import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Title, Paragraph, Snackbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function ForgotPasswordScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleResetPassword = async () => {
    if (!email.trim() || !isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const result = await resetPassword(email.trim());
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Title style={styles.title}>Reset Password</Title>
          <Paragraph style={styles.subtitle}>
            Enter your email address and we'll send you a link to reset your password.
          </Paragraph>
        </View>

        {success ? (
          <View style={styles.successContainer}>
            <Title style={styles.successIcon}>✅</Title>
            <Title style={styles.successTitle}>Check Your Email</Title>
            <Paragraph style={styles.successText}>
              We've sent a password reset link to {email}. Please check your email and follow the instructions to reset your password.
            </Paragraph>
            <Paragraph style={styles.successNote}>
              Don't see the email? Check your spam folder or try again with a different email address.
            </Paragraph>
            
            <Button
              mode="contained"
              onPress={handleBackToLogin}
              style={styles.backButton}
              contentStyle={styles.buttonContent}
            >
              Back to Sign In
            </Button>
            
            <Button
              mode="text"
              onPress={() => {
                setSuccess(false);
                setEmail('');
              }}
              style={styles.tryAgainButton}
            >
              Try Different Email
            </Button>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={styles.input}
              error={email.length > 0 && !isValidEmail(email)}
              disabled={loading}
              left={<TextInput.Icon icon="email" />}
            />

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              disabled={loading || !email.trim() || !isValidEmail(email)}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
            >
              Send Reset Link
            </Button>

            <Button
              mode="text"
              onPress={handleBackToLogin}
              disabled={loading}
              style={styles.backToLoginButton}
            >
              Back to Sign In
            </Button>
          </View>
        )}
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.snackbar}
      >
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    minHeight: '100%',
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    alignItems: 'stretch',
  },
  input: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  resetButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    marginBottom: 16,
  },
  buttonContent: {
    height: 48,
  },
  backToLoginButton: {
    marginTop: 8,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  successNote: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    fontStyle: 'italic',
  },
  backButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    marginBottom: 16,
    minWidth: 200,
  },
  tryAgainButton: {
    marginTop: 8,
  },
  snackbar: {
    backgroundColor: '#dc3545',
  },
});