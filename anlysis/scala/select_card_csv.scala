/**
  * @Author: fei
  * @Date: 2022/6/17 0017
  */
val dataDir = "/mnt/f/battleData"
case class Item(mana_cap:Int , ruleset:String, summoner_id:Int ,monster_1_id:Int,monster_2_id:Int,monster_3_id:Int,monster_4_id:Int,monster_5_id:Int,monster_6_id:Int,summoner_id_lost:Int,monster_1_id_lost:Int,monster_2_id_lost:Int,monster_3_id_lost:Int,monster_4_id_lost:Int,monster_5_id_lost:Int,monster_6_id_lost:Int)
case class Ids(id:Int)
case class Stat(id:Int ,cnt:Double)
// ---- by cs end
import java.io.File
def getListOfFiles(dir: String):List[String] = {
  val d = new File(dir)
  if (d.exists && d.isDirectory) {
    d.listFiles.filter(_.isFile).map(_.getCanonicalPath()).toList
  } else {
    List[String]()
  }
}

val colum_names = Seq("mana_cap","ruleset" , "summoner_id","monster_1_id","monster_2_id","monster_3_id","monster_4_id","monster_5_id","monster_6_id" , "summoner_id_lost" ,"monster_1_id_lost" , "monster_2_id_lost" ,"monster_3_id_lost" ,"monster_4_id_lost" ,"monster_5_id_lost" ,"monster_6_id_lost")// this is example define exact number of columns
val listFiles = getListOfFiles(dataDir)
var jdbcDf = spark.read.option("inferSchema","true").option("header", "false").csv(listFiles(0))
jdbcDf = jdbcDf.toDF(colum_names:_*)
for(i <- 1 to listFiles.length -1 ) {
  var tempDf = spark.read.option("inferSchema","true").option("header", "false").csv(listFiles(i))
  tempDf = tempDf.toDF(colum_names:_*)
  jdbcDf = jdbcDf.union(tempDf)
}
val ds = jdbcDf.as[Item]
ds.cache()
println(ds.count())

val winIds= ds.flatMap(x => {
  Array(Ids(x.summoner_id),Ids(x.monster_1_id),Ids(x.monster_2_id),Ids(x.monster_3_id),Ids(x.monster_4_id),Ids(x.monster_5_id),Ids(x.monster_6_id)).filter(y => {y.id>0})
}).groupBy("id").count()

val lostIds= ds.flatMap(x => {
  Array(Ids(x.summoner_id_lost),Ids(x.monster_1_id_lost),Ids(x.monster_2_id_lost),Ids(x.monster_3_id_lost),Ids(x.monster_4_id_lost),Ids(x.monster_5_id_lost),Ids(x.monster_6_id_lost)).filter(y => {y.id>0})
}).groupBy("id").count()

val  rsDs = winIds.join(lostIds,winIds("id") === lostIds("id"))

rsDs.map(x =>Stat(x.getInt(0), (x.getLong(1) - x.getLong(3) + 0.0) / (x.getLong(1) + x.getLong(3)))).sort(desc("cnt")).limit(150).write.json(dataDir+"sort_card.json")

