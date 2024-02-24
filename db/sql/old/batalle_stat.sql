CREATE TABLE `battle_stat_v5`  (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `startMana` int(9) NOT NULL,
  `endMana` int(9) NOT NULL,
  `cs` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `len` int(9) NOT NULL,
  `rule` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summonerId` int(9) NOT NULL, #失败的SId
  `teams` int(9) NOT NULL,
  `totalCnt` int(9) NOT NULL,
  `lostTeams` int(9) NOT NULL default 0,
  `lostTotalCnt` int(9)  NOT NULL default 0,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `index_cs`(`cs`) USING BTREE,
  INDEX `index_rule`(`rule`) USING BTREE,
  INDEX `index_summonerId`(`summonerId`) USING BTREE,
  INDEX `index_mana`(`startMana`,`endMana`) USING BTREE
)  ENGINE = MYISAM CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic ;

ALTER TABLE `battle_stat_v5` ADD UNIQUE (`startMana`,`cs`,`rule`,`summonerId`);

alter table battle_stat_v5 partition by range columns(startMana)(
	partition p12 values less than(13)
);

alter table battle_stat_v5 add partition (partition p13 values less than(14));
alter table battle_stat_v5 add partition (partition p14 values less than(15));
alter table battle_stat_v5 add partition (partition p15 values less than(16));
alter table battle_stat_v5 add partition (partition p16 values less than(17));
alter table battle_stat_v5 add partition (partition p17 values less than(18));
alter table battle_stat_v5 add partition (partition p18 values less than(19));
alter table battle_stat_v5 add partition (partition p19 values less than(20));
alter table battle_stat_v5 add partition (partition p20 values less than(21));
alter table battle_stat_v5 add partition (partition p21 values less than(22));
alter table battle_stat_v5 add partition (partition p22 values less than(23));
alter table battle_stat_v5 add partition (partition p23 values less than(24));
alter table battle_stat_v5 add partition (partition p24 values less than(25));
alter table battle_stat_v5 add partition (partition p25 values less than(26));
alter table battle_stat_v5 add partition (partition p26 values less than(27));
alter table battle_stat_v5 add partition (partition p27 values less than(28));
alter table battle_stat_v5 add partition (partition p28 values less than(29));
alter table battle_stat_v5 add partition (partition p29 values less than(30));
alter table battle_stat_v5 add partition (partition p30 values less than(31));
alter table battle_stat_v5 add partition (partition p31 values less than(33));
alter table battle_stat_v5 add partition (partition p33 values less than(35));
alter table battle_stat_v5 add partition (partition p35 values less than(37));
alter table battle_stat_v5 add partition (partition p37 values less than(39));
alter table battle_stat_v5 add partition (partition p39 values less than(41));
alter table battle_stat_v5 add partition (partition p41 values less than(45));
alter table battle_stat_v5 add partition (partition p45 values less than(51));
alter table battle_stat_v5 add partition (partition p51 values less than(101));