import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Surface, 
  ActivityIndicator,
  FAB,
  Snackbar 
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { Ionicons } from '@expo/vector-icons';

import { useApp } from '../../contexts/AppContext';
import { PDFProcessor, createPDFFileFromMobile, PDFFile } from '@pdf-tools/shared';

export default function MergePDFScreen() {
  const { remainingOperations, isProUser, api, isOnline } = useApp();
  const [selectedFiles, setSelectedFiles] = useState<PDFFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const pickFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const pdfFiles = result.assets
        .filter(asset => asset.type === 'application/pdf')
        .map(asset => createPDFFileFromMobile(asset.uri, asset.name, asset.size || 0));

      setSelectedFiles(prev => [...prev, ...pdfFiles]);
      setError('');
    } catch (err) {
      setError('Failed to select files. Please try again.');
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const clearFiles = () => {
    Alert.alert(
      'Clear Files',
      'Are you sure you want to remove all selected files?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => setSelectedFiles([]) },
      ]
    );
  };

  const mergePDFs = async () => {
    if (selectedFiles.length < 2) {
      setError('Please select at least 2 PDF files to merge');
      return;
    }

    if (!isOnline) {
      setError('Internet connection required for processing');
      return;
    }

    if (!isProUser && remainingOperations <= 0) {
      Alert.alert(
        'Operation Limit Reached',
        'You have reached your free operation limit. Upgrade to Pro for unlimited operations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upgrade', onPress: () => console.log('Navigate to upgrade') },
        ]
      );
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      // For demonstration, we'll use the local PDF processor
      // In production, you might want to use the API for server-side processing
      const result = await PDFProcessor.mergePDFs(selectedFiles);

      if (result.success && result.output) {
        // In a real app, you would save the file and potentially share it
        setSuccess(`Successfully merged ${selectedFiles.length} files into one PDF!`);
        setSelectedFiles([]);
        
        // Here you would typically:
        // 1. Save the merged PDF to device storage
        // 2. Offer sharing options
        // 3. Update user's operation count
        
      } else {
        setError(result.error || 'Failed to merge PDFs');
      }
    } catch (err) {
      setError('An unexpected error occurred during processing');
      console.error('Merge error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <Surface style={styles.headerCard} elevation={2}>
          <View style={styles.headerContent}>
            <Title style={styles.headerIcon}>📄</Title>
            <View style={styles.headerText}>
              <Title style={styles.headerTitle}>Merge PDFs</Title>
              <Paragraph style={styles.headerSubtitle}>
                Combine multiple PDF files into a single document
              </Paragraph>
            </View>
          </View>
        </Surface>

        {/* Usage Info */}
        {!isProUser && (
          <Card style={styles.usageCard}>
            <Card.Content>
              <View style={styles.usageInfo}>
                <Ionicons name="information-circle" size={20} color="#ffc107" />
                <Paragraph style={styles.usageText}>
                  {remainingOperations} free operations remaining
                </Paragraph>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* File Selection */}
        <Card style={styles.filesCard}>
          <Card.Content>
            <View style={styles.filesHeader}>
              <Title style={styles.sectionTitle}>Selected Files</Title>
              {selectedFiles.length > 0 && (
                <Button mode="text" onPress={clearFiles} compact>
                  Clear All
                </Button>
              )}
            </View>

            {selectedFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="document-outline" size={48} color="#ccc" />
                <Paragraph style={styles.emptyText}>
                  No PDF files selected
                </Paragraph>
                <Paragraph style={styles.emptySubtext}>
                  Tap the + button to add PDF files
                </Paragraph>
              </View>
            ) : (
              <View style={styles.filesList}>
                {selectedFiles.map((file, index) => (
                  <Surface key={file.id} style={styles.fileItem} elevation={1}>
                    <View style={styles.fileInfo}>
                      <View style={styles.fileIcon}>
                        <Ionicons name="document" size={20} color="#e74c3c" />
                      </View>
                      <View style={styles.fileDetails}>
                        <Paragraph style={styles.fileName} numberOfLines={1}>
                          {index + 1}. {file.name}
                        </Paragraph>
                        <Paragraph style={styles.fileSize}>
                          {formatFileSize(file.size)}
                        </Paragraph>
                      </View>
                      <Button
                        mode="text"
                        onPress={() => removeFile(file.id)}
                        compact
                      >
                        <Ionicons name="close" size={16} color="#dc3545" />
                      </Button>
                    </View>
                  </Surface>
                ))}
              </View>
            )}
          </Card.Content>
        </Card>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Card.Content>
            <Title style={styles.sectionTitle}>How to Use</Title>
            <View style={styles.instructions}>
              <View style={styles.instructionItem}>
                <Title style={styles.instructionNumber}>1</Title>
                <Paragraph style={styles.instructionText}>
                  Select 2 or more PDF files using the + button
                </Paragraph>
              </View>
              <View style={styles.instructionItem}>
                <Title style={styles.instructionNumber}>2</Title>
                <Paragraph style={styles.instructionText}>
                  Files will be merged in the order shown
                </Paragraph>
              </View>
              <View style={styles.instructionItem}>
                <Title style={styles.instructionNumber}>3</Title>
                <Paragraph style={styles.instructionText}>
                  Tap "Merge PDFs" to combine them into one file
                </Paragraph>
              </View>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Action Button */}
      {selectedFiles.length >= 2 && (
        <Surface style={styles.actionButtonContainer} elevation={4}>
          <Button
            mode="contained"
            onPress={mergePDFs}
            loading={processing}
            disabled={processing || !isOnline}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
          >
            {processing ? 'Merging PDFs...' : `Merge ${selectedFiles.length} PDFs`}
          </Button>
        </Surface>
      )}

      {/* FAB for adding files */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={pickFiles}
        disabled={processing}
      />

      {/* Loading Overlay */}
      {processing && (
        <View style={styles.loadingOverlay}>
          <Surface style={styles.loadingCard} elevation={8}>
            <ActivityIndicator size="large" color="#e74c3c" />
            <Paragraph style={styles.loadingText}>
              Processing your PDFs...
            </Paragraph>
          </Surface>
        </View>
      )}

      {/* Snackbars */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess('')}
        duration={4000}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </View>
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
  headerCard: {
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#e74c3c',
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 32,
    marginRight: 16,
    color: '#fff',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  usageCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  usageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  usageText: {
    marginLeft: 8,
    color: '#856404',
  },
  filesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  filesList: {
    gap: 8,
  },
  fileItem: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIcon: {
    marginRight: 12,
  },
  fileDetails: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  instructionsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  instructions: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e74c3c',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 32,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    paddingTop: 6,
  },
  actionButtonContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  actionButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 12,
  },
  actionButtonContent: {
    height: 48,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: '#e74c3c',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingCard: {
    padding: 32,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginHorizontal: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  bottomSpacer: {
    height: 100,
  },
  errorSnackbar: {
    backgroundColor: '#dc3545',
  },
  successSnackbar: {
    backgroundColor: '#28a745',
  },
});