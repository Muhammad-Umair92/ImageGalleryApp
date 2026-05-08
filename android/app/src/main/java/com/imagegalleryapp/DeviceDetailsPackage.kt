package com.imagegalleryapp

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

/**
 * DeviceDetailsPackage — registers our native module with React Native.
 *
 * ReactPackage is the entry point React Native uses to discover modules.
 * Every native module needs a Package class to be registered in MainApplication.
 *
 * createNativeModules: returns list of native modules to register.
 * createViewManagers: returns list of custom native views (none here).
 */
class DeviceDetailsPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext
    ): List<NativeModule> {
        // Return our module — React Native registers it under the name
        // returned by DeviceDetailsModule.getName() → "DeviceDetails"
        return listOf(DeviceDetailsModule(reactContext))
    }

    override fun createViewManagers(
        reactContext: ReactApplicationContext
    ): List<ViewManager<*, *>> = emptyList()
}
