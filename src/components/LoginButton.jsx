const LoginButton = () => {
    const handleLogin = () => {
        window.location.href = "http://localhost:5001/auth/google";
    };

    return (
        <button className="login-btn" onClick={handleLogin}>
            Sign in with Google
        </button>
    );
};

export default LoginButton;