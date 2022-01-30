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

import scala.util.parsing.json.JSON._
import scala.io.Source
import java.text.SimpleDateFormat
import java.sql.{Driver, DriverManager}
import java.util.Date
import java.util.Calendar
import scala.collection.mutable.ArrayBuffer
import org.apache.spark.sql.Dataset
val manaArr = Array((12,12),(13,13),(14,14),(15,15),(16,16),(17,17),(18,18),(19,19),(20,20),(21,21),(22,22),(23,23),(24,24),(25,25),(26,26),(27,27),(28,28),(29,29),(30,30),(31,32),(33,34),(35,36),(37,38),(39,40),(41,44),(45,50),(51,99))
case class Item(mana_cap:Int , ruleset:String, summoner_id:Int ,monster_1_id:Int,monster_2_id:Int,monster_3_id:Int,monster_4_id:Int,monster_5_id:Int,monster_6_id:Int, summoner_id_lost:Int ,monster_1_id_lost:Int,monster_2_id_lost:Int,monster_3_id_lost:Int,monster_4_id_lost:Int,monster_5_id_lost:Int,monster_6_id_lost:Int)
case class AgainstMap(mana_cap:Int, ruleset:String,wc:String,lcs:(Int,String))
case class StatCS(startMana:Int ,endMana:Int ,cs:String,len:Int, rule:String, summonerId:Int,teams:Int,totalCnt:Int)
case class StatCSResult(startMana:Int ,endMana:Int ,cs:String,len:Int, rule:String, summonerId:Int,teams:Int,totalCnt:Int,lostTeams:Int,lostTotalCnt:Int)
val KEY_SINGLE_RULES="Broken Arrows|Even Stevens|Keep Your Distance|Little League|Lost Legendaries|Lost Magic|Odd Ones Out|Rise of the Commons|Taking Sides|Up Close and Personal|Up Close & Personal|Back to Basics|Noxious Fumes|Healed Out|Earthquake|Reverse Speed|Super Sneak|Target Practice|Melee Mayhem|Explosive Weaponry|Fog of War|Equaliser|Heavy Hitters|Stampede"
val defaultRule = "default"
val skipIds = Array(-1,131,91,169,366,380,394,408,422,77,91,95,119,136,169,227,230,238,277,290,296,297,298,313,353,367,381,395,409,426)
val upCnt = 2;
val upTotalCnt = 3;
val URL = "jdbc:mysql://localhost:3306/sps_battles?useUnicode=true&characterEncoding=UTF-8&serverTimezone=UTC"
val USER ="root"
val PASS ="123456"

val tree = parseFull(Source.fromFile("/mnt/d/source/python/spsAuto/splinterlands-bot/data/strategy/preferCs.json").mkString)
val preferCs = tree match {
  case Some(ls: List[String]) => ls
}
val preferIds = preferCs.mkString("").split("%").map(x => x.toInt)
println(preferIds)

def splitCS(lead:Int , t:Array[Int],a:ArrayBuffer[String]):Unit = {
  if(t.length >= 2){
    val bs = lead + "-" + t(0)
    for(i <- 1 to t.length -1){
      val s = bs +"-"+t(i)
      a+=s
    }
  }
  if(t.length >= 3){
    val bs2 = lead + "-" + t(0) + "-" + t(1)
    for(i <- 2 to t.length -1){
      val s = bs2 +"-"+t(i)
      a+=s
    }
  }
  if(t.length >= 4){
    val bs3 = lead + "-" + t(0) + "-" + t(1)+ "-" + t(2)
    for(i <- 3 to t.length -1){
      val s = bs3 +"-"+t(i)
      a+=s
    }
  }
  if(t.length >= 3){
    splitCS(lead,t.slice(1,t.length),a)
  }
}

//val a = ArrayBuffer[String]()
//splitCS(99,Array(2,4,5,6,7,8),a)



