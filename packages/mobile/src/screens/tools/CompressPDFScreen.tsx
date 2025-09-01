import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';

export default function CompressPDFScreen() {
  return (
    <View style={styles.container}>
      <Title>Compress PDF</Title>
      <Paragraph>Compress PDF tool implementation coming soon...</Paragraph>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});