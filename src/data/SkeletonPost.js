import React from 'react';
import { View, StyleSheet } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const SkeletonPost = () => {
  return (
    <SkeletonPlaceholder contentContainerStyle={{ backgroundColor: '#ffffff' }}>
      <View style={styles.skeletonContainer}>
        <View style={styles.productColumn}>
          <View style={styles.productImagePlaceholder} />
          <View style={styles.textBlock}>
            <View style={styles.productNamePlaceholder} />
            <View style={styles.productPricePlaceholder} />
          </View>
        </View>
        <View style={styles.productColumn}>
          <View style={styles.productImagePlaceholder} />
          <View style={styles.textBlock}>
            <View style={styles.productNamePlaceholder} />
            <View style={styles.productPricePlaceholder} />
          </View>
        </View>
      </View>
    </SkeletonPlaceholder>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 15,
  },
  productColumn: {
    flex: 1,
    marginRight: 10,
  },
  productImagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  textBlock: {
    paddingHorizontal: 10,
  },
  productNamePlaceholder: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    marginBottom: 5,
  },
  productPricePlaceholder: {
    width: '100%',
    height: 20,
    borderRadius: 4,
    marginBottom: 10,
  },
});

export default SkeletonPost;