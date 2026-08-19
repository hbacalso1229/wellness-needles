import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BAKED_LOCATIONS,
  firstNameOnly,
  parseLocationDisplay,
} from './email-brand'

describe('parseLocationDisplay', () => {
  it('formats Celbridge as street then town, county, Eircode', () => {
    const parsed = parseLocationDisplay('Celbridge', BAKED_LOCATIONS)
    assert.ok(parsed)
    assert.equal(parsed.town, 'Celbridge')
    assert.equal(parsed.address, '56 The Orchard, Oldtown Mill\nCelbridge, Co. Kildare W23 K603')
  })

  it('formats Carlow with street and postcode', () => {
    const parsed = parseLocationDisplay('Carlow', BAKED_LOCATIONS)
    assert.ok(parsed)
    assert.equal(parsed.town, 'Carlow')
    assert.match(parsed.address, /16 Kennedy St/)
    assert.match(parsed.address, /R93 H2X8/)
  })
})

describe('firstNameOnly', () => {
  it('keeps the first token of a full name', () => {
    assert.equal(firstNameOnly('Aoife Byrne'), 'Aoife')
    assert.equal(firstNameOnly('  Aoife  '), 'Aoife')
    assert.equal(firstNameOnly(''), '')
  })
})
