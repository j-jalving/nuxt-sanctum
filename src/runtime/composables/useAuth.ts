import { useState } from '#app'
import { type Auth } from '../../types'

export function useAuth () {
  return useState('auth').value as Auth
}