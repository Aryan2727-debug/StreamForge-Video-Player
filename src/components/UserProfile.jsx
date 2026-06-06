import useAuth from "../auth/useAuth";

const UserProfile = () => {
    const { user, logout } = useAuth();

    if (!user) {
        return null;
    }

    return (
        <div className="user-profile">
            <img
                src={user.avatar}
                alt={user.name}
                width="40"
                height="40"
                className="user-avatar" 
            />
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={logout}>Logout</button>
        </div>
    );
};

export default UserProfile;