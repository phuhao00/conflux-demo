import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_PRODUCTS = [
  { id: '1', name: 'Organic Apple Orchard Share', yield: '8.5%', price: '$500', duration: '12 Months', risk: 'low', icon: 'nutrition' },
  { id: '2', name: 'Sustainable Wheat Farm Bond', yield: '6.2%', price: '$100', duration: '6 Months', risk: 'low', icon: 'barley' },
  { id: '3', name: 'High-Tech Greenhouse Fund', yield: '12.4%', price: '$1000', duration: '24 Months', risk: 'medium', icon: 'greenhouse' },
  { id: '4', name: 'Dairy Farm Expansion Token', yield: '9.1%', price: '$250', duration: '18 Months', risk: 'low', icon: 'cow' },
  { id: '5', name: 'Vertical Farming Venture', yield: '15.0%', price: '$2000', duration: '36 Months', risk: 'high', icon: 'sprout' },
];

const ProductScreen = () => {
  const { t } = useTranslation();

  const getIconComponent = (iconName) => {
    const iconProps = { size: 48, color: '#d81e06' };
    switch (iconName) {
      case 'nutrition':
        return <Ionicons name="nutrition" {...iconProps} />;
      case 'barley':
        return <MaterialCommunityIcons name="barley" {...iconProps} />;
      case 'greenhouse':
        return <MaterialCommunityIcons name="greenhouse" {...iconProps} />;
      case 'cow':
        return <MaterialCommunityIcons name="cow" {...iconProps} />;
      case 'sprout':
        return <MaterialCommunityIcons name="sprout" {...iconProps} />;
      default:
        return <Ionicons name="leaf" {...iconProps} />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return '#52c41a';
      case 'medium':
        return '#faad14';
      case 'high':
        return '#f5222d';
      default:
        return '#1890ff';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard}>
      <View style={styles.cardTop}>
        <View style={styles.iconContainer}>
          {getIconComponent(item.icon)}
        </View>
        <View style={[styles.riskBadge, { backgroundColor: getRiskColor(item.risk) + '20' }]}>
          <Text style={[styles.riskText, { color: getRiskColor(item.risk) }]}>
            {t(`product.${item.risk}`)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.productName}>{item.name}</Text>
      
      <View style={styles.cardBody}>
        <View style={styles.infoItem}>
          <Ionicons name="trending-up" size={20} color="#d81e06" />
          <Text style={styles.yieldValue}>{item.yield}</Text>
          <Text style={styles.infoLabel}>{t('product.expectedYield')}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={20} color="#666" />
          <Text style={styles.infoValue}>{item.duration}</Text>
          <Text style={styles.infoLabel}>{t('product.duration')}</Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="wallet-outline" size={20} color="#666" />
          <Text style={styles.priceValue}>{item.price}</Text>
          <Text style={styles.infoLabel}>{t('product.minInvest')}</Text>
        </View>
      </View>
      
      <TouchableOpacity style={styles.investButton}>
        <Ionicons name="arrow-forward-circle" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.investButtonText}>{t('product.investNow')}</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('product.title')}</Text>
          <Text style={styles.headerSubtitle}>Real World Assets</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color="#d81e06" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={MOCK_PRODUCTS}
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
  headerSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  filterButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  yieldValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d81e06',
    marginTop: 4,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
    marginBottom: 2,
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
  investButton: {
    backgroundColor: '#d81e06',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  investButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductScreen;
