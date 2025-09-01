import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Title, Paragraph, Button, Avatar, Divider, List, Surface } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { remainingOperations, isProUser, refreshUserData } = useApp();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleUpgrade = () => {
    Alert.alert(
      'Upgrade to Pro',
      'Get unlimited operations, priority support, and advanced features for just $19/month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Upgrade', onPress: () => console.log('Navigate to upgrade flow') },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Surface style={styles.profileHeader} elevation={2}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.charAt(0) || 'U'} 
          style={styles.avatar}
        />
        <Title style={styles.userName}>{user?.name || 'User'}</Title>
        <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
        
        {isProUser ? (
          <View style={styles.proBadge}>
            <Ionicons name="star" size={16} color="#ffc107" />
            <Paragraph style={styles.proText}>Pro User</Paragraph>
          </View>
        ) : (
          <Button
            mode="contained"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
            compact
          >
            Upgrade to Pro
          </Button>
        )}
      </Surface>

      {/* Usage Stats */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Usage Statistics</Title>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>
                {remainingOperations}
              </Title>
              <Paragraph style={styles.statLabel}>
                Operations Left
              </Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>0</Title>
              <Paragraph style={styles.statLabel}>Files Processed</Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Title style={styles.statNumber}>0 MB</Title>
              <Paragraph style={styles.statLabel}>Data Processed</Paragraph>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Account Information */}
      <Card style={styles.accountCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Information</Title>
          
          <List.Item
            title="Name"
            description={user?.name || 'Not set'}
            left={props => <List.Icon {...props} icon="account" />}
            onPress={() => console.log('Edit name')}
          />
          
          <Divider />
          
          <List.Item
            title="Email"
            description={user?.email}
            left={props => <List.Icon {...props} icon="email" />}
          />
          
          <Divider />
          
          <List.Item
            title="Member Since"
            description={user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
            left={props => <List.Icon {...props} icon="calendar" />}
          />
          
          <Divider />
          
          <List.Item
            title="Subscription"
            description={isProUser ? 'Pro Plan' : 'Free Plan'}
            left={props => <List.Icon {...props} icon="credit-card" />}
            onPress={() => console.log('Manage subscription')}
          />
        </Card.Content>
      </Card>

      {/* Settings */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Settings</Title>
          
          <List.Item
            title="Notifications"
            description="Manage your notification preferences"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Notification settings')}
          />
          
          <Divider />
          
          <List.Item
            title="Privacy"
            description="Review privacy settings"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Privacy settings')}
          />
          
          <Divider />
          
          <List.Item
            title="Help & Support"
            description="Get help and contact support"
            left={props => <List.Icon {...props} icon="help-circle" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('Help & support')}
          />
          
          <Divider />
          
          <List.Item
            title="About"
            description="App version and information"
            left={props => <List.Icon {...props} icon="information" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => console.log('About')}
          />
        </Card.Content>
      </Card>

      {/* Sign Out */}
      <View style={styles.signOutContainer}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          contentStyle={styles.signOutButtonContent}
          labelStyle={styles.signOutButtonText}
        >
          Sign Out
        </Button>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    margin: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
  },
  avatar: {
    backgroundColor: '#e74c3c',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  proText: {
    color: '#856404',
    fontWeight: 'bold',
    marginLeft: 4,
    fontSize: 12,
  },
  upgradeButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 20,
  },
  statsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  accountCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  settingsCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 2,
  },
  signOutContainer: {
    padding: 16,
    alignItems: 'center',
  },
  signOutButton: {
    borderColor: '#dc3545',
    borderWidth: 2,
    borderRadius: 12,
    minWidth: 200,
  },
  signOutButtonContent: {
    height: 48,
  },
  signOutButtonText: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
  bottomSpacer: {
    height: 32,
  },
});