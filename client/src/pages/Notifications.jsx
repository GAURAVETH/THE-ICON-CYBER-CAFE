import {
    useEffect,
    useState
} from "react";

import API from "../services/api";

const Notifications = () => {

    const [notifications,
        setNotifications] =
        useState([]);

    useEffect(() => {
        let isMounted = true;

        const fetchNotifications = async () => {
            try {
                const { data } = await API.get("/notifications");

                if (isMounted) {
                    setNotifications(data.data || data.notifications || []);
                }
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();

        return () => {
            isMounted = false;
        };
    }, []);

    return (

        <div
            className="
      p-5
    "
        >

            <h1
                className="
        text-3xl
        font-bold
        mb-5
      "
            >
                Notifications
            </h1>

            {notifications.map((item) => (

                <div
                    key={item._id}
                    className="
          border
          p-4
          mb-4
        "
                >

                    {item.message}

                </div>

            ))}

        </div>
    );
};

export default Notifications;
