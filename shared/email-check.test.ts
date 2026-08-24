import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  checkEmailLocal,
  emailCheckMessage,
  isValidEmailFormat,
  levenshtein,
  parseEmailAddress,
} from './email-check'

describe('parseEmailAddress', () => {
  it('accepts a normal address and lowercases the domain', () => {
    assert.deepEqual(parseEmailAddress('  Mary.F@Gmail.COM  '), {
      local: 'Mary.F',
      domain: 'gmail.com',
    })
  })

  it('rejects missing at, spaces, short TLD, and consecutive dots', () => {
    assert.equal(parseEmailAddress('not-an-email'), null)
    assert.equal(parseEmailAddress('a b@gmail.com'), null)
    assert.equal(parseEmailAddress('a@b.c'), null)
    assert.equal(parseEmailAddress('a@gmail..com'), null)
    assert.equal(parseEmailAddress('a@.gmail.com'), null)
  })
})

describe('checkEmailLocal', () => {
  it('accepts gmail.com and irish consumer domains', () => {
    assert.equal(checkEmailLocal('patient@gmail.com').ok, true)
    assert.equal(checkEmailLocal('patient@live.ie').ok, true)
    assert.equal(isValidEmailFormat('patient@outlook.ie'), true)
  })

  it('still accepts a well-formed Gmail that may not exist', () => {
    assert.equal(checkEmailLocal('maryfinno@gmail.com').ok, true)
  })

  it('suggests gmail.com for common typos', () => {
    const gamil = checkEmailLocal('mary@gamil.com')
    assert.equal(gamil.ok, false)
    assert.equal(gamil.ok === false && gamil.reason === 'typo', true)
    if (gamil.ok === false && gamil.reason === 'typo') {
      assert.equal(gamil.suggestion, 'mary@gmail.com')
    }
    const gmial = checkEmailLocal('mary@gmial.com')
    assert.equal(gmial.ok, false)
    if (gmial.ok === false && gmial.reason === 'typo') {
      assert.equal(gmial.suggestion, 'mary@gmail.com')
    }
  })

  it('returns format for empty-like junk', () => {
    const result = checkEmailLocal('not-an-email')
    assert.deepEqual(result, { ok: false, reason: 'format' })
  })
})

describe('emailCheckMessage', () => {
  it('uses the plan copy for typo and mx', () => {
    assert.equal(
      emailCheckMessage({ reason: 'typo', suggestion: 'mary@gmail.com' }),
      'Check the email domain. Did you mean mary@gmail.com?'
    )
    assert.equal(
      emailCheckMessage({ reason: 'mx' }),
      'This email domain cannot receive mail. Please check the spelling.'
    )
  })
})

describe('levenshtein', () => {
  it('counts a transpose as two edits', () => {
    assert.equal(levenshtein('gamil.com', 'gmail.com'), 2)
    assert.equal(levenshtein('gmail.com', 'gmail.com'), 0)
  })
})
