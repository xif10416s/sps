let fs = require('fs');
let path = require('path');

let del  = (url)=>{
  //获得所有文件
  let arr = fs.readdirSync(url);
  //循环所有文件
  arr.forEach((x)=>{
    //组合文件路径
    let fileurl = path.resolve(url,x);
    //获得文件的详细信息
    let xinxi =  fs.statSync(fileurl);
    // 判断
    if(xinxi.isFile()){
      // fs.unlinkSync(fileurl);//是文件删除
      if(fileurl.indexOf(".log.") != -1) {

        const fa =  fileurl.split(".")
        if(parseInt(fa[fa.length-1]) >=2) {
          console.log("file :",fileurl)
          fs.unlinkSync(fileurl);//是文件删除
        }
      }
    }else if(xinxi.isDirectory()){
      del(fileurl)
    }
  })

}

del("D:\\source\\python\\spsAuto\\splinterlands-bot\\logs");