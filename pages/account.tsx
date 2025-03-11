import { ProtectedRoute } from "@components/wrappers/ProtectedRoute";
import { useAuth } from "@contexts/AuthContext";

const AccountContent = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1>Account Page</h1>
            <p>Welcome, {user?.username}</p>
            <p>Email: {user?.mail}</p>
        </div>
    );
};

const AccountPage = () => {
  return (
    <ProtectedRoute>
       <AccountContent />
    </ProtectedRoute>
  );
}

export default AccountPage;