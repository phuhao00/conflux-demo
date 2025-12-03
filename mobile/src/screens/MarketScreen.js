import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const MOCK_MARKET_DATA = [
  { id: '1', name: 'Wheat (Soft Red)', price: '235.50', change: '+2.45', changePercent: '+1.05%', icon: 'barley' },
  { id: '2', name: 'Corn (Yellow)', price: '188.20', change: '-1.10', changePercent: '-0.58%', icon: 'corn' },
  { id: '3', name: 'Soybeans', price: '450.00', change: '+5.75', changePercent: '+1.29%', icon: 'soy-sauce' },
  { id: '4', name: 'Rice (Rough)', price: '16.40', change: '+0.05', changePercent: '+0.31%', icon: 'rice' },
  { id: '5', name: 'Cotton', price: '82.15', change: '-0.45', changePercent: '-0.54%', icon: 'flower' },
  { id: '6', name: 'Coffee (Arabica)', price: '195.30', change: '+3.20', changePercent: '+1.67%', icon: 'coffee' },
  { id: '7', name: 'Sugar (Raw)', price: '22.40', change: '-0.15', changePercent: '-0.67%', icon: 'cube-outline' },
];

const MarketScreen = () => {
  const { t } = useTranslation();

  const getIcon = (iconName) => {
    const iconProps = { size: 32, color: '#666' };
    return <MaterialCommunityIcons name={iconName} {...iconProps} />;
  };

  const renderItem = ({ item }) => {
    const isPositive = item.change.startsWith('+');
    const color = isPositive ? '#d81e06' : '#19be6b'; // Red for up, Green for down

    return (
      <TouchableOpacity style={styles.row}>
        <View style={styles.nameCol}>
          <View style={styles.iconContainer}>
            {getIcon(item.icon)}
          </View>
          <View>
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.subText}>Spot Price</Text>
          </View>
        </View>
        <View style={styles.priceCol}>
          <Text style={[styles.priceText, { color }]}>${item.price}</Text>
          <Text style={styles.changeText}>{item.change}</Text>
        </View>
        <View style={styles.changeCol}>
          <View style={[styles.changeBadge, { backgroundColor: color }]}>
            <Ionicons 
              name={isPositive ? 'trending-up' : 'trending-down'} 
              size={14} 
              color="#fff" 
              style={styles.trendIcon}
            />
            <Text style={styles.changePercentText}>{item.changePercent}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t('market.title')}</Text>
          <Text style={styles.headerSubtitle}>Real-time Commodity Prices</Text>
        </View>
        <TouchableOpacity style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color="#d81e06" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.marketSummary}>
        <View style={styles.summaryItem}>
          <Ionicons name="arrow-up" size={20} color="#d81e06" />
          <Text style={styles.summaryValue}>4</Text>
          <Text style={styles.summaryLabel}>Rising</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="arrow-down" size={20} color="#19be6b" />
          <Text style={styles.summaryValue}>3</Text>
          <Text style={styles.summaryLabel}>Falling</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Ionicons name="time" size={20} color="#999" />
          <Text style={styles.summaryValue}>Live</Text>
          <Text style={styles.summaryLabel}>Updated</Text>
        </View>
      </View>

      <View style={styles.columnHeaders}>
        <Text style={[styles.headerText, styles.nameCol]}>{t('market.product')}</Text>
        <Text style={[styles.headerText, styles.priceCol]}>{t('market.price')}</Text>
        <Text style={[styles.headerText, styles.changeCol]}>{t('market.change')}</Text>
      </View>
      <FlatList
        data={MOCK_MARKET_DATA}
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
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  refreshButton: {
    padding: 8,
  },
  marketSummary: {
    flexDirection: 'row',
    backgroundColor: '#f8f8f8',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  columnHeaders: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fafafa',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    alignItems: 'center',
  },
  nameCol: {
    flex: 2.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  priceCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  changeCol: {
    flex: 1.5,
    alignItems: 'flex-end',
  },
  nameText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  subText: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  priceText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeText: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  changeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  trendIcon: {
    marginRight: 4,
  },
  changePercentText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
});

export default MarketScreen;
