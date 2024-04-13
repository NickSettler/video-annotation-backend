export enum E_DB_TABLES {
  USERS = 'users',
  USER_ROLES = 'user_roles',
  ROLES = 'roles',
  WORKSPACES = 'workspaces',
  VIDEOS = 'videos',
  POSTERS = 'posters',
  PROJECTS = 'projects',
}

export enum E_CUSTOM_ERROR_CODES {}

export const defaultCustomMessages: Record<E_CUSTOM_ERROR_CODES, string> = {};

export enum E_POSTGRES_ERROR_CODES {
  UNIQUE_CONSTRAINT = '23505',
  INVALID_TEXT_REPRESENTATION = '22P02',
  FOREIGN_KEY_VIOLATION = '23503',
  STRING_DATA_RIGHT_TRUNCATION = '22001',
}
