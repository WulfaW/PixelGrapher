// Intentional crash component to test ErrorBoundary
export default function CrashTest() {
  throw new Error('CrashTest intentional error');
}
