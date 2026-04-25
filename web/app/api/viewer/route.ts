import { VIEWER_HTML } from '@/../components/CarViewer/viewer.html'

export async function GET() {
  return new Response(VIEWER_HTML, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
