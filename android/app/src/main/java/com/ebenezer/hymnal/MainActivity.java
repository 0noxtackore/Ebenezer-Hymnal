package com.ebenezer.hymnal;

import android.app.Activity;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;
    private LinearLayout errorView;
    private boolean pageLoaded = false;
    private static final String URL = "https://ebenezer-hymnal.netlify.app/";
    private static final String TAG = "EbenezerHymnal";

    private static final String SHARE_OVERRIDE_JS =
        "if (!window.__shareBridgeLoaded) {" +
        "  window.__shareBridgeLoaded = true;" +
        "  window.__origShare = navigator.share.bind(navigator);" +
        "  navigator.share = function(opts) {" +
        "    if (opts && opts.files && opts.files.length > 0) {" +
        "      var file = opts.files[0];" +
        "      return new Promise(function(resolve, reject) {" +
        "        var reader = new FileReader();" +
        "        reader.onload = function() {" +
        "          var base64 = reader.result.split(',')[1];" +
        "          var tmpFile = ShareBridge.writeBase64File(base64, file.name || 'share.jpg');" +
        "          if (tmpFile) {" +
        "            ShareBridge.share(opts.title || '', opts.text || '', tmpFile);" +
        "            resolve();" +
        "          } else {" +
        "            reject(new Error('Failed to write file'));" +
        "          }" +
        "        };" +
        "        reader.onerror = function() { reject(reader.error); };" +
        "        reader.readAsDataURL(file);" +
        "      });" +
        "    } else {" +
        "      ShareBridge.shareText(opts.title || '', opts.text || '');" +
        "      return Promise.resolve();" +
        "    }" +
        "  };" +
        "  Object.defineProperty(navigator, 'canShare', { value: function() { return true; }, writable: false });" +
        "}";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(
            WindowManager.LayoutParams.FLAG_FULLSCREEN,
            WindowManager.LayoutParams.FLAG_FULLSCREEN
        );
        setContentView(getResources().getIdentifier("activity_main", "layout", getPackageName()));

        webView = findViewById(getResources().getIdentifier("webView", "id", getPackageName()));
        errorView = findViewById(getResources().getIdentifier("errorView", "id", getPackageName()));
        TextView retryBtn = findViewById(getResources().getIdentifier("retryBtn", "id", getPackageName()));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setLoadWithOverviewMode(true);
        settings.setUseWideViewPort(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

        webView.addJavascriptInterface(new ShareBridge(this), "ShareBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageStarted(WebView view, String url, Bitmap favicon) {
                super.onPageStarted(view, url, favicon);
                Log.d(TAG, "onPageStarted: " + url);
                pageLoaded = false;
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
                view.evaluateJavascript(SHARE_OVERRIDE_JS, null);
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "onPageFinished: " + url);
                pageLoaded = true;
                errorView.setVisibility(View.GONE);
                webView.setVisibility(View.VISIBLE);
                view.evaluateJavascript(SHARE_OVERRIDE_JS, null);
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                Log.d(TAG, "onReceivedError: " + request.getUrl() + " isForMain=" + request.isForMainFrame() + " error=" + error);
                if (request.isForMainFrame() && !pageLoaded) {
                    webView.setVisibility(View.GONE);
                    errorView.setVisibility(View.VISIBLE);
                }
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onProgressChanged(WebView view, int newProgress) {
                Log.d(TAG, "progress: " + newProgress);
            }
        });

        retryBtn.setOnClickListener(v -> {
            pageLoaded = false;
            errorView.setVisibility(View.GONE);
            webView.setVisibility(View.VISIBLE);
            webView.loadUrl(URL);
        });

        Log.d(TAG, "Loading URL: " + URL);
        webView.loadUrl(URL);
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
