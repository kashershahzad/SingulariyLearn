package com.singularitylearn.app

import android.os.Build
import android.os.Bundle
// import android.view.WindowManager
import androidx.core.view.WindowCompat
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
      WindowCompat.setDecorFitsSystemWindows(window, false)
    }

    // Block screenshots and screen recordings (disabled to allow capture)
    // window.setFlags(
    //   WindowManager.LayoutParams.FLAG_SECURE,
    //   WindowManager.LayoutParams.FLAG_SECURE
    // )

    RNBootSplash.init(this, R.style.BootTheme)
  }

  override fun getMainComponentName(): String = "SingularityLearn"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
    DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
