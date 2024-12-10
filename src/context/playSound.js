import Sound from 'react-native-sound';
import { effect } from '../data/AssetsRef';

export const playSound = async () => {
    try {
        const sound = new Sound(effect, (error) => {
            if (error) {
                console.error('Error loading sound:', error);
                return;
            }
            sound.setVolume(1.0);
            sound.play((success) => {
                if (!success) {
                    console.error('Playback failed due to audio decoding errors');
                }
                sound.release();
            });
        });
    } catch (error) {
        console.error('Error playing sound:', error);
    }
};