import { useEffect, useState } from "react";
import { getPendingTaskerVerifications, setTaskerVerification } from "../services/userService";

interface PendingTasker {
  id: number;
  userId: number;
  fullName: string;
  idCardNumber: string;
  skills?: string;
  workingArea?: string;
}

// EP01 - US04: Xác thực hồ sơ Tasker
export default function TaskerVerificationPage() {
  const [items, setItems] = useState<PendingTasker[]>([]);

  async function load() {
    setItems((await getPendingTaskerVerifications()) as PendingTasker[]);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDecision(id: number, approve: boolean) {
    await setTaskerVerification(id, approve);
    load();
  }

  return (
    <div>
      <h1>Xét duyệt hồ sơ Tasker</h1>
      {items.length === 0 && <p>Không có hồ sơ nào đang chờ duyệt.</p>}
      <table>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>CCCD</th>
            <th>Kỹ năng</th>
            <th>Khu vực</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>{t.fullName}</td>
              <td>{t.idCardNumber}</td>
              <td>{t.skills}</td>
              <td>{t.workingArea}</td>
              <td>
                <button onClick={() => handleDecision(t.id, true)}>Duyệt</button>
                <button onClick={() => handleDecision(t.id, false)}>Từ chối</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
