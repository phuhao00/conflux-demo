
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { apiClient } from '../api/client';
import { DEMO_ADDRESS } from '../utils/constants';

const ProductScreen = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/products');
      if (res.ok && res.data) {
        setProducts(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    const iconProps = { size: 48, color: '#d81e06' };
    switch (iconName) {
      case 'musical-notes':
        return <Ionicons name="musical-notes" {...iconProps} />;
      case 'color-palette':
        return <Ionicons name="color-palette" {...iconProps} />;
      case 'cube':
        return <Ionicons name="cube" {...iconProps} />;
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
        return <Ionicons name="cube-outline" {...iconProps} />;
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

  const [showInvest, setShowInvest] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [investAmount, setInvestAmount] = useState('1');

  const handleInvestPress = (product) => {
    setSelectedProduct(product);
    setShowInvest(true);
  };

  const handleInvestConfirm = async () => {
    if (!selectedProduct) return;
    setLoading(true);
    try {
      // Generate a random Token ID for demo purposes
      const tokenId = Math.floor(Date.now() / 1000);
      const txHash = '0x' + Math.random().toString(16).substr(2, 64); // Mock tx hash

      // Parse investment amount
      const amount = parseFloat(investAmount) || 1;
      const totalAmount = amount * parseFloat(selectedProduct.price.replace(/[^0-9.]/g, ''));

      // Record investment in database
      const res = await apiClient.post('/invest', {
        wallet_address: DEMO_ADDRESS,
        product_id: selectedProduct.id,
        investment_amount: totalAmount,
        token_id: tokenId.toString(),
        nft_address: '', // Will be filled by backend if needed
        tx_hash: txHash
      });

      if (res.ok) {
        // Close modal first
        setShowInvest(false);
        // Then show success message
        setTimeout(() => {
          Alert.alert(
            'Success!',
            `Investment of ¥${totalAmount.toFixed(2)} recorded successfully!\n\nYou can view your assets in Profile → My Assets & Transactions`
          );
        }, 300);
      } else {
        Alert.alert('Error', res.error || 'Investment failed');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.productCard} onPress={() => handleInvestPress(item)}>
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
          <Text style={styles.yieldValue}>{item.yield_rate}</Text>
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

      <TouchableOpacity style={styles.investButton} onPress={() => handleInvestPress(item)}>
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
          <Text style={styles.headerSubtitle}>NFT & Digital Collectibles</Text>
        </View>
        <TouchableOpacity style={styles.filterButton} onPress={loadData}>
          <Ionicons name="filter" size={24} color="#d81e06" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#d81e06" />
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Invest Modal */}
      {selectedProduct && (
        <View style={[styles.modalOverlay, !showInvest && { display: 'none' }]}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invest in {selectedProduct.name}</Text>
            <Text style={styles.modalSubtitle}>Expected Yield: {selectedProduct.yield_rate}</Text>
            <Text style={styles.modalPrice}>Min Investment: {selectedProduct.price}</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, styles.cancelBtn]} onPress={() => setShowInvest(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.confirmBtn]} onPress={handleInvestConfirm}>
                <Text style={styles.confirmBtnText}>Confirm Invest</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#333',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#d81e06',
    marginBottom: 4,
    fontWeight: '600',
  },
  modalPrice: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelBtn: {
    backgroundColor: '#f5f5f5',
  },
  confirmBtn: {
    backgroundColor: '#d81e06',
  },
  cancelBtnText: {
    color: '#666',
    fontWeight: 'bold',
  },
  confirmBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProductScreen;
