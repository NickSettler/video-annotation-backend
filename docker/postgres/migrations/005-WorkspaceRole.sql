DROP TABLE IF EXISTS workspace_role;

CREATE TABLE workspace_role
(
    name        VARCHAR(255) NOT NULL PRIMARY KEY
);

INSERT INTO workspace_role (name) VALUES ('READER'), ('WRITER');
