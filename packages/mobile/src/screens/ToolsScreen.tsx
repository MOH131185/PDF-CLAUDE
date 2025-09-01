import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Title, Paragraph, Chip, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const toolCategories = [
  {
    title: 'PDF Operations',
    tools: [
      {
        id: 'merge',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF files into a single document',
        icon: '📄',
        screen: 'MergePDF' as keyof RootStackParamList,
        popular: true,
      },
      {
        id: 'split',
        title: 'Split PDF',
        description: 'Extract specific pages or split into multiple files',
        icon: '✂️',
        screen: 'SplitPDF' as keyof RootStackParamList,
        popular: true,
      },
      {
        id: 'compress',
        title: 'Compress PDF',
        description: 'Reduce file size while maintaining quality',
        icon: '🗜️',
        screen: 'CompressPDF' as keyof RootStackParamList,
        popular: false,
      },
    ],
  },
];

export default function ToolsScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleToolPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.headerCard} elevation={1}>
        <Title style={styles.headerTitle}>PDF Tools</Title>
        <Paragraph style={styles.headerSubtitle}>
          Professional PDF processing tools at your fingertips
        </Paragraph>
      </Surface>

      {toolCategories.map((category) => (
        <View key={category.title} style={styles.categorySection}>
          <Title style={styles.categoryTitle}>{category.title}</Title>
          
          <View style={styles.toolsGrid}>
            {category.tools.map((tool) => (
              <Card
                key={tool.id}
                style={styles.toolCard}
                onPress={() => handleToolPress(tool.screen)}
              >
                <Card.Content>
                  <View style={styles.toolHeader}>
                    <View style={styles.iconContainer}>
                      <Title style={styles.icon}>{tool.icon}</Title>
                    </View>
                    <View style={styles.toolBadges}>
                      {tool.popular && (
                        <Chip 
                          mode="outlined" 
                          compact 
                          style={styles.popularBadge}
                          textStyle={styles.badgeText}
                        >
                          Popular
                        </Chip>
                      )}
                    </View>
                  </View>
                  
                  <Title style={styles.toolTitle}>{tool.title}</Title>
                  <Paragraph style={styles.toolDescription}>
                    {tool.description}
                  </Paragraph>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      ))}

      <Card style={styles.upgradeCard}>
        <Card.Content>
          <View style={styles.upgradeContent}>
            <Title style={styles.upgradeTitle}>Need More Features?</Title>
            <Paragraph style={styles.upgradeText}>
              Upgrade to Pro for unlimited processing, batch operations, and priority support.
            </Paragraph>
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
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginLeft: 16,
    marginBottom: 16,
  },
  toolsGrid: {
    paddingHorizontal: 16,
    gap: 12,
  },
  toolCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    margin: 0,
  },
  toolBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  popularBadge: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffc107',
  },
  badgeText: {
    fontSize: 12,
    color: '#856404',
  },
  toolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  toolDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  upgradeCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#e74c3c',
  },
  upgradeContent: {
    alignItems: 'center',
    padding: 8,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  upgradeText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.9,
  },
});