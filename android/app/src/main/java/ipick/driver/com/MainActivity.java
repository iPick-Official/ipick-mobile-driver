package ipick.driver.com;

import android.os.Build;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import androidx.core.view.WindowCompat;

import androidx.activity.EdgeToEdge;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        }
    }
}