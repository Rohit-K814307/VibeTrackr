import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/firebase";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <div>Loading...</div>; // Or a spinner

  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  return children;
}
