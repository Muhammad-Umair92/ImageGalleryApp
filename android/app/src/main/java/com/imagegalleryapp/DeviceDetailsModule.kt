package com.imagegalleryapp

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableNativeMap

/**
 * DeviceDetailsModule — Native Bridge Module
 *
 * This class bridges Android native code to JavaScript/React Native.
 *
 * How it works:
 * 1. JS calls NativeModules.DeviceDetails.getDeviceDetails()
 * 2. React Native serializes the call and sends it over the bridge
 * 3. Android receives it and executes getDeviceDetails() on the native thread
 * 4. We resolve the Promise with a WritableNativeMap (becomes a JS object)
 * 5. JS receives the resolved object in .then()
 *
 * ReactContextBaseJavaModule: base class for all RN native modules
 * @ReactMethod: annotation that exposes a method to the JS bridge
 * Promise: async bridge — resolves with data or rejects with an error
 */
class DeviceDetailsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    /**
     * getName() returns the name used in JS to access this module.
     * NativeModules.DeviceDetails → maps to "DeviceDetails" here.
     * This MUST match exactly what you call from JS.
     */
    override fun getName(): String = "DeviceDetails"

    /**
     * @ReactMethod marks this as callable from JavaScript.
     * isBlockingSynchronousMethod = false (default) — runs asynchronously.
     * Promise allows async resolution — critical for methods that might
     * take time or access hardware.
     */
    @ReactMethod
    fun getDeviceDetails(promise: Promise) {
        try {
            // WritableNativeMap is React Native's bridge-compatible Map.
            // It gets serialized to a plain JS object on the other side.
            val map = WritableNativeMap()

            // Build.MODEL: device model name e.g. "Pixel 7", "Galaxy S23"
            map.putString("model", Build.MODEL)

            // Build.MANUFACTURER: hardware manufacturer e.g. "Google", "Samsung"
            map.putString("manufacturer", Build.MANUFACTURER)

            // Build.VERSION.RELEASE: Android version string e.g. "14", "13"
            map.putString("androidVersion", Build.VERSION.RELEASE)

            // Build.VERSION.SDK_INT: API level e.g. 34 for Android 14
            map.putInt("sdkVersion", Build.VERSION.SDK_INT)

            // Build.BRAND: brand name (sometimes different from manufacturer)
            map.putString("brand", Build.BRAND)

            // Build.DEVICE: device codename e.g. "cheetah" for Pixel 7 Pro
            map.putString("device", Build.DEVICE)

            promise.resolve(map)
        } catch (e: Exception) {
            // reject() sends the error back to JS .catch()
            promise.reject("DEVICE_DETAILS_ERROR", e.message, e)
        }
    }
}
