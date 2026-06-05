export const ok = (res, data = null, message = 'success', code = 200) => {
  res.json({ code, message, data })
}

export const fail = (res, message = 'error', code = 50000, data = null, status = 200) => {
  res.status(status).json({ code, message, data })
}
