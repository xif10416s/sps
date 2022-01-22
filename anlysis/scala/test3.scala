///mnt/c/Users/xifei/develop/spark/spark-3.2.0-bin-hadoop3.2/bin/spark-shell  --conf spark.local.dir=/tmp/spark --master local[10] --driver-memory 3g  --name test
//val spark = SparkSession
//  .builder
//  .appName("Spark Pi")
//  .master("local[*]")
//  .getOrCreate()
//
//
//
//val jdbcDF = spark.read
//.format("jdbc")
//.option("url", "jdbc:mysql://10.100.3.27:3306/demo_test?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC")
//.option("dbtable", "(select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost  from battle_history_raw_v2 where created_date_day  <= '2021-12-28') battle_history_raw_v2 ")
//.option("user", "root")
//.option("password", "xsmysql")
//.load()

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Calendar
import scala.collection.mutable.ArrayBuffer
import org.apache.spark.sql.Dataset

//val manaArr = Array((12, 12), (13, 13), (14, 14), (15, 15), (16, 16), (17, 17), (18, 18), (19, 19), (20, 20), (21, 21), (22, 22), (23, 23), (24, 24), (25, 25), (26, 26), (27, 27), (28, 28), (29, 29), (30, 30), (31, 32), (33, 34), (35, 36), (37, 38), (39, 40), (41, 44), (45, 50), (51, 99))
val manaArr = Array( (28, 28),(29, 29),(30, 30), (31, 32), (33, 34), (35, 36), (37, 38), (39, 40), (41, 44), (45, 50), (51, 99))

case class Item(mana_cap: Int, ruleset: String, summoner_id: Int, monster_1_id: Int, monster_2_id: Int, monster_3_id: Int, monster_4_id: Int, monster_5_id: Int, monster_6_id: Int, summoner_id_lost: Int, monster_1_id_lost: Int, monster_2_id_lost: Int, monster_3_id_lost: Int, monster_4_id_lost: Int, monster_5_id_lost: Int, monster_6_id_lost: Int)

case class AgainstMap(mana_cap: Int, wlen: Int, llen: Int, rule: String, wcs: String, lcs: String)

case class StatCSResult(startMana: Int, endMana: Int, wlen: Int, llen: Int, rule: String, wcs: String, lcs: String, count: Long)

val KEY_SINGLE_RULES = "Broken Arrows|Even Stevens|Keep Your Distance|Little League|Lost Legendaries|Lost Magic|Odd Ones Out|Rise of the Commons|Taking Sides|Up Close and Personal|Up Close & Personal|Noxious Fumes|Silenced Summoners|Earthquake|Back to Basics"
val defaultRule = "default"
val skipIds = Array(-1,131,91,169,366,380,394,408,422,77,91,95,119,136,169,227,230,238,277,290,296,297,298,313,353,367,381,395,409,426)
val URL = "jdbc:mysql://localhost:3306/sps_battles?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC"
val USER = "root"
val PASS = "123456"

def splitCS(lead: Int, t: Array[Int], a: ArrayBuffer[String]): Unit = {
  if (t.length >= 2) {
    val bs = lead + "-" + t(0)
    for (i <- 1 to t.length - 1) {
      val s = bs + "-" + t(i)
      a += s
    }
  }
  if (t.length >= 3) {
    val bs2 = lead + "-" + t(0) + "-" + t(1)
    for (i <- 2 to t.length - 1) {
      val s = bs2 + "-" + t(i)
      a += s
    }
  }
  if (t.length >= 4) {
    val bs3 = lead + "-" + t(0) + "-" + t(1) + "-" + t(2)
    for (i <- 3 to t.length - 1) {
      val s = bs3 + "-" + t(i)
      a += s
    }
  }
  if (t.length >= 3) {
    splitCS(lead, t.slice(1, t.length), a)
  }
}

//val a = ArrayBuffer[String]()
//splitCS(99,Array(2,4,5,6,7,8),a)