def splitAM(t:Item): Array[AgainstMap] = {
  val wt = ArrayBuffer[Int]()
  Array(t.monster_1_id,t.monster_2_id,t.monster_3_id,t.monster_4_id,t.monster_5_id,t.monster_6_id).foreach(id =>{
    if(!skipIds.contains(id)){
      wt +=id
    }
  })

  val wtcs = ArrayBuffer[String]()
  splitCS(t.summoner_id,scala.util.Sorting.stableSort(wt),wtcs)

  val lt = ArrayBuffer[Int]()
  Array(t.monster_1_id_lost,t.monster_2_id_lost,t.monster_3_id_lost,t.monster_4_id_lost,t.monster_5_id_lost,t.monster_6_id_lost).foreach(id =>{
    if(id != -1){
      lt +=id
    }
  })

  val ltcs = (t.summoner_id_lost,scala.util.Sorting.stableSort(lt).mkString("-"))

  val rsArr = ArrayBuffer[AgainstMap]()
  wtcs.foreach( cs => {
    val spRule = t.ruleset.split("\\|")
    if(spRule.length == 1) {
      if(KEY_SINGLE_RULES.contains(t.ruleset)) {
        rsArr+=AgainstMap(t.mana_cap,t.ruleset,cs , ltcs)
      } else {
        rsArr+=AgainstMap(t.mana_cap,defaultRule ,cs , ltcs)
      }
    }

    if(spRule.length == 2) {
      if(KEY_SINGLE_RULES.contains(spRule(0)) &&
        KEY_SINGLE_RULES.contains(spRule(1))) {
        rsArr+=AgainstMap(t.mana_cap,spRule.sorted.mkString("|"),cs , ltcs)
      }

      if(KEY_SINGLE_RULES.contains(spRule(0)) &&
        !KEY_SINGLE_RULES.contains(spRule(1))) {
        rsArr+=AgainstMap(t.mana_cap,spRule(0),cs , ltcs)
      }

      if(KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        rsArr+=AgainstMap(t.mana_cap,spRule(1),cs , ltcs)
      }

      if(!KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        rsArr+=AgainstMap(t.mana_cap,defaultRule,cs , ltcs)
      }
    }
  })
  rsArr.toArray
}


def splitAMLost(t:Item): Array[AgainstMap] = {
  val wt = ArrayBuffer[Int]()
  Array(t.monster_1_id_lost,t.monster_2_id_lost,t.monster_3_id_lost,t.monster_4_id_lost,t.monster_5_id_lost,t.monster_6_id_lost).foreach(id =>{
    if(!skipIds.contains(id)){
      wt +=id
    }
  })

  val wtcs = ArrayBuffer[String]()
  splitCS(t.summoner_id_lost,scala.util.Sorting.stableSort(wt),wtcs)

  val lt = ArrayBuffer[Int]()
  Array(t.monster_1_id,t.monster_2_id,t.monster_3_id,t.monster_4_id,t.monster_5_id,t.monster_6_id).foreach(id =>{
    if(id != -1){
      lt +=id
    }
  })

  val ltcs = (t.summoner_id,scala.util.Sorting.stableSort(lt).mkString("-"))

  val rsArr = ArrayBuffer[AgainstMap]()
  wtcs.foreach( cs => {
    val spRule = t.ruleset.split("\\|")
    if(spRule.length == 1) {
      if(KEY_SINGLE_RULES.contains(t.ruleset)) {
        rsArr+=AgainstMap(t.mana_cap,t.ruleset,cs , ltcs)
      } else {
        rsArr+=AgainstMap(t.mana_cap,defaultRule ,cs , ltcs)
      }
    }

    if(spRule.length == 2) {
      if(KEY_SINGLE_RULES.contains(spRule(0)) &&
        KEY_SINGLE_RULES.contains(spRule(1))) {
        rsArr+=AgainstMap(t.mana_cap,spRule.sorted.mkString("|"),cs , ltcs)
      }

      if(KEY_SINGLE_RULES.contains(spRule(0)) &&
        !KEY_SINGLE_RULES.contains(spRule(1))) {
        rsArr+=AgainstMap(t.mana_cap,spRule(0),cs , ltcs)
      }

      if(KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        rsArr+=AgainstMap(t.mana_cap,spRule(1),cs , ltcs)
      }

      if(!KEY_SINGLE_RULES.contains(spRule(1)) &&
        !KEY_SINGLE_RULES.contains(spRule(0))) {
        rsArr+=AgainstMap(t.mana_cap,defaultRule,cs , ltcs)
      }
    }
  })
  rsArr.toArray
}


def doAggMap(ds:Dataset[AgainstMap],fromMana:Int , endMana:Int):Dataset[StatCS] ={
  val aggDs = ds.map( x => {
    (x.ruleset +"_"+ x.wc,Map(x.lcs._1 -> Map(x.lcs._2 -> 1)))
  }).rdd.reduceByKey((v1,v2) =>{
    v1 ++ v2.map {
      case (sk,ms) => {
        val matchMap = v1.getOrElse(sk,Map())
        sk -> (ms ++ matchMap.map {
          case(name,count) => name -> (count + ms.getOrElse(name,0))
        })
      }
    }
  }).toDS()

  aggDs.flatMap( cs =>{
    val key = cs._1.split("_")
    val teamCsIds = key(1).split("-")
    var existsPreferIds = false;
    teamCsIds.foreach( cId => {
      if(preferIds.indexOf(cId.toInt) != -1){
        existsPreferIds = true;
      }
    })
    val len = teamCsIds.length - 1;
    val statCS = ArrayBuffer[StatCS]()
    for((vkey,va) <- cs._2 ) {
      val totalCnt  = va.values.reduce(_+_)
      if(va.size >= upCnt && totalCnt >= upTotalCnt || existsPreferIds) {
        statCS+=StatCS(fromMana,endMana,key(1),len,key(0),vkey,va.size,totalCnt)
      }
    }
    statCS
  })
}

