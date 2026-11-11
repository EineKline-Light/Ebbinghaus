package com.ebbinghaus.review;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.*;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebViewAssetLoader;
import java.io.*;

public class MainActivity extends AppCompatActivity {
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    private String pendingBackup;
    private final WebViewAssetLoader assets = new WebViewAssetLoader.Builder().addPathHandler("/assets/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
    @SuppressLint("SetJavaScriptEnabled")
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        android.widget.FrameLayout root = new android.widget.FrameLayout(this);
        root.setBackgroundColor(android.graphics.Color.WHITE);
        setContentView(root);
        ViewCompat.setOnApplyWindowInsetsListener(root, (v, insets) -> {
            androidx.core.graphics.Insets bars = insets.getInsets(WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout() | WindowInsetsCompat.Type.ime());
            v.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
        webView = new WebView(this);
        root.addView(webView, new android.widget.FrameLayout.LayoutParams(-1,-1));
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true); s.setDomStorageEnabled(true);
        s.setAllowFileAccess(false); s.setAllowContentAccess(true);
        s.setUseWideViewPort(true); s.setLoadWithOverviewMode(true);
        s.setTextZoom(100); s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return assets.shouldInterceptRequest(request.getUrl()); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) { return !"appassets.androidplatform.net".equals(request.getUrl().getHost()); }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = callback;
                try { startActivityForResult(params.createIntent(), 10); } catch (Exception ex) { fileCallback.onReceiveValue(null); fileCallback = null; }
                return true;
            }
            @Override public boolean onJsAlert(WebView v, String url, String message, JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("确定", (d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onJsConfirm(WebView v,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("确定",(d,w)->result.confirm()).setNegativeButton("取消",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
            @Override public boolean onJsPrompt(WebView v,String url,String message,String value,JsPromptResult result) {
                android.widget.EditText input = new android.widget.EditText(MainActivity.this); input.setText(value);
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setView(input).setPositiveButton("确定",(d,w)->result.confirm(input.getText().toString())).setNegativeButton("取消",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show(); return true;
            }
        });
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface public void exportBackup(String json) { runOnUiThread(()->{
                pendingBackup = json;
                Intent i = new Intent(Intent.ACTION_CREATE_DOCUMENT).setType("application/json").addCategory(Intent.CATEGORY_OPENABLE).putExtra(Intent.EXTRA_TITLE,"ebbinghaus-backup.json");
                startActivityForResult(i,11);
            }); }
        }, "NativeBackup");
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html");
    }
    @Override protected void onActivityResult(int request,int result,Intent data) {
        super.onActivityResult(request,result,data);
        if(request==10 && fileCallback!=null) { Uri[] uris = null;
            if(result==RESULT_OK && data!=null && data.getClipData()!=null) {
                int count=data.getClipData().getItemCount(); uris=new Uri[count];
                for(int i=0;i<count;i++) uris[i]=data.getClipData().getItemAt(i).getUri();
            } else { uris=WebChromeClient.FileChooserParams.parseResult(result,data); }
            fileCallback.onReceiveValue(uris); fileCallback=null; }
        if(request==11 && result==RESULT_OK && data!=null && pendingBackup!=null) {
            try(OutputStream stream=getContentResolver().openOutputStream(data.getData())) { stream.write(pendingBackup.getBytes(java.nio.charset.StandardCharsets.UTF_8)); }
            catch(Exception e) { new AlertDialog.Builder(this).setMessage("备份保存失败，请重试").setPositiveButton("确定",null).show(); }
        }
        pendingBackup=null;
    }
    @Override public void onBackPressed() {
        webView.evaluateJavascript("window.handleAndroidBack ? handleAndroidBack() : false", value->{ if(!"true".equals(value)) MainActivity.super.onBackPressed(); });
    }
    @Override protected void onDestroy() { if(fileCallback!=null) fileCallback.onReceiveValue(null); webView.destroy(); super.onDestroy(); }
}
