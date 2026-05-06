import {Navigate, useLocation} from "react-router-dom";

const ProtectedRoute = ({children, allowedRoles = []}) => {
    const location = useLocation();

    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr): null;

    //Not logged in -> redirected to login
    if (!token) {
        return <Navigate to="/login" state={{from: location.pathname}} replace/>;
    }

    //Wrong role -> Show message
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)){
        return (
            <Navigate
                to="/error"
                state={{
                    error: {
                        status: 403,
                        title: "Access Denied",
                        message: `You must be ${allowedRoles.join(" or ")} to access this page.`,
                    },
                }}
                replace
            />
        );
    }

    return children;
};

export default ProtectedRoute;