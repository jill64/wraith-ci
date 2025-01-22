export const match = (value: string) =>
  value.match(/^[\-\w]+$/) && value.length <= 255
