import React from 'react'
import { SliderBox } from 'react-native-image-slider-box'

export default RenderSliderImage = props => {
  const onCurrentImagePressed = index => {
    const title = props.titles[index];
    props.onPress(title);
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
