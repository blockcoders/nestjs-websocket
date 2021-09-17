export function randomPort(min = 5000, max = 7000): number {
  return parseInt((Math.random() * (max - min) + min).toFixed())
}
