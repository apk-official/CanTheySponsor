import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('https://api.postcodes.io/postcodes/:postcode', ({ params }) => {
    if (params.postcode === 'SW1A1AA') {
      return HttpResponse.json({
        result: { latitude: 51.501, longitude: -0.141 },
      })
    }
    return HttpResponse.json({ result: null }, { status: 404 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('postcodes.io geocoding', () => {
  it('returns lat/lng for a valid postcode', async () => {
    const res = await fetch('https://api.postcodes.io/postcodes/SW1A1AA')
    const data = await res.json()
    expect(data.result.latitude).toBe(51.501)
    expect(data.result.longitude).toBe(-0.141)
  })

  it('returns 404 for an invalid postcode', async () => {
    const res = await fetch('https://api.postcodes.io/postcodes/INVALID')
    expect(res.status).toBe(404)
  })
})