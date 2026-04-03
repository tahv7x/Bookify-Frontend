import {Navigate} from 'react-router-dom';

interface Props{
    children : React.ReactNode;
    allowedRole?: string;
}

const ProtectedRoute: React.FC<Props> = ({children,allowedRole}) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if(!token || !userStr){
        return <Navigate to="/login" replace />;
    }
    if(allowedRole){
        const user = JSON.parse(userStr);
        if(user.role != allowedRole){
            return <Navigate to="/login" replace/>;
        }
    }
    return <>{children}</>;
}

export default ProtectedRoute;