import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Button, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../contexts/AppContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const tools = [
  {
    id: 'merge',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one',
    icon: '📄',
    screen: 'MergePDF' as keyof RootStackParamList,
  },
  {
    id: 'split',
    title: 'Split PDF',
    description: 'Extract pages from a PDF file',
    icon: '✂️',
    screen: 'SplitPDF' as keyof RootStackParamList,
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    description: 'Reduce PDF file size',
    icon: '🗜️',
    screen: 'CompressPDF' as keyof RootStackParamList,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useApp();

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.welcomeCard} elevation={2}>
        <Title style={styles.welcomeTitle}>
          Welcome back, {user?.name || 'User'}!
        </Title>
        <Paragraph style={styles.welcomeText}>
          Choose a PDF tool to get started
        </Paragraph>
      </Surface>

      <View style={styles.toolsGrid}>
        {tools.map((tool) => (
          <Card
            key={tool.id}
            style={styles.toolCard}
            onPress={() => navigation.navigate(tool.screen)}
          >
            <Card.Content>
              <View style={styles.toolHeader}>
                <View style={styles.iconContainer}>
                  <Title style={styles.icon}>{tool.icon}</Title>
                </View>
                <View style={styles.toolInfo}>
                  <Title style={styles.toolTitle}>{tool.title}</Title>
                  <Paragraph style={styles.toolDescription}>
                    {tool.description}
                  </Paragraph>
                </View>
              </View>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                onPress={() => navigation.navigate(tool.screen)}
                style={styles.toolButton}
              >
                Use Tool
              </Button>
            </Card.Actions>
          </Card>
        ))}
      </View>

      <Card style={styles.statsCard}>
        <Card.Content>
          <Title>Quick Stats</Title>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>0</Title>
              <Paragraph>Files Processed</Paragraph>
            </View>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>0 MB</Title>
              <Paragraph>Data Saved</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  welcomeCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  toolsGrid: {
    padding: 16,
    gap: 16,
  },
  toolCard: {
    borderRadius: 12,
    elevation: 3,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  icon: {
    fontSize: 24,
    margin: 0,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
  },
  toolButton: {
    backgroundColor: '#e74c3c',
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
});