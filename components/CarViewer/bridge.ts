// components/CarViewer/bridge.ts

// Messages sent FROM React Native TO WebView
export type RNtoWebView =
  | { type: 'load_model'; glbUrl: string }
  | { type: 'apply_material'; meshName: string; colorHex: string; finish: MaterialFinish }
  | { type: 'apply_tint'; meshName: string; tintPercent: number }
  | { type: 'reset_all' }
  | { type: 'highlight_mesh'; meshName: string | null }
  | { type: 'studio_mode'; enabled: boolean }

// Messages sent FROM WebView TO React Native
export type WebViewToRN =
  | { type: 'ready' }
  | { type: 'mesh_tapped'; meshName: string; isGlass: boolean }
  | { type: 'model_loaded'; meshNames: string[] }
  | { type: 'model_error'; message: string }

export type MaterialFinish = 'gloss' | 'matte' | 'carbon' | 'chrome' | 'satin' | 'pearl'

export function postToWebView(ref: React.RefObject<any>, msg: RNtoWebView) {
  ref.current?.injectJavaScript(`
    window.dispatchEvent(new MessageEvent('message', {
      data: ${JSON.stringify(JSON.stringify(msg))}
    }));
    true;
  `)
}
