import { useRef } from 'react';
import { useQuery } from './features/query/use-query'

function App() {
  const timerRef = useRef<number>();
  const { users, myName, wsRef } = useQuery(import.meta.env.PROD ? location.host : import.meta.env.VITE_API, {
    onready: () => {
      timerRef.current = setTimeout(() => {
        open(`steam://rungameid/${import.meta.env.VITE_GAME_ID}`);

        wsRef.current?.close();
      }, 3000) as unknown as number;
    },
    oncancel: () => {
      clearTimeout(timerRef.current);
    }
  });

  const canRunGame = users?.length === 3;

  return (
    <>
      <section>
        <h1>이름</h1>
        <div>{myName}</div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          const name = formData.get("new-name") as string;

          wsRef.current?.send({ type: "rename", name });
        }}>
          <input name="new-name" defaultValue={myName} />
          <button>저장</button>
          <button type="reset">취소</button>
        </form>
      </section>
      <section>
        <h1>접속자 목록</h1>
        <ul>{users?.map((name, id) => <li key={id}>{name}</li>)}</ul>
      </section>
      <section>
        {canRunGame ? "잠시후 게임이 자동으로 켜집니다..." : "대기중..."}
      </section>
    </>
  )
}

export default App
