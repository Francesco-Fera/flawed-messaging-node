import { useEffect, useState } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://" + window.location.host + "/ws");
    // const ws = new WebSocket(`ws://${window.location.hostname}:8080/ws`)

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("firsty", data);
      setNotifications((prev) => {
        console.log("prev", prev);

        // Update or add the notification
        const existing = prev.find((n) => n.id === data.id);
        if (existing) {
          return prev.map((n) => (n.id === data.id ? data : n));
        }
        return [data, ...prev];
      });
    };

    return () => ws.close();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📬 Notifications</h1>
      <table className="table-auto w-full text-left border border-gray-200 shadow-md rounded-md">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">To</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Attempts</th>
            <th className="px-4 py-2">Last Error</th>
          </tr>
        </thead>
        <tbody>
          {notifications.map((n) => (
            <tr key={n.id} className="border-t">
              <td className="px-4 py-2 text-xs font-mono">{n.id}</td>
              <td className="px-4 py-2">{n.to || "-"}</td>
              <td className="px-4 py-2">{n.type}</td>
              <td
                className={`px-4 py-2 font-semibold ${
                  n.status === "sent"
                    ? "text-green-600"
                    : n.status === "failed"
                    ? "text-red-600"
                    : "text-yellow-500"
                }`}
              >
                {n.status}
              </td>
              <td className="px-4 py-2">{n.attempts ?? 0}</td>
              <td className="px-4 py-2 text-sm text-gray-500">
                {n.lastError ?? "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Notifications;
