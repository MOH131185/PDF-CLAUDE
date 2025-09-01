import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Button, Surface, Chip, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../contexts/AppContext';
import { Operation } from '@pdf-tools/shared';

export default function HistoryScreen() {
  const { api, isOnline } = useApp();
  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    if (!isOnline) {
      setLoading(false);
      return;
    }

    try {
      const result = await api.operations.getOperations(20);
      if (result.success) {
        setOperations(result.data);
      }
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOperations();
    setRefreshing(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'merge':
        return '📄';
      case 'split':
        return '✂️';
      case 'compress':
        return '🗜️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#28a745';
      case 'processing':
        return '#ffc107';
      case 'failed':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e74c3c" />
        <Paragraph style={styles.loadingText}>Loading history...</Paragraph>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="wifi-outline" size={64} color="#ccc" />
        <Title style={styles.emptyTitle}>No Internet Connection</Title>
        <Paragraph style={styles.emptyText}>
          Please check your internet connection to view your operation history.
        </Paragraph>
      </View>
    );
  }

  if (operations.length === 0) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.emptyContainer}>
          <Ionicons name="time-outline" size={64} color="#ccc" />
          <Title style={styles.emptyTitle}>No Operations Yet</Title>
          <Paragraph style={styles.emptyText}>
            Your PDF processing history will appear here once you start using the tools.
          </Paragraph>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Surface style={styles.headerCard} elevation={1}>
        <Title style={styles.headerTitle}>Processing History</Title>
        <Paragraph style={styles.headerSubtitle}>
          {operations.length} operations
        </Paragraph>
      </Surface>

      <View style={styles.operationsContainer}>
        {operations.map((operation) => (
          <Card key={operation.id} style={styles.operationCard}>
            <Card.Content>
              <View style={styles.operationHeader}>
                <View style={styles.operationInfo}>
                  <View style={styles.operationTitle}>
                    <Title style={styles.operationIcon}>
                      {getOperationIcon(operation.type)}
                    </Title>
                    <Title style={styles.operationName}>
                      {operation.type.charAt(0).toUpperCase() + operation.type.slice(1)} PDF
                    </Title>
                  </View>
                  <Chip
                    mode="outlined"
                    textStyle={{ color: getStatusColor(operation.status), fontSize: 12 }}
                    style={{ 
                      borderColor: getStatusColor(operation.status),
                      backgroundColor: 'transparent',
                    }}
                  >
                    {operation.status}
                  </Chip>
                </View>
                
                <Paragraph style={styles.operationDate}>
                  {new Date(operation.createdAt).toLocaleDateString()}
                </Paragraph>
              </View>

              <View style={styles.operationDetails}>
                <View style={styles.detailRow}>
                  <Paragraph style={styles.detailLabel}>Files:</Paragraph>
                  <Paragraph style={styles.detailValue}>
                    {operation.inputFiles?.length || 1}
                  </Paragraph>
                </View>
                
                {operation.originalSize && (
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Original Size:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {formatFileSize(operation.originalSize)}
                    </Paragraph>
                  </View>
                )}
                
                {operation.outputSize && (
                  <View style={styles.detailRow}>
                    <Paragraph style={styles.detailLabel}>Output Size:</Paragraph>
                    <Paragraph style={styles.detailValue}>
                      {formatFileSize(operation.outputSize)}
                    </Paragraph>
                  </View>
                )}
              </View>

              {operation.status === 'completed' && operation.downloadUrl && (
                <Card.Actions>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      // Handle download - would need platform-specific implementation
                      console.log('Download:', operation.downloadUrl);
                    }}
                    style={styles.downloadButton}
                  >
                    Download
                  </Button>
                </Card.Actions>
              )}
            </Card.Content>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  operationsContainer: {
    padding: 16,
    gap: 12,
  },
  operationCard: {
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#fff',
  },
  operationHeader: {
    marginBottom: 16,
  },
  operationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  operationTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  operationIcon: {
    fontSize: 20,
    marginRight: 8,
    margin: 0,
  },
  operationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  operationDate: {
    fontSize: 12,
    color: '#999',
  },
  operationDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
  },
  downloadButton: {
    borderColor: '#e74c3c',
  },
});