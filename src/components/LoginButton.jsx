import { API_BASE_URL } from "../config/api";

const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = `${API_BASE_URL}/auth/google`;
    };

    return (
        <button className="login-btn" onClick={handleLogin}>
            Sign in with Google
        </button>
    );
};

export default LoginButton;