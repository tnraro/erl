export class Room {
  #participants = new Map<string, string>();
  enterUser(id: string) {
    this.#participants.set(id, this.#generateNickname());
  }
  leaveUser(id: string) {
    this.#participants.delete(id);
  }
  getUser(id: string) {
    return this.#participants.get(id);
  }
  renameUser(id: string, username: string) {
    this.#participants.set(id, username);
  }
  get participants() {
    return [...this.#participants.values()];
  }
  get participantsCount() {
    return this.#participants.size;
  }
  #generateNickname() {
    const items = ["🍋", "🍇", "🍎", "🍥"];
    const nicknames = new Set(this.#participants.values())

    for (const item of items) {
      if (!nicknames.has(item)) {
        return item;
      }
    }

    return crypto.randomUUID();
  }
}