export const childAvatars = [
  {
    id: 1,
    name: "Happy Cat",
    emoji: "😸",
    color: "bg-orange-100",
  },
  {
    id: 2,
    name: "Cool Dog",
    emoji: "🐶",
    color: "bg-blue-100",
  },
  {
    id: 3,
    name: "Magic Unicorn",
    emoji: "🦄",
    color: "bg-purple-100",
  },
  {
    id: 4,
    name: "Space Robot",
    emoji: "🤖",
    color: "bg-green-100",
  },
  {
    id: 5,
    name: "Friendly Bear",
    emoji: "🐻",
    color: "bg-yellow-100",
  },
  {
    id: 6,
    name: "Ocean Dolphin",
    emoji: "🐬",
    color: "bg-cyan-100",
  },
  {
    id: 7,
    name: "Rainbow Parrot",
    emoji: "🦜",
    color: "bg-pink-100",
  },
  {
    id: 8,
    name: "Cute Panda",
    emoji: "🐼",
    color: "bg-gray-100",
  },
]

export function getRandomAvatar() {
  return childAvatars[Math.floor(Math.random() * childAvatars.length)]
}

export function getAvatarById(id: number) {
  return childAvatars.find((avatar) => avatar.id === id) || childAvatars[0]
}
