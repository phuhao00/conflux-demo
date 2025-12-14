import { useState } from 'react';
import { Alert } from 'react-native';
import { apiClient } from '../api/client';
import { DEMO_ADDRESS } from '../utils/constants';

export const useInvest = (onSuccess) => {
  const [loading, setLoading] = useState(false);

  const invest = async (product, amount = 1) => {
    if (!product) return;
    
    setLoading(true);
    try {
      // Generate a random Token ID for demo purposes
      const tokenId = Math.floor(Date.now() / 1000);
      const txHash = '0x' + Math.random().toString(16).substr(2, 64); // Mock tx hash

      const totalAmount = amount * parseFloat(product.price.replace(/[^0-9.]/g, ''));

      // Record investment in database
      const res = await apiClient.post('/invest', {
        wallet_address: DEMO_ADDRESS,
        product_id: product.id,
        investment_amount: totalAmount,
        token_id: tokenId.toString(),
        nft_address: '', // Will be filled by backend if needed
        tx_hash: txHash
      });

      if (res.ok) {
        if (onSuccess) onSuccess(product, totalAmount);
      } else {
        Alert.alert('Error', res.error || 'Purchase failed');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return { invest, loading };
};