def splitAM(t: Item): Array[AgainstMap] = {
  val wt = ArrayBuffer[Int]()
  Array(t.monster_1_id, t.monster_2_id, t.monster_3_id, t.monster_4_id, t.monster_5_id, t.monster_6_id).foreach(id => {
    if (!skipIds.contains(id)) {
      wt += id
    }
  })

  val wtcs = ArrayBuffer[String]()
  splitCS(t.summoner_id, scala.util.Sorting.stableSort(wt), wtcs)
  var maxWtLen = 0;
  wtcs.foreach( x =>{
    val len = x.split("-").length
    if(len > maxWtLen){
      maxWtLen = len
    }
  })

  val lt = ArrayBuffer[Int]()
  Array(t.monster_1_id_lost, t.monster_2_id_lost, t.monster_3_id_lost, t.monster_4_id_lost, t.monster_5_id_lost, t.monster_6_id_lost).foreach(id => {
    if (!skipIds.contains(id)) {
      lt += id
    }
  })

  val ltcs = ArrayBuffer[String]()
  splitCS(t.summoner_id_lost, scala.util.Sorting.stableSort(lt), ltcs)
  val rsArr = ArrayBuffer[AgainstMap]()
  wtcs.filter( x => {
    x.split("-").length  == maxWtLen
  } ).foreach(cs => {
    val spRule = t.ruleset.split("\\|")
    var matchRule = t.ruleset
    if (spRule.length == 1) {
      if (KEY_SINGLE_RULES.contains(t.ruleset)) {
        matchRule = t.ruleset
      } else {
        matchRule = defaultRule
      }
    }

    if (spRule.length == 2) {
      if (KEY_SINGLE_RULES.contains(spRule(0)) &&
        KEY_SINGLE_RULES.contains(spRule(1))) {
        matchRule = spRule.sorted.mkString("|")
      }

      if (KEY_SINGLE_RULES.contains(spRule(0)) &&
        !KEY_SINGLE_RULES.contains(spRule(1))) {
        matchRule = spRule(0)
      }

      if (KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        matchRule = spRule(1)
      }

      if (!KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        matchRule = defaultRule
      }
    }
    val wlen = cs.split("-").length - 1;

    var maxLtLen = 0;
    ltcs.foreach( x =>{
      val len = x.split("-").length
      if(len > maxLtLen){
        maxLtLen = len
      }
    })
    ltcs.filter( x => {
      x.split("-").length >= maxLtLen -1
    } ).foreach(lcs => {
      val llen = lcs.split("-").length - 1;
      rsArr += AgainstMap(t.mana_cap, wlen, llen, matchRule, cs, lcs)
    })
  })
  rsArr.toArray
}





def doAggMap(ds: Dataset[AgainstMap], fromMana: Int, endMana: Int): Dataset[StatCSResult] = {
  val countDS = ds.withColumn("startMana", lit(fromMana)).withColumn("endMana", lit(endMana)).groupBy("startMana","endMana","rule", "wcs","wlen", "lcs","llen").count
  return countDS.as[StatCSResult]
}

//  2021-12-25 19
def doAnalysis(startTime: String, endTime: String, fromMana: Int, endMana: Int): Unit = {
  var jdbcDF = spark.read
    .format("jdbc")
    .option("url", URL)
    .option("dbtable", s"(select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost  from battle_history_raw_v2 where  mana_cap>= ${fromMana} and mana_cap <= ${endMana} and  created_date_day = '${startTime}') as bt   ")
    .option("user", USER)
    .option("password", PASS)
    .load()
  val sdf = new SimpleDateFormat("yyyy-MM-dd")
  val dayDate: Date = sdf.parse(startTime)
  val endDate: Date = sdf.parse(endTime)
  val dayLen = ((endDate.getTime() - dayDate.getTime()) / (1000 * 3600 * 24)).toInt
  val cal = Calendar.getInstance()
  cal.setTime(dayDate)
  for (i <- 1 to dayLen) {
    cal.add(Calendar.DAY_OF_MONTH, 1)
    val day = sdf.format(cal.getTime);
    val jdbcDFTemp = spark.read
      .format("jdbc")
      .option("url", URL)
      .option("dbtable", s"(select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost  from battle_history_raw_v2 where mana_cap>= ${fromMana} and mana_cap <= ${endMana} and  created_date_day = '${day}') as bt   ")
      .option("user", USER)
      .option("password", PASS)
      .load()
    jdbcDF = jdbcDF.union(jdbcDFTemp)
  }
  val ds = jdbcDF.as[Item].coalesce(6)
  ds.cache()

  val splitDS = ds.flatMap(x => {
    splitAM(x)
  })
  val aggDS = doAggMap(splitDS, fromMana, endMana).filter($"count" > 2 || $"startMana" <=18 )
  aggDS.repartition(20).write.format("jdbc").option("url", URL).option("dbtable", "battle_stat_cs_ls_v3").mode("append").option("user", USER).option("password", PASS).save()

  ds.unpersist
}


def doRangeByMana(arr: Array[(Int, Int)]): Unit = {
  arr.foreach(ms => {
    println("start :" + ms._1)
    doAnalysis("2022-01-01", "2022-01-22", ms._1, ms._2)
  })
}
doRangeByMana(manaArr)


