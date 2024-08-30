import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { process } from 'react-native-dotenv';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
    webClientId: process.env.GOOGLE_API_CLIENT,
});
global.isDefaultMessageSent = false;

AppRegistry.registerComponent(appName, () => App);
