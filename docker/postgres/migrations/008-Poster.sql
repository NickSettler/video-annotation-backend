DROP TABLE IF EXISTS poster;

CREATE TABLE posters
(
    id       uuid    NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    video_id uuid    NOT NULL,
    "order"    integer NOT NULL,
    filename varchar NOT NULL,
    foreign key (video_id) references videos (id) ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE videos
    ADD FOREIGN KEY (poster_id) REFERENCES posters (id) ON UPDATE CASCADE ON DELETE SET NULL;
