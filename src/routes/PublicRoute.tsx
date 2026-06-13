import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let role: string | null = null;

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            role = user.role;
            if (role !== 'CLIENT' && role !== 'PRESTATAIRE' && role !== 'ADMIN') {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                role = null;
            }
        } catch {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    if (role === 'CLIENT') {
        return <Navigate to="/Home-Client" replace />;
    }
    if (role === 'PRESTATAIRE') {
        return <Navigate to="/Home-Provider" replace />;
    }
    if (role === 'ADMIN') {
        return <Navigate to="/AdminDashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
