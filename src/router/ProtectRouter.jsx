import { Navigate } from "react-router-dom";
import { decode } from "jsonwebtoken-esm";

export function ProtectRouter({ children, requiredRoles = [] }) {
    try {
        const token = localStorage.getItem("jwt_token");
        console.log("Token from storage:", token);
        if (!token) {
            console.error("Token not found in localStorage.");
            throw new Error("Unauthorized: No token provided.");
        }

        let decodedToken;
        try {
            decodedToken = decode(token);
            console.log("Decoded token:", decodedToken);
        } catch (err) {
            console.error("Decoding token failed:", err);
            throw new Error("Unauthorized: Invalid token.");
        }

        if (!decodedToken || !decodedToken.roles) {
            console.error("Token missing roles.");
            throw new Error("Unauthorized: Invalid token.");
        }

        let userRoles = [];
        if (typeof decodedToken.roles === "string") {
            userRoles = [decodedToken.roles.toUpperCase()];
        } else if (Array.isArray(decodedToken.roles)) {
            userRoles = decodedToken.roles.map((role) => role.toUpperCase());
        } else {
            console.error("Token roles format is not supported.");
            throw new Error("Unauthorized: Invalid token.");
        }

        console.log("User roles:", userRoles);

        // Kiểm tra nếu route yêu cầu quyền cụ thể mà token không chứa
        if (requiredRoles.length > 0) {
            const normalizedRequiredRoles = requiredRoles.map((role) => role.toUpperCase());
            const hasRequiredRole = normalizedRequiredRoles.some((role) =>
                userRoles.includes(role)
            );
            if (!hasRequiredRole) {
                console.error("User does not have required role(s).");
                throw new Error("Unauthorized: Insufficient permissions.");
            }
        }

        // Xác định role để chuyển hướng
        const userRoleForRedirect = userRoles.includes("ADMIN") ? "admin" : "member";
        console.log("User role for redirect:", userRoleForRedirect);
        console.log("Current pathname:", window.location.pathname);

        // Nếu đang ở trang login hoặc root, chuyển hướng theo role
        if (window.location.pathname === "/login" || window.location.pathname === "/") {
            return userRoleForRedirect === "admin" ? (
                <Navigate to="/admin/dashboard" />
            ) : (
                <Navigate to="/homepage" />
            );
        }

        return children;
    } catch (error) {
        console.error("Access denied:", error.message);
        return <Navigate to="/login" />;
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
