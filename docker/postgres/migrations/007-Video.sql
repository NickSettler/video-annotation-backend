DROP TABLE IF EXISTS video;

CREATE TABLE videos
(
    id         uuid      NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name       varchar   NOT NULL,
    filename   varchar,
    poster_id  uuid,
    width      int,
    height     int,
    fps        float,
    bitrate    int,
    codec      varchar,
    aspect_x   int,
    aspect_y   int,
    created_by uuid      NOT NULL,
    created_at timestamp NOT NULL DEFAULT now(),
    foreign key (created_by) references users (id) ON UPDATE CASCADE ON DELETE RESTRICT
);
