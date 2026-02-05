import { HashRouter, Routes, Route } from 'react-router-dom';
import SplashScreen from './pages/onboarding/splashScreen';
import LoginPage from './pages/onboarding/auth/loginPage.tsx';
import RootDashboard from './components/dashboard/rootDashboard.tsx';

const AppRouterWrapper = () => {
    return (
        <HashRouter>
         <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<RootDashboard />} />
        </Routes>
        </HashRouter>
    )
}

export default AppRouterWrapper;