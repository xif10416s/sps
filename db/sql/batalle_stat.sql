CREATE TABLE `battle_stat`  (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `startMana` int(9) NOT NULL,
  `endMana` int(9) NOT NULL,
  `cs` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `len` int(9) NOT NULL,
  `rule` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `summonerId` int(9) NOT NULL,
  `teams` int(9) NOT NULL,
  `totalCnt` int(9) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `index_cs`(`cs`) USING BTREE,
  INDEX `index_mana`(`startMana`,`endMana`) USING BTREE,
  INDEX `index_rule_len`(`rule`, `summonerId`,`len`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic ;