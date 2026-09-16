function format(time: Date) {
  const kst = new Date(time.getTime() + 9 * 60 * 60 * 1000)
  const month = (kst.getUTCMonth() + 1).toString()
  const date = kst.getUTCDate().toString()
  const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']
  const day = WEEKDAY[kst.getUTCDay()]
  const hour = kst.getUTCHours().toString().padStart(2, '0')
  const minute = kst.getUTCMinutes().toString().padStart(2, '0')

  return `${month}/${date}(${day}) ${hour}:${minute}`
}

export {
  format,
}
