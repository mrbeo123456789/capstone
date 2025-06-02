import { Navigate, useLocation } from "react-router-dom";
import { decode } from "jsonwebtoken-esm";
import { toast } from "react-toastify"; // ✅ Import toast

export function ProtectRouter({ children, requiredRoles = [] }) {
    const token = localStorage.getItem("jwt_token");
    const location = useLocation();
    const pathname = location.pathname;

    if (!token) {
        console.warn("🔒 No token found, redirecting to login...");
        return <Navigate to="/login" replace />;
    }

    try {
        const decoded = decode(token);

        if (!decoded || !decoded.roles || !decoded.exp) {
            console.error("🔒 Invalid token structure.");
            return <Navigate to="/login" replace />;
        }

        const nowInSeconds = Date.now() / 1000;
        if (decoded.exp < nowInSeconds) {
            console.warn("⏰ Token expired, redirecting to homepage...");
            toast.error("Session expired. Please log in again.");
            localStorage.clear();
            return <Navigate to="/homepage" replace />;
        }

        const userRoles = Array.isArray(decoded.roles)
            ? decoded.roles.map(r => r.toUpperCase())
            : [decoded.roles.toUpperCase()];

        if (requiredRoles.length > 0) {
            const normalizedRequiredRoles = requiredRoles.map(role => role.toUpperCase());
            const hasRequiredRole = normalizedRequiredRoles.some(role => userRoles.includes(role));

            if (!hasRequiredRole) {
                console.warn("⛔ User does not have required role(s).");
                return <Navigate to="/homepage" replace />;
            }
        }

        if (pathname === "/" || pathname === "/login") {
            if (userRoles.includes("ADMIN")) {
                return <Navigate to="/admin/dashboard" replace />;
            } else {
                return <Navigate to="/homepage" replace />;
            }
        }

        return children;
    } catch (error) {
        console.error("🔒 Token decode error:", error);
        return <Navigate to="/login" replace />;
    }
}

export function AdminRoute({ children }) {
    return <ProtectRouter requiredRoles={["ADMIN"]}>{children}</ProtectRouter>;
}

export function MemberRoute({ children }) {
    return <ProtectRouter requiredRoles={["MEMBER"]}>{children}</ProtectRouter>;
}

export function AuthenticatedRoute({ children }) {
    return <ProtectRouter requiredRoles={[]}>{children}</ProtectRouter>;
}