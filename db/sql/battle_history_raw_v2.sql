/*
 Navicat Premium Data Transfer

 Source Server         : dev_oss_db
 Source Server Type    : MySQL
 Source Server Version : 50730
 Source Host           : 10.100.3.27:3306
 Source Schema         : demo_test

 Target Server Type    : MySQL
 Target Server Version : 50730
 File Encoding         : 65001

 Date: 27/12/2021 14:31:34
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for battle_history_raw
-- ----------------------------
-- DROP TABLE IF EXISTS `battle_history_raw_v2`;
CREATE TABLE `battle_history_raw_v2`  (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `battle_queue_id` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summoner_id` int(11) NOT NULL,
  `summoner_level` tinyint(4) NOT NULL,
  `monster_1_id` int(11) NOT NULL,
  `monster_1_level` tinyint(4) NOT NULL,
  `monster_1_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_2_id` int(11) NULL DEFAULT NULL,
  `monster_2_level` tinyint(4) NULL DEFAULT NULL,
  `monster_2_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_3_id` int(11) NULL DEFAULT NULL,
  `monster_3_level` tinyint(4) NULL DEFAULT NULL,
  `monster_3_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_4_id` int(11) NULL DEFAULT NULL,
  `monster_4_level` tinyint(4) NULL DEFAULT NULL,
  `monster_4_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_5_id` int(11) NULL DEFAULT NULL,
  `monster_5_level` tinyint(4) NULL DEFAULT NULL,
  `monster_5_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_6_id` int(11) NULL DEFAULT NULL,
  `monster_6_level` tinyint(4) NULL DEFAULT NULL,
  `monster_6_abilities` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `created_date` varchar(25) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `created_date_day` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `match_type` varchar(20) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `mana_cap` int(11) NOT NULL,
  `ruleset` varchar(80) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `inactive` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `player_rating_initial` int(11) NOT NULL,
  `player_rating_final` int(11) NOT NULL,
  `winner` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `battle_queue_id_lost` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summoner_id_lost` int(11) NOT NULL,
  `summoner_level_lost` tinyint(4) NOT NULL,
  `monster_1_id_lost` int(11) NOT NULL,
  `monster_1_level_lost` tinyint(4) NOT NULL,
  `monster_1_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_2_id_lost` int(11) NULL DEFAULT NULL,
  `monster_2_level_lost` tinyint(4) NULL DEFAULT NULL,
  `monster_2_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_3_id_lost` int(11) NULL DEFAULT NULL,
  `monster_3_level_lost` tinyint(4) NULL DEFAULT NULL,
  `monster_3_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_4_id_lost` int(11) NULL DEFAULT NULL,
  `monster_4_level_lost` tinyint(4) NULL DEFAULT NULL,
  `monster_4_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_5_id_lost` int(11) NULL DEFAULT NULL,
  `monster_5_level_lost` tinyint(4) NULL DEFAULT NULL,
  `monster_5_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `monster_6_id_lost` int(11) NULL DEFAULT NULL,
  `monster_6_level_lost` tinyint(4) NULL DEFAULT NULL,
  `monster_6_abilities_lost` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
  `player_rating_initial_lost` int(11) NOT NULL,
  `player_rating_final_lost` int(11) NOT NULL,
  `loser` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`id`,`created_date_day`) USING BTREE,
  INDEX `index_lost_team`(`summoner_id_lost`, `monster_1_id_lost`, `monster_2_id_lost`, `monster_3_id_lost`, `monster_4_id_lost`, `monster_5_id_lost`, `monster_6_id_lost`) USING BTREE,
  INDEX `index_mana_sum_rule`(`mana_cap`, `summoner_id`, `ruleset`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic ;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE `battle_history_raw_v2` ADD UNIQUE (`battle_queue_id`,`created_date_day`);

alter table battle_history_raw_v2 partition by range columns(created_date_day)(
	partition p20211205 values less than('2021-12-05')
);

alter table battle_history_raw_v2 add partition (partition p20211206 values less than('2021-12-06'));
alter table battle_history_raw_v2 add partition (partition p20211207 values less than('2021-12-07'));
alter table battle_history_raw_v2 add partition (partition p20211208 values less than('2021-12-08'));
alter table battle_history_raw_v2 add partition (partition p20211209 values less than('2021-12-09'));
alter table battle_history_raw_v2 add partition (partition p20211210 values less than('2021-12-10'));
alter table battle_history_raw_v2 add partition (partition p20211211 values less than('2021-12-11'));
alter table battle_history_raw_v2 add partition (partition p20211212 values less than('2021-12-12'));
alter table battle_history_raw_v2 add partition (partition p20211213 values less than('2021-12-13'));
alter table battle_history_raw_v2 add partition (partition p20211214 values less than('2021-12-14'));
alter table battle_history_raw_v2 add partition (partition p20211215 values less than('2021-12-15'));
alter table battle_history_raw_v2 add partition (partition p20211216 values less than('2021-12-16'));
alter table battle_history_raw_v2 add partition (partition p20211217 values less than('2021-12-17'));
alter table battle_history_raw_v2 add partition (partition p20211218 values less than('2021-12-18'));
alter table battle_history_raw_v2 add partition (partition p20211219 values less than('2021-12-19'));
alter table battle_history_raw_v2 add partition (partition p20211220 values less than('2021-12-20'));
alter table battle_history_raw_v2 add partition (partition p20211221 values less than('2021-12-21'));
alter table battle_history_raw_v2 add partition (partition p20211222 values less than('2021-12-22'));
alter table battle_history_raw_v2 add partition (partition p20211223 values less than('2021-12-23'));
alter table battle_history_raw_v2 add partition (partition p20211224 values less than('2021-12-24'));
alter table battle_history_raw_v2 add partition (partition p20211225 values less than('2021-12-25'));
alter table battle_history_raw_v2 add partition (partition p20211226 values less than('2021-12-26'));
alter table battle_history_raw_v2 add partition (partition p20211227 values less than('2021-12-27'));
alter table battle_history_raw_v2 add partition (partition p20211228 values less than('2021-12-28'));
alter table battle_history_raw_v2 add partition (partition p20211229 values less than('2021-12-29'));
alter table battle_history_raw_v2 add partition (partition p20211230 values less than('2021-12-30'));
alter table battle_history_raw_v2 add partition (partition p20211231 values less than('2021-12-31'));
alter table battle_history_raw_v2 add partition (partition p20220101 values less than('2022-01-01'));
alter table battle_history_raw_v2 add partition (partition p20220102 values less than('2022-01-02'));
alter table battle_history_raw_v2 add partition (partition p20220103 values less than('2022-01-03'));
alter table battle_history_raw_v2 add partition (partition p20220104 values less than('2022-01-04'));
alter table battle_history_raw_v2 add partition (partition p20220105 values less than('2022-01-05'));
alter table battle_history_raw_v2 add partition (partition p20220106 values less than('2022-01-06'));
alter table battle_history_raw_v2 add partition (partition p20220107 values less than('2022-01-07'));
alter table battle_history_raw_v2 add partition (partition p20220108 values less than('2022-01-08'));
alter table battle_history_raw_v2 add partition (partition p20220109 values less than('2022-01-09'));
alter table battle_history_raw_v2 add partition (partition p20220110 values less than('2022-01-10'));
alter table battle_history_raw_v2 add partition (partition p20220111 values less than('2022-01-11'));
alter table battle_history_raw_v2 add partition (partition p20220112 values less than('2022-01-12'));
alter table battle_history_raw_v2 add partition (partition p20220113 values less than('2022-01-13'));
alter table battle_history_raw_v2 add partition (partition p20220114 values less than('2022-01-14'));
alter table battle_history_raw_v2 add partition (partition p20220115 values less than('2022-01-15'));
alter table battle_history_raw_v2 add partition (partition p20220116 values less than('2022-01-16'));
alter table battle_history_raw_v2 add partition (partition p20220117 values less than('2022-01-17'));
alter table battle_history_raw_v2 add partition (partition p20220118 values less than('2022-01-18'));
alter table battle_history_raw_v2 add partition (partition p20220119 values less than('2022-01-19'));
alter table battle_history_raw_v2 add partition (partition p20220120 values less than('2022-01-20'));
alter table battle_history_raw_v2 add partition (partition p20220121 values less than('2022-01-21'));
alter table battle_history_raw_v2 add partition (partition p20220122 values less than('2022-01-22'));
alter table battle_history_raw_v2 add partition (partition p20220123 values less than('2022-01-23'));
alter table battle_history_raw_v2 add partition (partition p20220124 values less than('2022-01-24'));
alter table battle_history_raw_v2 add partition (partition p20220125 values less than('2022-01-25'));
alter table battle_history_raw_v2 add partition (partition p20220126 values less than('2022-01-26'));
alter table battle_history_raw_v2 add partition (partition p20220127 values less than('2022-01-27'));
alter table battle_history_raw_v2 add partition (partition p20220128 values less than('2022-01-28'));
alter table battle_history_raw_v2 add partition (partition p20220129 values less than('2022-01-29'));
alter table battle_history_raw_v2 add partition (partition p20220130 values less than('2022-01-30'));
alter table battle_history_raw_v2 add partition (partition p20220131 values less than('2022-01-31'));
alter table battle_history_raw_v2 add partition (partition p20220201 values less than('2022-02-01'));
alter table battle_history_raw_v2 add partition (partition p20220202 values less than('2022-02-02'));
alter table battle_history_raw_v2 add partition (partition p20220203 values less than('2022-02-03'));
alter table battle_history_raw_v2 add partition (partition p20220204 values less than('2022-02-04'));
alter table battle_history_raw_v2 add partition (partition p20220205 values less than('2022-02-05'));
alter table battle_history_raw_v2 add partition (partition p20220206 values less than('2022-02-06'));
alter table battle_history_raw_v2 add partition (partition p20220207 values less than('2022-02-07'));
alter table battle_history_raw_v2 add partition (partition p20220208 values less than('2022-02-08'));
alter table battle_history_raw_v2 add partition (partition p20220209 values less than('2022-02-09'));
alter table battle_history_raw_v2 add partition (partition p20220210 values less than('2022-02-10'));
alter table battle_history_raw_v2 add partition (partition p20220211 values less than('2022-02-11'));
alter table battle_history_raw_v2 add partition (partition p20220212 values less than('2022-02-12'));
alter table battle_history_raw_v2 add partition (partition p20220213 values less than('2022-02-13'));
alter table battle_history_raw_v2 add partition (partition p20220214 values less than('2022-02-14'));
alter table battle_history_raw_v2 add partition (partition p20220215 values less than('2022-02-15'));
alter table battle_history_raw_v2 add partition (partition p20220216 values less than('2022-02-16'));
alter table battle_history_raw_v2 add partition (partition p20220217 values less than('2022-02-17'));
alter table battle_history_raw_v2 add partition (partition p20220218 values less than('2022-02-18'));
alter table battle_history_raw_v2 add partition (partition p20220219 values less than('2022-02-19'));
alter table battle_history_raw_v2 add partition (partition p20220220 values less than('2022-02-20'));
alter table battle_history_raw_v2 add partition (partition p20220221 values less than('2022-02-21'));
alter table battle_history_raw_v2 add partition (partition p20220222 values less than('2022-02-22'));
alter table battle_history_raw_v2 add partition (partition p20220223 values less than('2022-02-23'));
alter table battle_history_raw_v2 add partition (partition p20220224 values less than('2022-02-24'));
alter table battle_history_raw_v2 add partition (partition p20220225 values less than('2022-02-25'));
alter table battle_history_raw_v2 add partition (partition p20220226 values less than('2022-02-26'));
alter table battle_history_raw_v2 add partition (partition p20220227 values less than('2022-02-27'));
alter table battle_history_raw_v2 add partition (partition p20220228 values less than('2022-02-28'));
alter table battle_history_raw_v2 add partition (partition p20220301 values less than('2022-03-01'));
alter table battle_history_raw_v2 add partition (partition p20220302 values less than('2022-03-02'));
alter table battle_history_raw_v2 add partition (partition p20220303 values less than('2022-03-03'));
alter table battle_history_raw_v2 add partition (partition p20220304 values less than('2022-03-04'));
alter table battle_history_raw_v2 add partition (partition p20220305 values less than('2022-03-05'));
alter table battle_history_raw_v2 add partition (partition p20220306 values less than('2022-03-06'));
alter table battle_history_raw_v2 add partition (partition p20220307 values less than('2022-03-07'));
alter table battle_history_raw_v2 add partition (partition p20220308 values less than('2022-03-08'));
alter table battle_history_raw_v2 add partition (partition p20220309 values less than('2022-03-09'));
alter table battle_history_raw_v2 add partition (partition p20220310 values less than('2022-03-10'));
alter table battle_history_raw_v2 add partition (partition p20220311 values less than('2022-03-11'));
alter table battle_history_raw_v2 add partition (partition p20220312 values less than('2022-03-12'));
alter table battle_history_raw_v2 add partition (partition p20220313 values less than('2022-03-13'));
alter table battle_history_raw_v2 add partition (partition p20220314 values less than('2022-03-14'));
alter table battle_history_raw_v2 add partition (partition p20220315 values less than('2022-03-15'));
alter table battle_history_raw_v2 add partition (partition p20220316 values less than('2022-03-16'));
alter table battle_history_raw_v2 add partition (partition p20220317 values less than('2022-03-17'));
alter table battle_history_raw_v2 add partition (partition p20220318 values less than('2022-03-18'));
alter table battle_history_raw_v2 add partition (partition p20220319 values less than('2022-03-19'));
alter table battle_history_raw_v2 add partition (partition p20220320 values less than('2022-03-20'));
alter table battle_history_raw_v2 add partition (partition p20220321 values less than('2022-03-21'));
alter table battle_history_raw_v2 add partition (partition p20220322 values less than('2022-03-22'));
alter table battle_history_raw_v2 add partition (partition p20220323 values less than('2022-03-23'));
alter table battle_history_raw_v2 add partition (partition p20220324 values less than('2022-03-24'));
alter table battle_history_raw_v2 add partition (partition p20220325 values less than('2022-03-25'));
alter table battle_history_raw_v2 add partition (partition p20220326 values less than('2022-03-26'));
alter table battle_history_raw_v2 add partition (partition p20220327 values less than('2022-03-27'));
alter table battle_history_raw_v2 add partition (partition p20220328 values less than('2022-03-28'));
alter table battle_history_raw_v2 add partition (partition p20220329 values less than('2022-03-29'));
alter table battle_history_raw_v2 add partition (partition p20220330 values less than('2022-03-30'));
alter table battle_history_raw_v2 add partition (partition p20220331 values less than('2022-03-31'));
alter table battle_history_raw_v2 add partition (partition p20220401 values less than('2022-04-01'));
alter table battle_history_raw_v2 add partition (partition p20220402 values less than('2022-04-02'));
alter table battle_history_raw_v2 add partition (partition p20220403 values less than('2022-04-03'));
alter table battle_history_raw_v2 add partition (partition p20220404 values less than('2022-04-04'));
alter table battle_history_raw_v2 add partition (partition p20220405 values less than('2022-04-05'));
alter table battle_history_raw_v2 add partition (partition p20220406 values less than('2022-04-06'));
alter table battle_history_raw_v2 add partition (partition p20220407 values less than('2022-04-07'));
alter table battle_history_raw_v2 add partition (partition p20220408 values less than('2022-04-08'));
alter table battle_history_raw_v2 add partition (partition p20220409 values less than('2022-04-09'));
alter table battle_history_raw_v2 add partition (partition p20220410 values less than('2022-04-10'));
alter table battle_history_raw_v2 add partition (partition p20220411 values less than('2022-04-11'));
alter table battle_history_raw_v2 add partition (partition p20220412 values less than('2022-04-12'));
alter table battle_history_raw_v2 add partition (partition p20220413 values less than('2022-04-13'));
alter table battle_history_raw_v2 add partition (partition p20220414 values less than('2022-04-14'));
alter table battle_history_raw_v2 add partition (partition p20220415 values less than('2022-04-15'));
alter table battle_history_raw_v2 add partition (partition p20220416 values less than('2022-04-16'));
alter table battle_history_raw_v2 add partition (partition p20220417 values less than('2022-04-17'));
alter table battle_history_raw_v2 add partition (partition p20220418 values less than('2022-04-18'));
alter table battle_history_raw_v2 add partition (partition p20220419 values less than('2022-04-19'));
alter table battle_history_raw_v2 add partition (partition p20220420 values less than('2022-04-20'));
alter table battle_history_raw_v2 add partition (partition p20220421 values less than('2022-04-21'));
alter table battle_history_raw_v2 add partition (partition p20220422 values less than('2022-04-22'));
alter table battle_history_raw_v2 add partition (partition p20220423 values less than('2022-04-23'));
alter table battle_history_raw_v2 add partition (partition p20220424 values less than('2022-04-24'));
alter table battle_history_raw_v2 add partition (partition p20220425 values less than('2022-04-25'));
alter table battle_history_raw_v2 add partition (partition p20220426 values less than('2022-04-26'));
alter table battle_history_raw_v2 add partition (partition p20220427 values less than('2022-04-27'));
alter table battle_history_raw_v2 add partition (partition p20220428 values less than('2022-04-28'));
alter table battle_history_raw_v2 add partition (partition p20220429 values less than('2022-04-29'));
alter table battle_history_raw_v2 add partition (partition p20220430 values less than('2022-04-30'));
alter table battle_history_raw_v2 add partition (partition p20220501 values less than('2022-05-01'));
alter table battle_history_raw_v2 add partition (partition p20220502 values less than('2022-05-02'));
alter table battle_history_raw_v2 add partition (partition p20220503 values less than('2022-05-03'));
alter table battle_history_raw_v2 add partition (partition p20220504 values less than('2022-05-04'));
alter table battle_history_raw_v2 add partition (partition p20220505 values less than('2022-05-05'));
alter table battle_history_raw_v2 add partition (partition p20220506 values less than('2022-05-06'));
alter table battle_history_raw_v2 add partition (partition p20220507 values less than('2022-05-07'));
alter table battle_history_raw_v2 add partition (partition p20220508 values less than('2022-05-08'));
alter table battle_history_raw_v2 add partition (partition p20220509 values less than('2022-05-09'));
alter table battle_history_raw_v2 add partition (partition p20220510 values less than('2022-05-10'));
alter table battle_history_raw_v2 add partition (partition p20220511 values less than('2022-05-11'));
alter table battle_history_raw_v2 add partition (partition p20220512 values less than('2022-05-12'));
alter table battle_history_raw_v2 add partition (partition p20220513 values less than('2022-05-13'));
alter table battle_history_raw_v2 add partition (partition p20220514 values less than('2022-05-14'));
alter table battle_history_raw_v2 add partition (partition p20220515 values less than('2022-05-15'));
alter table battle_history_raw_v2 add partition (partition p20220516 values less than('2022-05-16'));
alter table battle_history_raw_v2 add partition (partition p20220517 values less than('2022-05-17'));
alter table battle_history_raw_v2 add partition (partition p20220518 values less than('2022-05-18'));
alter table battle_history_raw_v2 add partition (partition p20220519 values less than('2022-05-19'));
alter table battle_history_raw_v2 add partition (partition p20220520 values less than('2022-05-20'));
alter table battle_history_raw_v2 add partition (partition p20220521 values less than('2022-05-21'));
alter table battle_history_raw_v2 add partition (partition p20220522 values less than('2022-05-22'));
alter table battle_history_raw_v2 add partition (partition p20220523 values less than('2022-05-23'));
alter table battle_history_raw_v2 add partition (partition p20220524 values less than('2022-05-24'));
alter table battle_history_raw_v2 add partition (partition p20220525 values less than('2022-05-25'));
alter table battle_history_raw_v2 add partition (partition p20220526 values less than('2022-05-26'));
alter table battle_history_raw_v2 add partition (partition p20220527 values less than('2022-05-27'));
alter table battle_history_raw_v2 add partition (partition p20220528 values less than('2022-05-28'));
alter table battle_history_raw_v2 add partition (partition p20220529 values less than('2022-05-29'));
alter table battle_history_raw_v2 add partition (partition p20220530 values less than('2022-05-30'));
alter table battle_history_raw_v2 add partition (partition p20220531 values less than('2022-05-31'));
alter table battle_history_raw_v2 add partition (partition p20220601 values less than('2022-06-01'));
alter table battle_history_raw_v2 add partition (partition p20220602 values less than('2022-06-02'));
alter table battle_history_raw_v2 add partition (partition p20220603 values less than('2022-06-03'));
alter table battle_history_raw_v2 add partition (partition p20220604 values less than('2022-06-04'));
alter table battle_history_raw_v2 add partition (partition p20220605 values less than('2022-06-05'));
alter table battle_history_raw_v2 add partition (partition p20220606 values less than('2022-06-06'));
alter table battle_history_raw_v2 add partition (partition p20220607 values less than('2022-06-07'));
alter table battle_history_raw_v2 add partition (partition p20220608 values less than('2022-06-08'));
alter table battle_history_raw_v2 add partition (partition p20220609 values less than('2022-06-09'));
alter table battle_history_raw_v2 add partition (partition p20220610 values less than('2022-06-10'));
alter table battle_history_raw_v2 add partition (partition p20220611 values less than('2022-06-11'));
alter table battle_history_raw_v2 add partition (partition p20220612 values less than('2022-06-12'));
alter table battle_history_raw_v2 add partition (partition p20220613 values less than('2022-06-13'));
alter table battle_history_raw_v2 add partition (partition p20220614 values less than('2022-06-14'));
alter table battle_history_raw_v2 add partition (partition p20220615 values less than('2022-06-15'));
alter table battle_history_raw_v2 add partition (partition p20220616 values less than('2022-06-16'));
alter table battle_history_raw_v2 add partition (partition p20220617 values less than('2022-06-17'));
alter table battle_history_raw_v2 add partition (partition p20220618 values less than('2022-06-18'));
alter table battle_history_raw_v2 add partition (partition p20220619 values less than('2022-06-19'));
alter table battle_history_raw_v2 add partition (partition p20220620 values less than('2022-06-20'));
alter table battle_history_raw_v2 add partition (partition p20220621 values less than('2022-06-21'));
alter table battle_history_raw_v2 add partition (partition p20220622 values less than('2022-06-22'));
alter table battle_history_raw_v2 add partition (partition p20220623 values less than('2022-06-23'));
alter table battle_history_raw_v2 add partition (partition p20220624 values less than('2022-06-24'));
alter table battle_history_raw_v2 add partition (partition p20220625 values less than('2022-06-25'));
alter table battle_history_raw_v2 add partition (partition p20220626 values less than('2022-06-26'));
alter table battle_history_raw_v2 add partition (partition p20220627 values less than('2022-06-27'));
alter table battle_history_raw_v2 add partition (partition p20220628 values less than('2022-06-28'));
alter table battle_history_raw_v2 add partition (partition p20220629 values less than('2022-06-29'));
alter table battle_history_raw_v2 add partition (partition p20220630 values less than('2022-06-30'));
alter table battle_history_raw_v2 add partition (partition p20220701 values less than('2022-07-01'));
alter table battle_history_raw_v2 add partition (partition p20220702 values less than('2022-07-02'));
alter table battle_history_raw_v2 add partition (partition p20220703 values less than('2022-07-03'));
alter table battle_history_raw_v2 add partition (partition p20220704 values less than('2022-07-04'));
alter table battle_history_raw_v2 add partition (partition p20220705 values less than('2022-07-05'));
alter table battle_history_raw_v2 add partition (partition p20220706 values less than('2022-07-06'));
alter table battle_history_raw_v2 add partition (partition p20220707 values less than('2022-07-07'));
alter table battle_history_raw_v2 add partition (partition p20220708 values less than('2022-07-08'));
alter table battle_history_raw_v2 add partition (partition p20220709 values less than('2022-07-09'));
alter table battle_history_raw_v2 add partition (partition p20220710 values less than('2022-07-10'));
alter table battle_history_raw_v2 add partition (partition p20220711 values less than('2022-07-11'));
alter table battle_history_raw_v2 add partition (partition p20220712 values less than('2022-07-12'));
alter table battle_history_raw_v2 add partition (partition p20220713 values less than('2022-07-13'));
alter table battle_history_raw_v2 add partition (partition p20220714 values less than('2022-07-14'));
alter table battle_history_raw_v2 add partition (partition p20220715 values less than('2022-07-15'));
alter table battle_history_raw_v2 add partition (partition p20220716 values less than('2022-07-16'));
alter table battle_history_raw_v2 add partition (partition p20220717 values less than('2022-07-17'));
alter table battle_history_raw_v2 add partition (partition p20220718 values less than('2022-07-18'));
alter table battle_history_raw_v2 add partition (partition p20220719 values less than('2022-07-19'));
alter table battle_history_raw_v2 add partition (partition p20220720 values less than('2022-07-20'));
alter table battle_history_raw_v2 add partition (partition p20220721 values less than('2022-07-21'));
alter table battle_history_raw_v2 add partition (partition p20220722 values less than('2022-07-22'));
alter table battle_history_raw_v2 add partition (partition p20220723 values less than('2022-07-23'));
alter table battle_history_raw_v2 add partition (partition p20220724 values less than('2022-07-24'));
alter table battle_history_raw_v2 add partition (partition p20220725 values less than('2022-07-25'));
alter table battle_history_raw_v2 add partition (partition p20220726 values less than('2022-07-26'));
alter table battle_history_raw_v2 add partition (partition p20220727 values less than('2022-07-27'));
alter table battle_history_raw_v2 add partition (partition p20220728 values less than('2022-07-28'));
alter table battle_history_raw_v2 add partition (partition p20220729 values less than('2022-07-29'));
alter table battle_history_raw_v2 add partition (partition p20220730 values less than('2022-07-30'));
alter table battle_history_raw_v2 add partition (partition p20220731 values less than('2022-07-31'));
alter table battle_history_raw_v2 add partition (partition p20220801 values less than('2022-08-01'));
alter table battle_history_raw_v2 add partition (partition p20220802 values less than('2022-08-02'));
alter table battle_history_raw_v2 add partition (partition p20220803 values less than('2022-08-03'));
alter table battle_history_raw_v2 add partition (partition p20220804 values less than('2022-08-04'));
alter table battle_history_raw_v2 add partition (partition p20220805 values less than('2022-08-05'));
alter table battle_history_raw_v2 add partition (partition p20220806 values less than('2022-08-06'));
alter table battle_history_raw_v2 add partition (partition p20220807 values less than('2022-08-07'));
alter table battle_history_raw_v2 add partition (partition p20220808 values less than('2022-08-08'));
alter table battle_history_raw_v2 add partition (partition p20220809 values less than('2022-08-09'));
alter table battle_history_raw_v2 add partition (partition p20220810 values less than('2022-08-10'));
alter table battle_history_raw_v2 add partition (partition p20220811 values less than('2022-08-11'));
alter table battle_history_raw_v2 add partition (partition p20220812 values less than('2022-08-12'));
alter table battle_history_raw_v2 add partition (partition p20220813 values less than('2022-08-13'));
alter table battle_history_raw_v2 add partition (partition p20220814 values less than('2022-08-14'));
alter table battle_history_raw_v2 add partition (partition p20220815 values less than('2022-08-15'));
alter table battle_history_raw_v2 add partition (partition p20220816 values less than('2022-08-16'));
alter table battle_history_raw_v2 add partition (partition p20220817 values less than('2022-08-17'));
alter table battle_history_raw_v2 add partition (partition p20220818 values less than('2022-08-18'));
alter table battle_history_raw_v2 add partition (partition p20220819 values less than('2022-08-19'));
alter table battle_history_raw_v2 add partition (partition p20220820 values less than('2022-08-20'));
alter table battle_history_raw_v2 add partition (partition p20220821 values less than('2022-08-21'));
alter table battle_history_raw_v2 add partition (partition p20220822 values less than('2022-08-22'));
alter table battle_history_raw_v2 add partition (partition p20220823 values less than('2022-08-23'));
alter table battle_history_raw_v2 add partition (partition p20220824 values less than('2022-08-24'));
alter table battle_history_raw_v2 add partition (partition p20220825 values less than('2022-08-25'));
alter table battle_history_raw_v2 add partition (partition p20220826 values less than('2022-08-26'));
alter table battle_history_raw_v2 add partition (partition p20220827 values less than('2022-08-27'));
alter table battle_history_raw_v2 add partition (partition p20220828 values less than('2022-08-28'));
alter table battle_history_raw_v2 add partition (partition p20220829 values less than('2022-08-29'));
alter table battle_history_raw_v2 add partition (partition p20220830 values less than('2022-08-30'));
alter table battle_history_raw_v2 add partition (partition p20220831 values less than('2022-08-31'));
alter table battle_history_raw_v2 add partition (partition p20220901 values less than('2022-09-01'));
alter table battle_history_raw_v2 add partition (partition p20220902 values less than('2022-09-02'));
alter table battle_history_raw_v2 add partition (partition p20220903 values less than('2022-09-03'));
alter table battle_history_raw_v2 add partition (partition p20220904 values less than('2022-09-04'));
alter table battle_history_raw_v2 add partition (partition p20220905 values less than('2022-09-05'));
alter table battle_history_raw_v2 add partition (partition p20220906 values less than('2022-09-06'));
alter table battle_history_raw_v2 add partition (partition p20220907 values less than('2022-09-07'));
alter table battle_history_raw_v2 add partition (partition p20220908 values less than('2022-09-08'));
alter table battle_history_raw_v2 add partition (partition p20220909 values less than('2022-09-09'));
alter table battle_history_raw_v2 add partition (partition p20220910 values less than('2022-09-10'));
alter table battle_history_raw_v2 add partition (partition p20220911 values less than('2022-09-11'));
alter table battle_history_raw_v2 add partition (partition p20220912 values less than('2022-09-12'));
alter table battle_history_raw_v2 add partition (partition p20220913 values less than('2022-09-13'));
alter table battle_history_raw_v2 add partition (partition p20220914 values less than('2022-09-14'));
alter table battle_history_raw_v2 add partition (partition p20220915 values less than('2022-09-15'));
alter table battle_history_raw_v2 add partition (partition p20220916 values less than('2022-09-16'));
alter table battle_history_raw_v2 add partition (partition p20220917 values less than('2022-09-17'));
alter table battle_history_raw_v2 add partition (partition p20220918 values less than('2022-09-18'));
alter table battle_history_raw_v2 add partition (partition p20220919 values less than('2022-09-19'));
alter table battle_history_raw_v2 add partition (partition p20220920 values less than('2022-09-20'));
alter table battle_history_raw_v2 add partition (partition p20220921 values less than('2022-09-21'));
alter table battle_history_raw_v2 add partition (partition p20220922 values less than('2022-09-22'));
alter table battle_history_raw_v2 add partition (partition p20220923 values less than('2022-09-23'));
alter table battle_history_raw_v2 add partition (partition p20220924 values less than('2022-09-24'));
alter table battle_history_raw_v2 add partition (partition p20220925 values less than('2022-09-25'));
alter table battle_history_raw_v2 add partition (partition p20220926 values less than('2022-09-26'));
alter table battle_history_raw_v2 add partition (partition p20220927 values less than('2022-09-27'));
alter table battle_history_raw_v2 add partition (partition p20220928 values less than('2022-09-28'));
alter table battle_history_raw_v2 add partition (partition p20220929 values less than('2022-09-29'));
alter table battle_history_raw_v2 add partition (partition p20220930 values less than('2022-09-30'));
alter table battle_history_raw_v2 add partition (partition p20221001 values less than('2022-10-01'));
alter table battle_history_raw_v2 add partition (partition p20221002 values less than('2022-10-02'));
alter table battle_history_raw_v2 add partition (partition p20221003 values less than('2022-10-03'));
alter table battle_history_raw_v2 add partition (partition p20221004 values less than('2022-10-04'));
alter table battle_history_raw_v2 add partition (partition p20221005 values less than('2022-10-05'));
alter table battle_history_raw_v2 add partition (partition p20221006 values less than('2022-10-06'));
alter table battle_history_raw_v2 add partition (partition p20221007 values less than('2022-10-07'));
alter table battle_history_raw_v2 add partition (partition p20221008 values less than('2022-10-08'));
alter table battle_history_raw_v2 add partition (partition p20221009 values less than('2022-10-09'));
alter table battle_history_raw_v2 add partition (partition p20221010 values less than('2022-10-10'));
alter table battle_history_raw_v2 add partition (partition p20221011 values less than('2022-10-11'));
alter table battle_history_raw_v2 add partition (partition p20221012 values less than('2022-10-12'));
alter table battle_history_raw_v2 add partition (partition p20221013 values less than('2022-10-13'));
alter table battle_history_raw_v2 add partition (partition p20221014 values less than('2022-10-14'));
alter table battle_history_raw_v2 add partition (partition p20221015 values less than('2022-10-15'));
alter table battle_history_raw_v2 add partition (partition p20221016 values less than('2022-10-16'));
alter table battle_history_raw_v2 add partition (partition p20221017 values less than('2022-10-17'));
alter table battle_history_raw_v2 add partition (partition p20221018 values less than('2022-10-18'));
alter table battle_history_raw_v2 add partition (partition p20221019 values less than('2022-10-19'));
alter table battle_history_raw_v2 add partition (partition p20221020 values less than('2022-10-20'));
alter table battle_history_raw_v2 add partition (partition p20221021 values less than('2022-10-21'));
alter table battle_history_raw_v2 add partition (partition p20221022 values less than('2022-10-22'));
alter table battle_history_raw_v2 add partition (partition p20221023 values less than('2022-10-23'));
alter table battle_history_raw_v2 add partition (partition p20221024 values less than('2022-10-24'));
alter table battle_history_raw_v2 add partition (partition p20221025 values less than('2022-10-25'));
alter table battle_history_raw_v2 add partition (partition p20221026 values less than('2022-10-26'));
alter table battle_history_raw_v2 add partition (partition p20221027 values less than('2022-10-27'));
alter table battle_history_raw_v2 add partition (partition p20221028 values less than('2022-10-28'));
alter table battle_history_raw_v2 add partition (partition p20221029 values less than('2022-10-29'));
alter table battle_history_raw_v2 add partition (partition p20221030 values less than('2022-10-30'));
alter table battle_history_raw_v2 add partition (partition p20221031 values less than('2022-10-31'));
alter table battle_history_raw_v2 add partition (partition p20221101 values less than('2022-11-01'));
alter table battle_history_raw_v2 add partition (partition p20221102 values less than('2022-11-02'));
alter table battle_history_raw_v2 add partition (partition p20221103 values less than('2022-11-03'));
alter table battle_history_raw_v2 add partition (partition p20221104 values less than('2022-11-04'));
alter table battle_history_raw_v2 add partition (partition p20221105 values less than('2022-11-05'));
alter table battle_history_raw_v2 add partition (partition p20221106 values less than('2022-11-06'));
alter table battle_history_raw_v2 add partition (partition p20221107 values less than('2022-11-07'));
alter table battle_history_raw_v2 add partition (partition p20221108 values less than('2022-11-08'));
alter table battle_history_raw_v2 add partition (partition p20221109 values less than('2022-11-09'));
alter table battle_history_raw_v2 add partition (partition p20221110 values less than('2022-11-10'));
alter table battle_history_raw_v2 add partition (partition p20221111 values less than('2022-11-11'));
alter table battle_history_raw_v2 add partition (partition p20221112 values less than('2022-11-12'));
alter table battle_history_raw_v2 add partition (partition p20221113 values less than('2022-11-13'));
alter table battle_history_raw_v2 add partition (partition p20221114 values less than('2022-11-14'));
alter table battle_history_raw_v2 add partition (partition p20221115 values less than('2022-11-15'));
alter table battle_history_raw_v2 add partition (partition p20221116 values less than('2022-11-16'));
alter table battle_history_raw_v2 add partition (partition p20221117 values less than('2022-11-17'));
alter table battle_history_raw_v2 add partition (partition p20221118 values less than('2022-11-18'));
alter table battle_history_raw_v2 add partition (partition p20221119 values less than('2022-11-19'));
alter table battle_history_raw_v2 add partition (partition p20221120 values less than('2022-11-20'));
alter table battle_history_raw_v2 add partition (partition p20221121 values less than('2022-11-21'));
alter table battle_history_raw_v2 add partition (partition p20221122 values less than('2022-11-22'));
alter table battle_history_raw_v2 add partition (partition p20221123 values less than('2022-11-23'));
alter table battle_history_raw_v2 add partition (partition p20221124 values less than('2022-11-24'));
alter table battle_history_raw_v2 add partition (partition p20221125 values less than('2022-11-25'));
alter table battle_history_raw_v2 add partition (partition p20221126 values less than('2022-11-26'));
alter table battle_history_raw_v2 add partition (partition p20221127 values less than('2022-11-27'));
alter table battle_history_raw_v2 add partition (partition p20221128 values less than('2022-11-28'));
alter table battle_history_raw_v2 add partition (partition p20221129 values less than('2022-11-29'));
alter table battle_history_raw_v2 add partition (partition p20221130 values less than('2022-11-30'));
alter table battle_history_raw_v2 add partition (partition p20221201 values less than('2022-12-01'));
alter table battle_history_raw_v2 add partition (partition p20221202 values less than('2022-12-02'));
alter table battle_history_raw_v2 add partition (partition p20221203 values less than('2022-12-03'));
alter table battle_history_raw_v2 add partition (partition p20221204 values less than('2022-12-04'));
alter table battle_history_raw_v2 add partition (partition p20221205 values less than('2022-12-05'));


 sed -i "s/\`battle_history_raw\`/\`battle_history_raw_v2\`(battle_queue_id,summoner_id,summoner_level ,monster_1_id ,monster_1_level ,monster_1_abilities ,monster_2_id ,monster_2_level ,monster_2_abilities ,monster_3_id ,monster_3_level ,monster_3_abilities ,monster_4_id ,monster_4_level ,monster_4_abilities ,monster_5_id ,monster_5_level ,monster_5_abilities ,monster_6_id ,monster_6_level ,monster_6_abilities ,created_date ,created_date_day , match_type , mana_cap ,ruleset ,inactive,player_rating_initial ,player_rating_final ,winner ,battle_queue_id_lost ,summoner_id_lost ,summoner_level_lost ,monster_1_id_lost ,monster_1_level_lost ,monster_1_abilities_lost ,monster_2_id_lost ,monster_2_level_lost,monster_2_abilities_lost ,monster_3_id_lost ,monster_3_level_lost ,monster_3_abilities_lost ,monster_4_id_lost ,monster_4_level_lost ,monster_4_abilities_lost ,monster_5_id_lost,monster_5_level_lost ,monster_5_abilities_lost ,monster_6_id_lost ,monster_6_level_lost ,monster_6_abilities_lost ,player_rating_initial_lost ,player_rating_final_lost ,loser) /g" battle_history_raw.sql