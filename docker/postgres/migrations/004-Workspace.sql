DROP TABLE IF EXISTS workspaces;

CREATE TABLE workspaces
(
    id         uuid    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name       varchar NOT NULL,
    created_by uuid    NOT NULL,
    created_at timestamp        DEFAULT now(),
    foreign key (created_by) references users (id) ON UPDATE CASCADE ON DELETE RESTRICT
);

