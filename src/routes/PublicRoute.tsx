import { Navigate } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
}

const PublicRoute: React.FC<Props> = ({ children }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
        try {
            const user = JSON.parse(userStr);
            if (user.role === 'CLIENT') {
                return <Navigate to="/Home-Client" replace />;
            } else if (user.role === 'PRESTATAIRE') {
                return <Navigate to="/Home-Provider" replace />;
            }
            return <Navigate to="/Home-Client" replace />;
        } catch (e) {
            // If user JSON is invalid, allow them to view public routes
        }
    }

    return <>{children}</>;
};

export default PublicRoute;
