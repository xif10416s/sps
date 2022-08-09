const dbUtils = require('../../db/script/dbUtils');
const fs = require('fs');

const battStBasePath = "F:\\battleDataStat\\battle\\battleSt\\"
const csStBasePath = "F:\\battleDataStat\\battle\\CsSt\\"

const battStSqlTmp = "load data infile '{p}' into table battle_stat_v1 Fields TERMINATED by ','  (startMana,endMana,cs,len,rule,summonerId,teams,totalCnt,lostTeams,lostTotalCnt)"
const csStSqlTmp = "load data infile '{p}' into table battle_stat_cs_ls_v1 Fields TERMINATED by ','  (startMana,endMana,rule, wcs,wlen, lcs,llen,count)"
// ALTER TABLE battle_stat_v5 TRUNCATE PARTITION P17;
async function doMove(type) {
  let path = battStBasePath;
  let sqlTmp = battStSqlTmp;
  if (type == "cs") {
    path = csStBasePath;
    sqlTmp = csStSqlTmp;
  }
  console.log(path)
  fs.readdir(path, {withFileTypes: true}, (error, files) => {
    if (error) {
      throw error;
    }
    const directoriesInDIrectory = files
    .filter((item) => item.isDirectory())
    .map((item) => item.name);
    directoriesInDIrectory.forEach(dir => {
      console.log(dir)
      fs.readdir(path + dir, (error, files) => {
            if (error) {
              throw error;
            }
            const targetFile = files.filter((item) => item.endsWith(".csv"))[0];
            console.log(targetFile)
            fs.readFile(path + dir + "/" + targetFile, function (err, data) {
              if (err) {
                console.log("error")
                return;
              }
              fs.writeFile("F:\\" + type + "_" + dir, data, function (error) {
                if (error) {
                  console.log("error")
                }
              })
            });
          }
      );

    })
  });
}

async function doImport(type) {
  let sqlTmp = battStSqlTmp;
  if (type == "cs") {
    sqlTmp = csStSqlTmp;
  }
  console.log(sqlTmp)

  const getFiles = function (callback) {
    fs.readdir("F:\\", (error, files) => {
      if (error) {
        throw error;
      }
      const targetFiles = files.filter(
          (item) => item.startsWith(type) && item.endsWith("txt"));
      callback(targetFiles)
    });
  }

  getFiles(async (files) => {
    console.log(files)
    function wait(ms) {
      return new Promise(resolve =>setTimeout(() =>resolve(), ms));
    };



    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const sql = sqlTmp.replace("{p}", "F:" + file)
      console.log(sql + " " + new Date().toLocaleTimeString())
      await dbUtils.sqlQuery(sql, [])
      console.log(file +" --- end -- wait start"+ new Date().toLocaleTimeString())
      await wait(3000);
      console.log(file +" --- end -- wait end"+ new Date().toLocaleTimeString())
    }
    dbUtils.pool.end(function (err) {
      // 所有的连接都已经被关闭
    });
  })

  console.log("----")

  // const targetFiles = await fs.readdir("F:\\", async (error, files) => {
  //       if (error) throw error;
  //       const targetFiles = files.filter((item) => item.startsWith(type) && item.endsWith("txt"));
  //       // console.log(targetFiles)
  //       // for (let i = 0; i < targetFiles.length; i++) {
  //       //   const file = targetFiles[i];
  //       //   const sql = sqlTmp.replace("{p}","F:\\"+file)
  //       //   console.log(sql)
  //       //   await dbUtils.sqlQuery(sql,[])
  //       // }
  //       return targetFiles
  //     }
  // );

  // console.log(targetFiles)
}

(async () => {
  // await doMove("bat");
  // await doImport("bat");
  // await doMove("cs");
  await doImport("cs");
})()