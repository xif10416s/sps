/*
 Navicat Premium Data Transfer

 Source Server         : localmysql
 Source Server Type    : MySQL
 Source Server Version : 80026
 Source Host           : localhost:3306
 Source Schema         : sps_battles

 Target Server Type    : MySQL
 Target Server Version : 80026
 File Encoding         : 65001

 Date: 21/12/2021 20:21:25
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for battle_history
-- ----------------------------
-- DROP TABLE IF EXISTS `battle_history`;
CREATE TABLE `battle_history_raw`  (
  `battle_queue_id` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summoner_id` int(0) NOT NULL,
  `summoner_level` tinyint(0) NOT NULL,
  `monster_1_id` int(0) NOT NULL,
  `monster_1_level` tinyint(0) NOT NULL,
  `monster_1_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_2_id` int(0)  NULL,
  `monster_2_level` tinyint(0)  NULL,
  `monster_2_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_3_id` int(0)  NULL,
  `monster_3_level` tinyint(0)  NULL,
  `monster_3_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_4_id` int(0)  NULL,
  `monster_4_level` tinyint(0)  NULL,
  `monster_4_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_5_id` int(0)  NULL,
  `monster_5_level` tinyint(0)  NULL,
  `monster_5_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_6_id` int(0)  NULL,
  `monster_6_level` tinyint(0)  NULL,
  `monster_6_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `created_date` varchar(25) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `created_date_day` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `match_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mana_cap` int(0) NOT NULL,
  `ruleset` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `inactive` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `player_rating_initial` int(0) NOT NULL,
  `player_rating_final` int(0) NOT NULL,
  `winner` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `battle_queue_id_lost` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summoner_id_lost` int(0) NOT NULL,
  `summoner_level_lost` tinyint(0) NOT NULL,
  `monster_1_id_lost` int(0) NOT NULL,
  `monster_1_level_lost` tinyint(0) NOT NULL,
  `monster_1_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_2_id_lost` int(0)  NULL,
  `monster_2_level_lost` tinyint(0)  NULL,
  `monster_2_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_3_id_lost` int(0)  NULL,
  `monster_3_level_lost` tinyint(0)  NULL,
  `monster_3_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_4_id_lost` int(0)  NULL,
  `monster_4_level_lost` tinyint(0)  NULL,
  `monster_4_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_5_id_lost` int(0)  NULL,
  `monster_5_level_lost` tinyint(0)  NULL,
  `monster_5_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_6_id_lost` int(0)  NULL,
  `monster_6_level_lost` tinyint(0)  NULL,
  `monster_6_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `player_rating_initial_lost` int(0) NOT NULL,
  `player_rating_final_lost` int(0) NOT NULL,
  `loser` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `insert_time` datetime(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`battle_queue_id`) USING BTREE,
  INDEX `index_created_date_day`(`created_date_day`) USING BTREE,
  INDEX `index_ruleset`(`ruleset`) USING BTREE,
  INDEX `index_mana_cap`(`mana_cap`) USING BTREE,
  INDEX `index_lost_team`(`summoner_id_lost`,`monster_1_id_lost`,`monster_2_id_lost`,`monster_3_id_lost`,`monster_4_id_lost`,`monster_5_id_lost`,`monster_6_id_lost`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;


ALTER USER 'root'@'localhost' IDENTIFIED BY '123456' PASSWORD EXPIRE NEVER;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '123456';

SET FOREIGN_KEY_CHECKS = 1;

