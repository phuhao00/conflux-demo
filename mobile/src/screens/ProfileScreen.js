import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

const MOCK_TRANSACTIONS = [
  { id: '1', type: 'deposit', amount: '+$500.00', date: '2025-12-03', status: 'success' },
  { id: '2', type: 'investment', amount: '-$200.00', date: '2025-12-02', status: 'success' },
  { id: '3', type: 'yieldPayout', amount: '+$12.50', date: '2025-12-01', status: 'success' },
  { id: '4', type: 'withdrawal', amount: '-$50.00', date: '2025-11-28', status: 'success' },
  { id: '5', type: 'deposit', amount: '+$1000.00', date: '2025-11-25', status: 'success' },
];

const ProfileScreen = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
  };

  const renderTransaction = ({ item }) => {
    const isPositive = item.amount.startsWith('+');
    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View style={[styles.iconContainer, { backgroundColor: isPositive ? '#e6f7ff' : '#fff1f0' }]}>
            <Ionicons 
              name={isPositive ? 'arrow-down' : 'arrow-up'} 
              size={20} 
              color={isPositive ? '#1890ff' : '#f5222d'} 
            />
          </View>
          <View>
            <Text style={styles.transactionType}>{t(`profile.${item.type}`)}</Text>
            <Text style={styles.transactionDate}>{item.date}</Text>
          </View>
        </View>
        <Text style={[styles.transactionAmount, { color: isPositive ? '#d81e06' : '#333' }]}>
          {item.amount}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View>
              <Text style={styles.userName}>Farmer John</Text>
              <Text style={styles.userId}>ID: 8839201</Text>
            </View>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>{t('profile.totalBalance')}</Text>
          <Text style={styles.balanceValue}>$12,450.80</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="wallet-outline" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>{t('profile.recharge')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#fff" />
              <Text style={styles.actionBtnText}>{t('profile.transfer')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="card-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>{t('profile.bankCards')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>{t('profile.securityCenter')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={toggleLanguage}>
            <View style={styles.menuLeft}>
              <Ionicons name="language-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>{t('profile.language')}</Text>
            </View>
            <View style={styles.languageIndicator}>
              <Text style={styles.currentLang}>{i18n.language === 'zh' ? '中文' : 'English'}</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#d81e06" />
              <Text style={styles.menuText}>{t('profile.helpSupport')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.recentTransactions')}</Text>
        </View>
        <View style={styles.transactionList}>
          {MOCK_TRANSACTIONS.map(item => (
            <View key={item.id}>
              {renderTransaction({ item })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#d81e06',
    padding: 20,
    paddingBottom: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  userId: {
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  balanceCard: {
    marginHorizontal: 16,
    marginTop: -30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#d81e06',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  actionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  menuSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentLang: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  transactionList: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;
