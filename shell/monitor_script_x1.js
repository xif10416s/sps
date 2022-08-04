function Main() {
  doOpen("xifei123")
}

function doOpen(name){
  xsh.Session.Open("ssh://xifei:xifei@127.0.0.1")
  xsh.Session.TabText = "x1"
  xsh.Session.Sleep(1000)
  xsh.Screen.Send("cd /mnt/d/source/python/spsAuto/splinterlands-bot/ &&  tail -f ---disable-inotify logs/"+name+"/"+name+".log")
  xsh.Screen.Send(String.fromCharCode(13))
}