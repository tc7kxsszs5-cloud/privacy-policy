import { useRef, forwardRef, useImperativeHandle } from 'react'
import { StyleSheet, View } from 'react-native'
import WebView from 'react-native-webview'
import { VIEWER_HTML } from './viewer.html.ts'
import { postToWebView, RNtoWebView, WebViewToRN } from './bridge'

export type CarViewerHandle = {
  send: (msg: RNtoWebView) => void
}

type Props = {
  onMessage: (msg: WebViewToRN) => void
}

export const CarViewer = forwardRef<CarViewerHandle, Props>(({ onMessage }, ref) => {
  const webViewRef = useRef<WebView>(null)

  useImperativeHandle(ref, () => ({
    send: (msg) => postToWebView(webViewRef, msg),
  }))

  function handleMessage(event: { nativeEvent: { data: string } }) {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as WebViewToRN
      onMessage(msg)
    } catch {}
  }

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: VIEWER_HTML }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        originWhitelist={['*']}
        mixedContentMode="always"
      />
    </View>
  )
})

const styles = StyleSheet.create({
  container: { flex: 1 },
  webview: { flex: 1, backgroundColor: '#0f0f0f' },
})
