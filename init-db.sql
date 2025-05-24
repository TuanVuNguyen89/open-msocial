-- Create databases for different services
CREATE DATABASE IF NOT EXISTS oms_identity;
CREATE DATABASE IF NOT EXISTS oms_user;
CREATE DATABASE IF NOT EXISTS oms_media;

-- Grant permissions
GRANT ALL PRIVILEGES ON oms_identity.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON oms_user.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON oms_media.* TO 'root'@'%';
FLUSH PRIVILEGES;