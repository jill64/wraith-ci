import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  user: UserTable
  repo: RepoTable
}

type Auto<T> = ColumnType<T, never, never>
type Immutable<T> = ColumnType<T, T, never>

type ID = number
// type Slug = string
// type S3Key = string

type Unique<T> = T
type CombinedUnique<T> = T
// type Index<T> = T

interface Metadata {
  id: Auto<ID> // Primary Key
  created_at: Immutable<string>
  updated_at: string
  created_by: Immutable<ID>
  updated_by: ID
}

export interface UserTable extends Metadata {
  github_user_id: Unique<Immutable<number>>
  plan_cache: 'FREE' | 'STARTER' | 'PRO'
  plan_cached_at: string
  npm_token?: string
}

export interface RepoTable extends Metadata {
  github_repo_id: Unique<Immutable<number>>

  // Record<string, string>
  encrypted_envs?: string

  // string[]
  ignore_ghosts?: string
}

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>

export type Repo = Selectable<RepoTable>
export type NewRepo = Insertable<RepoTable>
export type RepoUpdate = Updateable<RepoTable>
