/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState
} from "react";
import API from "../services/api";

const AuthContext = createContext();

const readStoredUser = () => {
    if (!localStorage.getItem("token")) {
        return null;
    }

    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
        return null;
    }

    try {
        return normalizeUser(JSON.parse(storedUser));
    } catch {
        localStorage.removeItem("user");
        return null;
    }
};

const normalizeUser = (value) => {
    if (!value) {
        return null;
    }

    return {
        _id: value._id || value.id,
        name: value.name || "",
        email: value.email || "",
        role: value.role || "user",
        avatar: value.avatar || null,
        phone: value.phone || ""
    };
};

const normalizeAuthPayload = (payload) => {
    const data = payload?.data || payload || {};

    return {
        token: data.token,
        user: normalizeUser(data.user || data)
    };
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(readStoredUser);
    const [isAuthLoading, setIsAuthLoading] = useState(() =>
        Boolean(localStorage.getItem("token"))
    );

    const persistUser = useCallback((nextUser) => {
        const normalizedUser = normalizeUser(nextUser);

        if (!normalizedUser?._id) {
            return null;
        }

        localStorage.setItem("user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);

        return normalizedUser;
    }, []);

    const clearAuth = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    const refreshCurrentUser = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            clearAuth();
            return null;
        }

        try {
            const { data } = await API.get("/auth/me");
            return persistUser(data.data);
        } catch {
            clearAuth();
            return null;
        }
    }, [clearAuth, persistUser]);

    useEffect(() => {
        let isMounted = true;
        const token = localStorage.getItem("token");

        if (!token) {
            return;
        }

        const loadCurrentUser = async () => {
            try {
                const { data } = await API.get("/auth/me");

                if (isMounted) {
                    persistUser(data.data);
                }
            } catch {
                if (isMounted) {
                    clearAuth();
                }
            } finally {
                if (isMounted) {
                    setIsAuthLoading(false);
                }
            }
        };

        loadCurrentUser();

        return () => {
            isMounted = false;
        };
    }, [clearAuth, persistUser]);

    const login = (payload) => {
        const {
            token,
            user: nextUser
        } = normalizeAuthPayload(payload);

        if (!token || !nextUser?._id) {
            throw new Error("Invalid login response from server");
        }

        localStorage.setItem("token", token);
        return persistUser(nextUser);
    };

    const logout = () => {
        clearAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthLoading,
                login,
                logout,
                refreshCurrentUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
