import './index.css'
import { Toaster } from 'sonner';
import AppRouterWrapper from './router';
import OfflineBanner from "@/components/common/offlinebanner";

function App() {

  return (
    <>
    <Toaster position="top-right" richColors />
    <OfflineBanner />
      <AppRouterWrapper />
    </>
  )
}

export default App
