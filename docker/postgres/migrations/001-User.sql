DROP TRIGGER IF EXISTS users_assign_user_role ON users;
DROP FUNCTION IF EXISTS users_assign_user_role();
DROP TABLE IF EXISTS users;

CREATE TABLE users
(
    id            uuid         DEFAULT gen_random_uuid() PRIMARY KEY,
    email         VARCHAR(255) NOT NULL UNIQUE,
    username      VARCHAR(255) NOT NULL UNIQUE,
    password      VARCHAR(255) NOT NULL,
    refresh_token VARCHAR(255) DEFAULT NULL
);

CREATE FUNCTION users_assign_user_role()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    INSERT INTO user_roles (user_id, role_name)
    VALUES (NEW.id, 'USER');
    RETURN NEW;
END
$$;

CREATE TRIGGER users_assign_user_role
    AFTER INSERT
    ON users
    FOR EACH ROW
EXECUTE PROCEDURE users_assign_user_role();
