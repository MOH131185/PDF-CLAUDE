import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Button, Title, Paragraph, Surface } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AuthStackParamList } from '../../navigation/AuthNavigator';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <LinearGradient
      colors={['#e74c3c', '#c0392b']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Surface style={styles.logoCircle} elevation={8}>
            <Title style={styles.logo}>📄</Title>
          </Surface>
          <Title style={styles.appTitle}>PDF Tools</Title>
          <Paragraph style={styles.tagline}>
            Professional PDF processing on mobile
          </Paragraph>
        </View>

        <View style={styles.featuresContainer}>
          {features.map((feature, index) => (
            <View key={index} style={styles.feature}>
              <Title style={styles.featureIcon}>{feature.icon}</Title>
              <Paragraph style={styles.featureText}>{feature.text}</Paragraph>
            </View>
          ))}
        </View>

        <View style={styles.buttonsContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Register')}
            style={styles.primaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.primaryButtonText}
          >
            Get Started
          </Button>
          
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Login')}
            style={styles.secondaryButton}
            contentStyle={styles.buttonContent}
            labelStyle={styles.secondaryButtonText}
          >
            Sign In
          </Button>
        </View>

        <Paragraph style={styles.footer}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Paragraph>
      </View>
    </LinearGradient>
  );
}

const features = [
  { icon: '⚡', text: 'Lightning fast processing' },
  { icon: '🔒', text: 'Secure and private' },
  { icon: '📱', text: 'Works across all devices' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 48,
    margin: 0,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  featuresContainer: {
    marginVertical: 32,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
    width: 32,
    textAlign: 'center',
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
    flex: 1,
  },
  buttonsContainer: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 4,
  },
  buttonContent: {
    height: 56,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  secondaryButton: {
    borderColor: '#fff',
    borderWidth: 2,
    borderRadius: 12,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
});