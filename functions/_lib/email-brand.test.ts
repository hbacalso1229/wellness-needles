import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  BAKED_LOCATIONS,
  firstNameOnly,
  parseLocationDisplay,
  emailShell,
  SITE,
} from './email-brand'
import { ORIGINAL_WORDMARK, NEW_ICON } from '../../shared/brand-logos'

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

describe('emailShell logo', () => {
  const shellArgs = {
    title: 'Hello',
    introHtml: 'Intro',
    rowsHtml: '',
  }

  it('defaults to the original live wordmark', () => {
    const html = emailShell(shellArgs)
    assert.match(html, new RegExp(`${SITE}${ORIGINAL_WORDMARK}`.replace(/\./g, '\\.')))
    assert.doesNotMatch(html, new RegExp(NEW_ICON.replace(/\./g, '\\.')))
  })

  it('uses the new clinic icon when logoUrl is passed', () => {
    const html = emailShell({
      ...shellArgs,
      logoUrl: `${SITE}${NEW_ICON}`,
    })
    assert.match(html, new RegExp(`${SITE}${NEW_ICON}`.replace(/\./g, '\\.')))
  })
})
