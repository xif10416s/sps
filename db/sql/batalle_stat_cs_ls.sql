CREATE TABLE `battle_stat_cs_ls`  (
  `id` int(9) NOT NULL AUTO_INCREMENT,
  `startMana` int(9) NOT NULL,
  `endMana` int(9) NOT NULL,
  `wcs` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `lcs` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `wlen` int(9) NOT NULL,
  `llen` int(9) NOT NULL,
  `rule` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `count` int(9) NOT NULL,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `index_cs`(`lcs`) USING BTREE,
  INDEX `index_mana`(`startMana`,`endMana`) USING BTREE,
  INDEX `index_rule`(`rule`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Dynamic ;