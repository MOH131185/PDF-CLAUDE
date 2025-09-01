import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Title, Paragraph } from 'react-native-paper';

export default function SplitPDFScreen() {
  return (
    <View style={styles.container}>
      <Title>Split PDF</Title>
      <Paragraph>Split PDF tool implementation coming soon...</Paragraph>
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