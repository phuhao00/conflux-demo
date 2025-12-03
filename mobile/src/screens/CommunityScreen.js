import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const MOCK_POSTS = [
  { id: '1', user: 'FarmerJohn', avatar: 'https://via.placeholder.com/50', content: 'Just harvested my first batch of organic corn! The yield is looking great this year. #harvest #organic', time: '2h', likes: 24, comments: 5 },
  { id: '2', user: 'AgriTech_Sarah', avatar: 'https://via.placeholder.com/50', content: 'Has anyone tried the new drone spraying system? Thinking of investing in one for my orchard.', time: '4h', likes: 12, comments: 8 },
  { id: '3', user: 'GreenThumb', avatar: 'https://via.placeholder.com/50', content: 'Wheat prices are rallying! Good time to sell if you have stock.', time: '6h', likes: 45, comments: 12 },
  { id: '4', user: 'RuralLife', avatar: 'https://via.placeholder.com/50', content: 'Beautiful sunset over the fields today. Reminds me why I love farming.', time: '1d', likes: 89, comments: 3 },
  { id: '5', user: 'MarketWatcher', avatar: 'https://via.placeholder.com/50', content: 'Policy update: New subsidies available for irrigation systems. Check the news tab!', time: '1d', likes: 56, comments: 15 },
];

const CommunityScreen = () => {
  const { t } = useTranslation();

  const renderItem = ({ item }) => (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={40} color="#ccc" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.username}>{item.user}</Text>
          <Text style={styles.time}>{item.time} {t('community.ago')}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.content}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.likes}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="chatbubble-outline" size={20} color="#666" />
          <Text style={styles.actionText}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-social-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('community.title')}</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color="#d81e06" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_POSTS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingBottom: 16,
  },
  postContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  headerText: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  content: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
});

export default CommunityScreen;
