import { ulid } from "ulid";
import { Room } from "./room";

export class RoomManager {
  #rooms = new Map<string, Room>();
  collect(roomId: string) {
    const count = this.#rooms.get(roomId)?.participantsCount ?? -1;
    if (count === 0) {
      this.#rooms.delete(roomId);
    }
  }
  get(roomId: string) {
    return this.#rooms.get(roomId);
  }
  add() {
    const id = ulid();
    this.#rooms.set(id, new Room());
    return id;
  }
  has(roomId: string) {
    return this.#rooms.has(roomId);
  }
}