SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;

SET NAMES utf8mb4;

CREATE TABLE `tcr_danmaku` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vid` text NOT NULL,
  `author` text NULL,
  `color` text NOT NULL,
  `text` text NOT NULL,
  `time` float NOT NULL,
  `type` text NOT NULL,
  `metadata` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tcr_user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` char(26) NOT NULL UNIQUE,
  `name` text NOT NULL,
  `email` text NOT NULL,
  `following` text NOT NULL,
  `followed_count` int NOT NULL DEFAULT 0,
  `collection` text NOT NULL,
  `avatar_url` text NOT NULL,
  `metadata` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `tcr_library` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fid` char(32) NOT NULL UNIQUE,
  `pid` char(32) NOT NULL,
  `publisher` text NOT NULL,
  `time` int NOT NULL,
  `type` text NOT NULL,
  `tag` text NOT NULL,
  `brief` text NOT NULL,
  `url` text NOT NULL,
  `visit_count` int NOT NULL DEFAULT 0,
  `download_count` int NOT NULL DEFAULT 0,
  `like_count` int NOT NULL DEFAULT 0,
  `collect_count` int NOT NULL DEFAULT 0,
  `poster` mediumtext NULL,
  `metadata` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;