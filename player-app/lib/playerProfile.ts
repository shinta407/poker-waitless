export function getPlayerId(): string {
  let id = localStorage.getItem('poker_player_id')
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem('poker_player_id', id)
  }
  return id
}

export function getPlayerName(): string {
  return localStorage.getItem('poker_player_name') || ''
}

export function savePlayerName(name: string) {
  localStorage.setItem('poker_player_name', name)
}
