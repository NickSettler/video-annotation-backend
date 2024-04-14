DROP TABLE IF EXISTS projects;

CREATE TABLE projects
(
    id          uuid      NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name        varchar   NOT NULL,
    video_id    uuid      NOT NULL,
    annotations jsonb     DEFAULT NULL,
    created_by  uuid      NOT NULL,
    created_at  timestamp NOT NULL DEFAULT now(),
    foreign key (video_id) references videos (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    foreign key (created_by) references users (id) ON UPDATE CASCADE ON DELETE RESTRICT
);
