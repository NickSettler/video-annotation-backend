DROP TABLE IF EXISTS video;

CREATE TABLE video
(
    id         uuid    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    filename   varchar NOT NULL,
    width      int     NOT NULL,
    height     int     NOT NULL,
    fps        float   NOT NULL,
    bitrate    int     NOT NULL,
    codec      varchar NOT NULL,
    aspect_x   int     NOT NULL,
    aspect_y   int     NOT NULL,
    created_by uuid    NOT NULL,
    created_at timestamp        DEFAULT now(),
    foreign key (created_by) references users (id) ON UPDATE CASCADE ON DELETE RESTRICT
);
