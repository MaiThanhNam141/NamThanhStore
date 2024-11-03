import React from 'react'
import { Linking } from 'react-native'
import { SliderBox } from 'react-native-image-slider-box'

export default RenderSliderImage = props => {
  const onCurrentImagePressed = index => {
    const link = props.links[index];
    if (!link) {
      console.error(`No URL found for index ${index}`);
      return;
    }
    Linking.openURL(link);
  }

  return (
    <SliderBox
      dotColor="transparent"
      inactiveDotColor="transparent"
      imageLoadingColor="white"
      autoplay={true}
      autoplayInterval={7000}
      circleLoop={true}
      images={props.images}
      borderRadius={20}
      parentWidth={350}
      sliderBoxHeight={200}
      onCurrentImagePressed={index => onCurrentImagePressed(index)}
      resizeMode="cover"
    />
  )
}