//  2021-12-25 19
def doAnalysis(startTime:String, endTime:String ,fromMana:Int, endMana:Int): Unit = {
  var jdbcDF = spark.read
    .format("jdbc")
    .option("url", URL)
    .option("dbtable", s"(select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost  from battle_history_raw_v2 where  mana_cap>= ${fromMana} and mana_cap <= ${endMana} and  created_date_day = '${startTime}') as bt   ")
    .option("user", USER)
    .option("password", PASS)
    .load()
  val sdf =new SimpleDateFormat("yyyy-MM-dd")
  val dayDate :Date = sdf.parse(startTime)
  val endDate :Date = sdf.parse(endTime)
  val dayLen = ((endDate.getTime() - dayDate.getTime()) / (1000*3600*24)).toInt
  val cal = Calendar.getInstance()
  cal.setTime(dayDate)
  for(i <- 1 to dayLen) {
    cal.add(Calendar.DAY_OF_MONTH,1)
    val day =  sdf.format(cal.getTime);
    val jdbcDFTemp = spark.read
      .format("jdbc")
      .option("url", URL)
      .option("dbtable", s"(select mana_cap,ruleset , summoner_id,monster_1_id,monster_2_id,monster_3_id,monster_4_id,monster_5_id,monster_6_id , summoner_id_lost ,monster_1_id_lost ,monster_2_id_lost ,monster_3_id_lost ,monster_4_id_lost ,monster_5_id_lost ,monster_6_id_lost  from battle_history_raw_v2 where mana_cap>= ${fromMana} and mana_cap <= ${endMana} and  created_date_day = '${day}') as bt   ")
      .option("user", USER)
      .option("password", PASS)
      .load()
    jdbcDF = jdbcDF.union(jdbcDFTemp)
  }
  val ds = jdbcDF.as[Item].coalesce(1)
  ds.cache()

  val splitDS = ds.flatMap(x =>{
    splitAM(x)
  })
  val aggDS = doAggMap(splitDS,fromMana,endMana)

  val splitDSLost = ds.flatMap(x =>{
    splitAMLost(x)
  })
  val aggDSLost = doAggMap(splitDSLost,fromMana,endMana)

  //startMana:Int ,endMana:Int ,cs:String,len:Int, rule:String, summonerId:Int
  val rsDs = aggDS.join(aggDSLost,aggDS("rule") === aggDSLost("rule")
    && aggDS("startMana") === aggDSLost("startMana")  && aggDS("endMana") === aggDSLost("endMana")
    && aggDS("cs") === aggDSLost("cs") && aggDS("summonerId") === aggDSLost("summonerId"),"left").select(aggDS("startMana"),aggDS("endMana"),aggDS("cs"),aggDS("len"),aggDS("rule"),aggDS("summonerId")
    ,aggDS("teams"),aggDS("totalCnt"),aggDSLost("teams").as("lostTeams"),aggDSLost("totalCnt").as("lostTotalCnt"))
    .as[StatCSResult].toDF().na.fill(0.0).as[StatCSResult]

  rsDs.cache()
  println(rsDs.count())
  rsDs.coalesce(1).rdd.foreachPartition( pt =>{
    //startMana:Int ,endMana:Int ,cs:String,len:Int, rule:String, summonerId:Int,teams:Int,totalCnt:Int,lostTeams:Int,lostTotalCnt:Int
    val connection = DriverManager.getConnection(URL,USER,PASS)
    var cnt = 0L
    try{
      val sql = "INSERT  ignore  INTO battle_stat_v4(`startMana` , `endMana` , `cs` , `len`,`rule`,`summonerId`,`teams`,`totalCnt`,`lostTeams`,`lostTotalCnt`) values (?,?,?,?,?,?,?,?,?,? )  "
      val ps = connection.prepareStatement(sql)
      pt.foreach(x =>{
        ps.setInt(1,x.startMana)
        ps.setInt(2,x.endMana)
        ps.setString(3,x.cs)
        ps.setInt(4,x.len)
        ps.setString(5,x.rule)
        ps.setInt(6,x.summonerId)
        ps.setInt(7,x.teams)
        ps.setInt(8,x.totalCnt)
        ps.setLong(9,x.lostTeams)
        ps.setInt(10,x.lostTotalCnt)
        //开始执行
        ps.execute()
        cnt=cnt+1
        if(cnt % 20000 == 0 ){
          println(cnt)
          Thread.sleep(5000)
        }
      })
    }catch {
      case e:Exception => e.printStackTrace()
    }finally {
      if(connection != null){
        connection.close()
      }
    }
  })
  rsDs.unpersist
  ds.unpersist
}


def  doRangeByMana(arr:Array[(Int, Int)]):Unit = {
  arr.foreach(ms =>{
    println(ms._1)
    doAnalysis("2021-12-29","2022-01-29",ms._1,ms._2)
  })
}

doRangeByMana(manaArr)


