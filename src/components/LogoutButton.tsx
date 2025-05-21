import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function LogoutButton() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <button onClick={handleLogout} className="p-2 bg-red-500 text-white rounded">
            Logout
        </button>
    );
}
