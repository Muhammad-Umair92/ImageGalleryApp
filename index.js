/**
 * @format
 */

import { AppRegistry } from 'react-native';
// enableScreens must be called before any navigation renders.
// It activates native screen containers (UIViewController on iOS,
// Fragment on Android) instead of plain View wrappers.
// Without this, RNSScreenStack throws "Unimplemented component" error.
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

enableScreens();

AppRegistry.registerComponent(appName, () => App);
