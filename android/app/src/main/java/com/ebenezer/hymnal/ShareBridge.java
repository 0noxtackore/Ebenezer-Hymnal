package com.ebenezer.hymnal;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.util.Base64;
import android.webkit.JavascriptInterface;

import androidx.core.content.FileProvider;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

public class ShareBridge {
    private final Activity activity;

    public ShareBridge(Activity activity) {
        this.activity = activity;
    }

    @JavascriptInterface
    public String writeBase64File(String base64Data, String fileName) {
        try {
            byte[] data = Base64.decode(base64Data, Base64.DEFAULT);
            File cacheDir = new File(activity.getCacheDir(), "shares");
            cacheDir.mkdirs();
            File file = new File(cacheDir, fileName);
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(data);
            fos.close();
            return file.getAbsolutePath();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    @JavascriptInterface
    public void share(String title, String text, String filePath) {
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.putExtra(Intent.EXTRA_SUBJECT, title);
        intent.putExtra(Intent.EXTRA_TEXT, text);
        if (filePath != null && !filePath.isEmpty()) {
            File file = new File(filePath);
            if (file.exists()) {
                Uri uri = FileProvider.getUriForFile(
                    activity,
                    "com.ebenezer.hymnal.fileprovider",
                    file
                );
                intent.putExtra(Intent.EXTRA_STREAM, uri);
                intent.setType("image/jpeg");
                intent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            } else {
                intent.setType("text/plain");
            }
        } else {
            intent.setType("text/plain");
        }
        activity.startActivity(Intent.createChooser(intent, title));
    }

    @JavascriptInterface
    public void shareText(String title, String text) {
        Intent intent = new Intent(Intent.ACTION_SEND);
        intent.setType("text/plain");
        intent.putExtra(Intent.EXTRA_SUBJECT, title);
        intent.putExtra(Intent.EXTRA_TEXT, text);
        activity.startActivity(Intent.createChooser(intent, title));
    }
}
