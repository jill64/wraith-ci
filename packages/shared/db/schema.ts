import type { ColumnType, Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  team: TeamTable
  user: UserTable
  r_user_team: RUserTeamTable
  cluster: ClusterTable
  branch: BranchTable
  protected_branch: ProtectedBranchTable
  c_team_usage: CTeamUsageTable
}

type Auto<T> = ColumnType<T, never, never>
type Immutable<T> = ColumnType<T, T, never>

type ID = number
type Slug = string
type S3Key = string

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

export interface TeamTable extends Metadata {
  name: Unique<Immutable<Slug>>
  invitation_id: Unique<Immutable<Slug>>
  profile_image_key: S3Key
  payment_manager_id: number
}

export interface UserTable extends Metadata {
  oauth_id: Unique<Immutable<string>>
  slug: Unique<Slug>
  name: string
  profile_image_key: S3Key
  plan_cache: 'FREE' | 'STARTER' | 'PRO'
  plan_cached_at: string
  picture?: string
  picture_cached_at?: string
  api_key_hash?: string
}

export interface RUserTeamTable extends Metadata {
  user_id: CombinedUnique<Immutable<ID>>
  team_name: CombinedUnique<Immutable<Slug>>
  role: 'ADMIN' | 'MEMBER'
}

export interface ClusterTable extends Metadata {
  name: CombinedUnique<Immutable<Slug>>
  team_name: CombinedUnique<Immutable<Slug>>
}

export interface BranchTable extends Metadata {
  team_name: CombinedUnique<Immutable<Slug>>
  cluster_name: CombinedUnique<Immutable<Slug>>
  name: CombinedUnique<Immutable<Slug>>
  read_rows_in_month: number
  write_rows_in_month: number
  storage_byte: number
}

export interface ProtectedBranchTable extends Metadata {
  team_name: CombinedUnique<Immutable<Slug>>
  cluster_name: CombinedUnique<Immutable<Slug>>
  branch_name: CombinedUnique<Immutable<Slug>>
}

export interface CTeamUsageTable extends Metadata {
  team_name: Unique<Slug>
  sum_read_rows_in_month: number
  sum_write_rows_in_month: number
  sum_storage_byte: number
}

export type Team = Selectable<TeamTable>
export type NewTeam = Insertable<TeamTable>
export type TeamUpdate = Updateable<TeamTable>

export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>

export type UserTeam = Selectable<RUserTeamTable>
export type NewUserTeam = Insertable<RUserTeamTable>
export type UserTeamUpdate = Updateable<RUserTeamTable>

export type Cluster = Selectable<ClusterTable>
export type NewCluster = Insertable<ClusterTable>
export type ClusterUpdate = Updateable<ClusterTable>

export type ProtectedBranch = Selectable<ProtectedBranchTable>
export type NewProtectedBranch = Insertable<ProtectedBranchTable>
export type ProtectedBranchUpdate = Updateable<ProtectedBranchTable>

export type CTeamUsage = Selectable<CTeamUsageTable>
export type NewCTeamUsage = Insertable<CTeamUsageTable>
export type CTeamUsageUpdate = Updateable<CTeamUsageTable>
