DROP TABLE IF EXISTS workspace_member;

CREATE TABLE workspace_member
(
    workspace_id uuid         NOT NULL REFERENCES workspaces (id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id      uuid         NOT NULL REFERENCES users (id) ON UPDATE CASCADE ON DELETE CASCADE,
    role_name    varchar(255) NOT NULL REFERENCES workspace_role (name) ON UPDATE CASCADE ON DELETE RESTRICT,
    primary key (workspace_id, user_id)
);
