import { useNavigate } from "react-router-dom";
import { client } from "../features/query/client"

export function Page() {
  const navigate = useNavigate();
  return <div>
    <button onClick={createParty}>파티 만들기</button>
  </div>

  async function createParty() {
    const { data, error } = await client.api.rooms.post();
    if (data == null) return console.error(error);

    navigate(`/rooms/${data.roomId}`);
  }
}